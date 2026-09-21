import { Request, Response } from "express";
import { Vehicle } from "../models/vehicle.model.js";
import {
  VehicleCategory,
  VehicleStatus,
} from "../types/vehicle.types.js";
import AppError from "../utils/appError.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary.js";

export const getVehicles = async (req: Request, res: Response) => {
  
  const {
    search,
    category,
    status,
    isActive,
    page = "1",
    limit = "20",
  } = req.query;

  const currentPage = Math.max(Number(page), 1);

  const itemsPerPage = Math.min(
    Math.max(Number(limit), 1),
    100
  );

  const skip =
    (currentPage - 1) * itemsPerPage;

  const filter: Record<string, unknown> = {};

  // Search
  if (search && typeof search === "string") {
    filter.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        brand: {
          $regex: search,
          $options: "i",
        },
      },
      {
        modelName: {
          $regex: search,
          $options: "i",
        },
      },
      {
        registrationNumber: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  // Category
  if (
    category &&
    Object.values(VehicleCategory).includes(
      category as VehicleCategory
    )
  ) {
    filter.category = category;
  }

  // Status
  if (
    status &&
    Object.values(VehicleStatus).includes(
      status as VehicleStatus
    )
  ) {
    filter.status = status;
  }

  // Active / inactive
  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  const [vehicles, total] = await Promise.all([
    Vehicle.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(itemsPerPage)
      .lean(),

    Vehicle.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(
    total / itemsPerPage
  );

  return res.status(200).json({
    success: true,
    data: vehicles,
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

export const createVehicle = async (req: Request, res: Response) => {

  const {
    name,
    category,
    brand,
    modelName,
    registrationNumber,
    description,
    pricePerHour,
    pricePerDay,
    securityDeposit,
    specifications,
  } = req.body;

  const files = req.files as Express.Multer.File[];

  // Required field validation
  if (!name) {
    throw new AppError(400, "Vehicle name is required");
  }

  if (!category) {
    throw new AppError(400, "Vehicle category is required");
  }

  if (!Object.values(VehicleCategory).includes(category)) {
    throw new AppError(400, "Invalid vehicle category");
  }

  // Upload images to Cloudinary
  const uploadedImages = await Promise.all(
    files.map((file) =>
      uploadToCloudinary(file.buffer, "vehicle-rental/vehicles")
    )
  );

  const images = uploadedImages.map((image) => ({
    url: image.secure_url,
    publicId : image.public_id
  }));

  if (pricePerHour === undefined || pricePerHour === null) {
    throw new AppError(400, "Price per hour is required");
  }

  if (pricePerDay === undefined || pricePerDay === null) {
    throw new AppError(400, "Price per day is required");
  }

  const vehicle = await Vehicle.create({
    name,
    category,
    brand,
    modelName,
    registrationNumber,
    description,
    images,
    pricePerHour,
    pricePerDay,
    securityDeposit,
    specifications,
  
    // System controlled fields
    status: VehicleStatus.AVAILABLE,
    isActive: true,
  });

  return res.status(201).json({
    success: true,
    message: "Vehicle created successfully",
    data: vehicle,
  });

};

export const updateVehicle = async (req: Request, res: Response) => {
  
  const { vehicleId } = req.params;

  const {
    name,
    category,
    brand,
    modelName,
    registrationNumber,
    description,
    images,
    pricePerHour,
    pricePerDay,
    securityDeposit,
    status,
    isActive,
    specifications,
    removeImageIds
  } = req.body;

  // Check vehicle exists
  const vehicle = await Vehicle.findById(vehicleId);

  if (!vehicle) {
    throw new AppError(404, "Vehicle not found");
  }

  // Validate category if provided
  if (
    category !== undefined &&
    !Object.values(VehicleCategory).includes(category)
  ) {
    throw new AppError(400, "Invalid vehicle category");
  }

  // Validate status if provided
  if (
    status !== undefined &&
    !Object.values(VehicleStatus).includes(status)
  ) {
    throw new AppError(400, "Invalid vehicle status");
  }

  // Validate images if provided
  if (images !== undefined) {
    if (!Array.isArray(images) || images.length === 0) {
      throw new AppError(400, "At least one vehicle image is required");
    }
  }

  // Validate numeric fields
  if (pricePerHour !== undefined && pricePerHour < 0) {
    throw new AppError(400, "Price per hour cannot be negative");
  }

  if (pricePerDay !== undefined && pricePerDay < 0) {
    throw new AppError(400, "Price per day cannot be negative");
  }

  if (securityDeposit !== undefined && securityDeposit < 0) {
    throw new AppError(400, "Security deposit cannot be negative");
  }

  // Update only fields provided by the admin
  if (name !== undefined) vehicle.name = name;
  if (category !== undefined) vehicle.category = category;
  if (brand !== undefined) vehicle.brand = brand;
  if (modelName !== undefined) vehicle.modelName = modelName;
  if (registrationNumber !== undefined) {
    vehicle.registrationNumber = registrationNumber;
  }
  if (description !== undefined) vehicle.description = description;
  if (images !== undefined) vehicle.images = images;
  if (pricePerHour !== undefined) vehicle.pricePerHour = pricePerHour;
  if (pricePerDay !== undefined) vehicle.pricePerDay = pricePerDay;
  if (securityDeposit !== undefined) {
    vehicle.securityDeposit = securityDeposit;
  }
  if (status !== undefined) vehicle.status = status;
  if (isActive !== undefined) vehicle.isActive = isActive;
  if (specifications !== undefined) {
    vehicle.specifications = specifications;
  }

  // -----------------------------
  // Remove old images
  // -----------------------------

  if (removeImageIds) {
    const imageIds: string[] = Array.isArray(removeImageIds)
      ? removeImageIds
      : JSON.parse(removeImageIds);

    const imagesToRemove = vehicle.images.filter((image) =>
      imageIds.includes(image.publicId)
    );

    await Promise.all(
      imagesToRemove.map((image) =>
        deleteFromCloudinary(image.publicId)
      )
    );

    vehicle.images = vehicle.images.filter(
      (image) => !imageIds.includes(image.publicId)
    );
  }

  // -----------------------------
  // Upload new images
  // -----------------------------

  const files = req.files as Express.Multer.File[];

  if (files && files.length > 0) {
    const uploadedImages = await Promise.all(
      files.map((file) =>
        uploadToCloudinary(
          file.buffer,
          "vehicle-rental/vehicles"
        )
      )
    );

    const newImages = uploadedImages.map((image) => ({
      url: image.secure_url,
      publicId: image.public_id,
    }));

    vehicle.images.push(...newImages);
  }

  if (vehicle.images.length === 0) {
    throw new AppError(
      400,
      "Vehicle must have at least one image"
    );
  }

  await vehicle.save();

  return res.status(200).json({
    success: true,
    message: "Vehicle updated successfully",
    data: vehicle,
  });
};

export const deleteVehicle = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;

  const vehicle = await Vehicle.findById(vehicleId);

  if (!vehicle) {
    throw new AppError(404, "Vehicle not found");
  }

  // Don't allow deleting a currently rented vehicle
  if (vehicle.status === VehicleStatus.RENTED) {
    throw new AppError(
      400,
      "Cannot delete a vehicle that is currently rented"
    );
  }

  // Soft delete
  vehicle.isActive = false;
  vehicle.status = VehicleStatus.INACTIVE;

  await vehicle.save();

  return res.status(200).json({
    success: true,
    message: "Vehicle deleted successfully",
  });
};

