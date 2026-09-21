import { Schema, model, Document } from "mongoose";

import {
  VehicleCategory,
  VehicleStatus,
} from "../types/vehicle.types.js";

export interface IVehicle extends Document {
  name: string;

  category: VehicleCategory;

  brand?: string;

  modelName?: string;

  registrationNumber?: string;

  description?: string;

  images: {
    url: string,
    publicId:string
  }[];

  pricePerHour: number;

  pricePerDay: number;

  securityDeposit?: number;

  status: VehicleStatus;

  isActive: boolean;

  specifications?: {
    gears?: number;
    batteryCapacity?: string;
    range?: number;
    maxSpeed?: number;
    color?: string;
    wheelSize?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: Object.values(VehicleCategory),
      required: true,
      index: true,
    },

    brand: {
      type: String,
      trim: true,
    },

    modelName: {
      type: String,
      trim: true,
    },

    registrationNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },

    description: {
      type: String,
      trim: true,
    },

    images: {
      type: [{
        url: String,
        publicId:String
      }],
      default: [],
    },

    pricePerHour: {
      type: Number,
      required: true,
      min: 0,
    },

    pricePerDay: {
      type: Number,
      required: true,
      min: 0,
    },

    securityDeposit: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: Object.values(VehicleStatus),
      default: VehicleStatus.AVAILABLE,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    specifications: {
      gears: Number,
      batteryCapacity: String,
      range: Number,
      maxSpeed: Number,
      color: String,
      wheelSize: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Vehicle = model<IVehicle>(
  "Vehicle",
  vehicleSchema
);