import { Request, Response } from "express";
import { PaymentStatus, RentalStatus } from "../types/rental.types.js";
import { VehicleStatus } from "../types/vehicle.types.js";
import AppError from "../utils/appError.js";
import { Vehicle } from "../models/vehicle.model.js";
import { Rental } from "../models/rental.model.js";
import { RentalLog } from "../models/rental-log.model.js";
import { env } from "../config/env.js";
import razorpay from "../config/razorpay.js";
import crypto from "crypto"


export const createRental = async ( req: Request,res: Response ) => {

  const userId = req.user?._id;

  if (!userId) {
    throw new AppError(401, "Authentication required");
  }

  const {
    vehicleId,
    dates,
  } = req.body;

  // -----------------------------
  // Validate required fields
  // -----------------------------

  if (!vehicleId) {
    throw new AppError(400, "Vehicle ID is required");
  }

  if (!dates || !Array.isArray(dates) || dates.length === 0) {
    throw new AppError(400, "Please provide an array of dates to book");
  }

  // Find vehicle
  const vehicle = await Vehicle.findOne({
    _id: vehicleId,
    isActive: true,
    status: VehicleStatus.AVAILABLE,
  });

  if (!vehicle) {
    throw new AppError(
      404,
      "Vehicle is not available for rental"
    );
  }

  // Calculate and validate dates
  const parsedDates = dates.map(d => new Date(d));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const d of parsedDates) {
    if (Number.isNaN(d.getTime())) {
      throw new AppError(400, "One or more dates are invalid");
    }
    // Normalize to midnight
    d.setHours(0, 0, 0, 0);
    if (d < today) {
      throw new AppError(400, "Cannot book dates in the past");
    }
  }

  // Deduplicate dates
  const uniqueDates = Array.from(new Set(parsedDates.map(d => d.getTime()))).map(t => new Date(t));
  const rentalDuration = uniqueDates.length;

  // Check overlapping rentals
  const overlappingRental = await Rental.findOne({
    vehicle: vehicle._id,

    status: {
      $in: [
        RentalStatus.ACTIVE,
      ],
    },

    dates: {
      $in: uniqueDates,
    },
  });

  if (overlappingRental) {
    throw new AppError(
      409,
      "Vehicle is already booked for one or more of the selected dates"
    );
  }

  // Calculate price
  const rentalAmount = vehicle.pricePerDay * rentalDuration;

  const securityDeposit =
    vehicle.securityDeposit ?? 0;

  const totalAmount =
    rentalAmount + securityDeposit;

  // Create rental snapshot
  const rental = await Rental.create({
    user: userId,

    vehicle: vehicle._id,

    vehicleSnapshot: {
      name: vehicle.name,
      category: vehicle.category,
      brand: vehicle.brand,
      modelName: vehicle.modelName,
      registrationNumber:
        vehicle.registrationNumber,
      image: vehicle.images?.[0]?.url,
    },

    dates: uniqueDates,

    duration: rentalDuration,

    priceSnapshot: {
      pricePerDay: vehicle.pricePerDay,
      securityDeposit,
      rentalAmount,
      totalAmount,
    },

    expireAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Automatically delete after 5 days if left pending

    status: RentalStatus.PENDING,

    paymentStatus: PaymentStatus.PENDING,
  });

  const razorpayOrder = await razorpay.orders.create({

    amount: Math.round(totalAmount * 100),
    currency: "INR",
    receipt: rental._id.toString(),
  
    notes: {
      rentalId: rental._id.toString(),
      userId: userId.toString(),
      vehicleId: vehicle._id.toString(),
    },
  });

  rental.razorpayOrderId = razorpayOrder.id;

  await rental.save();  

  return res.status(201).json({
  success: true,
  message: "Rental created successfully",
  data: {
    rentalId: rental._id,

    razorpay: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
    },
  });
};

export const verifyRentalPayment = async (req: Request, res: Response) => {

  const userId = req.user?._id;

  if (!userId) {
    throw new AppError(401, "Authentication required");
  }

  const { rentalId } = req.params;

  const {
    razorpayPaymentId,
    razorpayOrderId,
    razorpaySignature,
  } = req.body;

  if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
    throw new AppError(400, "Payment verification details are required");
  }

  const rental = await Rental.findOne({
    _id: rentalId,
    user: userId,
  });

  if (!rental) {
    throw new AppError(404, "Rental not found");
  }

  if (rental.razorpayOrderId !== razorpayOrderId) {
    throw new AppError(400, "Invalid Razorpay order");
  }

  const generatedSignature = crypto
    .createHmac(
      "sha256",
      env.razorpayKeySecret
    )
    .update(
      `${razorpayOrderId}|${razorpayPaymentId}`
    )
    .digest("hex");

  if (generatedSignature !== razorpaySignature) {
    throw new AppError(400, "Payment verification failed");
  }

  rental.razorpayPaymentId =
    razorpayPaymentId;

  rental.paymentStatus =
    PaymentStatus.PAID;

  rental.status = RentalStatus.ACTIVE;
  
  rental.expireAt = undefined;

  await rental.save();

  return res.status(200).json({
    success: true,
    message: "Payment verified successfully",
    data: {
      rentalId: rental._id,
      paymentStatus: rental.paymentStatus,
    },
  });
};

