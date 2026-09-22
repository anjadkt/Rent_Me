import { Request, Response } from "express";
import { PaymentStatus,RentalStatus,RentalType } from "../types/rental.types.js";
import { VehicleStatus } from "../types/vehicle.types.js";
import AppError from "../utils/appError.js";
import { Vehicle } from "../models/vehicle.model.js";
import { Rental } from "../models/rental.model.js";
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
    rentalType,
    startAt,
    duration,
  } = req.body;

  // -----------------------------
  // Validate required fields
  // -----------------------------

  if (!vehicleId) {
    throw new AppError(400, "Vehicle ID is required");
  }

  if (!rentalType) {
    throw new AppError(400, "Rental type is required");
  }

  if (!Object.values(RentalType).includes(rentalType)) {
    throw new AppError(400, "Invalid rental type");
  }

  if (!startAt) {
    throw new AppError(400, "Rental start time is required");
  }

  if (!duration) {
    throw new AppError(400, "Rental duration is required");
  }

  if (!Number.isInteger(Number(duration)) || Number(duration) <= 0) {
    throw new AppError(
      400,
      "Rental duration must be a positive number"
    );
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

  // Calculate rental period
  const rentalStart = new Date(startAt);

  if (Number.isNaN(rentalStart.getTime())) {
    throw new AppError(400, "Invalid start date");
  }

  if (rentalStart <= new Date()) {
    throw new AppError(
      400,
      "Rental start time must be in the future"
    );
  }

  const rentalDuration = Number(duration);

  const millisecondsPerUnit =
    rentalType === RentalType.HOUR
      ? 60 * 60 * 1000
      : 24 * 60 * 60 * 1000;

  const rentalEnd = new Date(
    rentalStart.getTime() +
      rentalDuration * millisecondsPerUnit
  );

  // Check overlapping rentals
  const overlappingRental = await Rental.findOne({
    vehicle: vehicle._id,

    status: {
      $in: [
        RentalStatus.PENDING,
        RentalStatus.ACTIVE,
      ],
    },

    startAt: {
      $lt: rentalEnd,
    },

    endAt: {
      $gt: rentalStart,
    },
  });

  if (overlappingRental) {
    throw new AppError(
      409,
      "Vehicle is already booked for the selected period"
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

    rentalType,

    startAt: rentalStart,
    endAt: rentalEnd,

    duration: rentalDuration,

    priceSnapshot: {
      pricePerDay: vehicle.pricePerDay,
      securityDeposit,
      rentalAmount,
      totalAmount,
    },

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

  const {
    status,
    rentalType,
    page = "1",
    limit = "10",
  } = req.query;

  // Pagination
  const currentPage = Math.max(Number(page), 1);

  const itemsPerPage = Math.min(
    Math.max(Number(limit), 1),
    50
  );

  const skip =
    (currentPage - 1) * itemsPerPage;

  // Filter
  const filter: Record<string, unknown> = {
    user: userId,
  };

  // Status filter
  if (status) {

    if (!Object.values(RentalStatus).includes(status as RentalStatus)) {
      throw new AppError(400, "Invalid rental status");
    }

    filter.status = status;
  }

  // Rental type filter
  if (rentalType) {

    if (!Object.values(RentalType).includes(rentalType as RentalType)) {
      throw new AppError(400, "Invalid rental type");
    }

    filter.rentalType = rentalType;
  }

  // Get rentals
  const [rentals, total] = await Promise.all([
    Rental.find(filter)
      .sort({
        status: 1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(itemsPerPage)
      .lean(),

    Rental.countDocuments(filter),
  ]);

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
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    },
  });
};

export const getAllRentals = async (req: Request, res: Response) => {

  const {
    search,
    status,
    paymentStatus,
    rentalType,
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

  if (
    rentalType &&
    !Object.values(RentalType).includes(
      rentalType as RentalType
    )
  ) {
    throw new AppError(400, "Invalid rental type");
  }

  // Match filter
  const matchFilter: Record<string, any> = {};

  if (status) {
    matchFilter.status = status;
  }

  if (paymentStatus) {
    matchFilter.paymentStatus = paymentStatus;
  }

  if (rentalType) {
    matchFilter.rentalType = rentalType;
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
        startAt: -1,
      },
    });
  }

  if (sort === "start_earliest") {
    pipeline.push({
      $sort: {
        startAt: 1,
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
    .lean();

  if (!rental) {
    throw new AppError(404, "Rental not found");
  }

  return res.status(200).json({
    success: true,
    data: rental,
  });
};