export const getRentals = async (req: Request, res: Response) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new AppError(401, "Authentication required");
  }

  // Fetch all rentals for the user, sorted by most recent
  const rentals = await Rental.find({ user: userId })
    .populate("logs")
    .sort({ createdAt: -1 });

  // Separate into active and past (inactive) rentals
  const activeRentals = rentals.filter(
    (rental) => rental.status === RentalStatus.ACTIVE
  );

  const pastRentals = rentals.filter(
    (rental) =>
      rental.status === RentalStatus.COMPLETED ||
      rental.status === RentalStatus.CANCELLED ||
      rental.status === RentalStatus.REJECTED
  );

  return res.status(200).json({
    success: true,
    data: {
      active: activeRentals,
      past: pastRentals,
    },
  });
};

export const getAllRentals = async (req: Request, res: Response) => {

  const {
    search,
    status,
    paymentStatus,
    fromDate,
    toDate,
    sort = "latest",
    page = "1",
    limit = "20",
  } = req.query;

  // Pagination
  const currentPage = Math.max(Number(page), 1);

  const itemsPerPage = Math.min(
    Math.max(Number(limit), 1),
    100
  );

  const skip =
    (currentPage - 1) * itemsPerPage;

  // Validate filters
  if (
    status &&
    !Object.values(RentalStatus).includes(
      status as RentalStatus
    )
  ) {
    throw new AppError(400, "Invalid rental status");
  }

  if (
    paymentStatus &&
    !Object.values(PaymentStatus).includes(
      paymentStatus as PaymentStatus
    )
  ) {
    throw new AppError(
      400,
      "Invalid payment status"
    );
  }



  // Match filter
  const matchFilter: Record<string, any> = {};

  if (status) {
    matchFilter.status = status;
  }

  if (paymentStatus) {
    matchFilter.paymentStatus = paymentStatus;
  }



  // Date filtering
  if (fromDate || toDate) {

    matchFilter.createdAt = {};

    if (fromDate) {
      const startDate = new Date(fromDate as string);

      if (Number.isNaN(startDate.getTime())) {
        throw new AppError(400, "Invalid fromDate");
      }

      matchFilter.createdAt.$gte = startDate;
    }

    if (toDate) {
      const endDate = new Date(toDate as string);

      if (Number.isNaN(endDate.getTime())) {
        throw new AppError(400, "Invalid toDate");
      }

      endDate.setHours(23, 59, 59, 999);

      matchFilter.createdAt.$lte = endDate;
    }
  }

  // Aggregation
  const pipeline: any[] = [
    {
      $match: matchFilter,
    },

    // Get user information
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },

    {
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "rentallogs",
        localField: "_id",
        foreignField: "rental",
        as: "logs",
      },
    },
  ];

  // Search
  if (search && typeof search === "string") {
    pipeline.push({
      $match: {
        $or: [
          {
            "vehicleSnapshot.name": {
              $regex: search,
              $options: "i",
            },
          },
          {
            "vehicleSnapshot.brand": {
              $regex: search,
              $options: "i",
            },
          },
          {
            "vehicleSnapshot.modelName": {
              $regex: search,
              $options: "i",
            },
          },
          {
            "vehicleSnapshot.registrationNumber": {
              $regex: search,
              $options: "i",
            },
          },
          {
            "user.name": {
              $regex: search,
              $options: "i",
            },
          },
          {
            "user.email": {
              $regex: search,
              $options: "i",
            },
          },
        ],
      },
    });
  }

  // Sorting
  if (sort === "latest") {
    pipeline.push({
      $set: {
        statusPriority: {
          $cond: [
            {
              $eq: ["$status", RentalStatus.ACTIVE],
            },
            0,
            1,
          ],
        },
      },
    });

    pipeline.push({
      $sort: {
        statusPriority: 1,
        createdAt: -1,
      },
    });
  }

  if (sort === "oldest") {
    pipeline.push({
      $sort: {
        createdAt: 1,
      },
    });
  }

  if (sort === "newest") {
    pipeline.push({
      $sort: {
        createdAt: -1,
      },
    });
  }

  if (sort === "start_latest") {
    pipeline.push({
      $sort: {
        dates: -1,
      },
    });
  }

  if (sort === "start_earliest") {
    pipeline.push({
      $sort: {
        dates: 1,
      },
    });
  }

  // Pagination + data
  pipeline.push({
    $facet: {
      data: [
        {
          $skip: skip,
        },
        {
          $limit: itemsPerPage,
        },
        {
          $project: {
            statusPriority: 0,

            "user.password": 0,
            "user.googleId": 0,
            "user.__v": 0,
          },
        },
      ],

      totalCount: [
        {
          $count: "count",
        },
      ],
    },
  });

  const [result] = await Rental.aggregate(
    pipeline
  );

  const rentals = result?.data ?? [];

  const total =
    result?.totalCount?.[0]?.count ?? 0;

  const totalPages = Math.ceil(
    total / itemsPerPage
  );

  return res.status(200).json({
    success: true,
    data: rentals,

    pagination: {
      total,
      page: currentPage,
      limit: itemsPerPage,
      totalPages,
      hasNextPage:
        currentPage < totalPages,
      hasPreviousPage:
        currentPage > 1,
    },
  });
};

export const getRentalById = async (
  req: Request,
  res: Response
) => {
  const { rentalId } = req.params;

  if (!rentalId) {
    throw new AppError(400, "Rental ID is required");
  }

  const rental = await Rental.findById(rentalId)
    .populate({
      path: "user",
      select: "-password -__v",
    })
    .populate({
      path: "vehicle",
      select: "-__v",
    })
    .populate("logs")
    .lean();

  if (!rental) {
    throw new AppError(404, "Rental not found");
  }

  return res.status(200).json({
    success: true,
    data: rental,
  });
};

export const rejectRental = async (req: Request, res: Response) => {
  const { rentalId } = req.params;
  const { notes } = req.body;

  if (!notes) {
    throw new AppError(400, "Notes are required to reject a rental");
  }

  const rental = await Rental.findById(rentalId);
  if (!rental) throw new AppError(404, "Rental not found");

  if (rental.status !== RentalStatus.ACTIVE && rental.status !== RentalStatus.PENDING) {
    throw new AppError(400, "Can only reject active or pending rentals");
  }

  if (rental.razorpayPaymentId && rental.paymentStatus === PaymentStatus.PAID) {
    try {
      await razorpay.payments.refund(rental.razorpayPaymentId, {});
      rental.paymentStatus = PaymentStatus.REFUNDED;
    } catch (error: any) {
      console.error("Refund failed:", error);
      throw new AppError(500, "Failed to process refund: " + error.error?.description || error.message);
    }
  }

  rental.status = RentalStatus.REJECTED;
  rental.expireAt = undefined;
  await rental.save();

  await RentalLog.create({
    rental: rental._id,
    action: "REJECTED",
    notes
  });

  return res.status(200).json({ success: true, message: "Rental rejected and fully refunded" });
};

export const cancelRental = async (req: Request, res: Response) => {
  const { rentalId } = req.params;
  const { notes } = req.body;

  if (!notes) {
    throw new AppError(400, "Notes are required to cancel a rental");
  }

  const rental = await Rental.findById(rentalId);
  if (!rental) throw new AppError(404, "Rental not found");

  if (rental.status !== RentalStatus.ACTIVE) {
    throw new AppError(400, "Can only cancel active rentals");
  }

  if (rental.razorpayPaymentId && rental.paymentStatus === PaymentStatus.PAID) {
    const deduction = rental.priceSnapshot.rentalAmount * 0.1;
    const refundAmount = rental.priceSnapshot.totalAmount - deduction;
    
    try {
      await razorpay.payments.refund(rental.razorpayPaymentId, {
        amount: Math.round(refundAmount * 100)
      });
      rental.paymentStatus = PaymentStatus.REFUNDED; // Represents fully resolved from customer perspective
    } catch (error: any) {
      console.error("Refund failed:", error);
      throw new AppError(500, "Failed to process refund: " + error.error?.description || error.message);
    }
  }

  rental.status = RentalStatus.CANCELLED;
  await rental.save();

  await RentalLog.create({
    rental: rental._id,
    action: "CANCELLED",
    notes
  });

  return res.status(200).json({ success: true, message: "Rental cancelled with 10% deduction" });
};

export const completeRental = async (req: Request, res: Response) => {
  const { rentalId } = req.params;
  const { notes } = req.body;

  if (!notes) {
    throw new AppError(400, "Notes are required to complete a rental");
  }

  const rental = await Rental.findById(rentalId);
  if (!rental) throw new AppError(404, "Rental not found");

  if (rental.status !== RentalStatus.ACTIVE) {
    throw new AppError(400, "Can only complete active rentals");
  }

  if (rental.razorpayPaymentId && rental.paymentStatus === PaymentStatus.PAID && rental.priceSnapshot.securityDeposit > 0) {
    const refundAmount = rental.priceSnapshot.securityDeposit;
    
    try {
      await razorpay.payments.refund(rental.razorpayPaymentId, {
        amount: Math.round(refundAmount * 100)
      });
      // We don't change paymentStatus to REFUNDED because the rental fee was collected.
    } catch (error: any) {
      console.error("Refund failed:", error);
      throw new AppError(500, "Failed to process refund: " + error.error?.description || error.message);
    }
  }

  rental.status = RentalStatus.COMPLETED;
  await rental.save();

  await RentalLog.create({
    rental: rental._id,
    action: "COMPLETED",
    notes
  });

  return res.status(200).json({ success: true, message: "Rental completed and security deposit refunded" });
};