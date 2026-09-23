import mongoose, { Document, Schema, Types } from "mongoose";
import {
  PaymentStatus,
  RentalStatus,
} from "../types/rental.types.js";
import { VehicleCategory } from "../types/vehicle.types.js";

export interface IRentalVehicleSnapshot {
  name: string;
  category: VehicleCategory;
  brand?: string;
  modelName?: string;
  registrationNumber?: string;
  image?: string;
}

export interface IRentalPriceSnapshot {
  pricePerDay: number;
  securityDeposit: number;
  rentalAmount: number;
  totalAmount: number;
}

export interface IRental extends Document {
  user: Types.ObjectId;
  vehicle: Types.ObjectId;

  vehicleSnapshot: IRentalVehicleSnapshot;

  dates: Date[];

  duration: number;

  priceSnapshot: IRentalPriceSnapshot;

  status: RentalStatus;

  razorpayOrderId?: string;
  razorpayPaymentId?: string;

  paymentStatus: PaymentStatus;

  notes?: string;

  expireAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const rentalVehicleSnapshotSchema =
  new Schema<IRentalVehicleSnapshot>(
    {
      name: {
        type: String,
        required: true,
      },

      category: {
        type: String,
        enum: Object.values(VehicleCategory),
        required: true,
      },

      brand: String,

      modelName: String,

      registrationNumber: String,

      image: String,
    },
    { _id: false }
  );

const rentalPriceSnapshotSchema =
  new Schema<IRentalPriceSnapshot>(
    {
      pricePerDay: {
        type: Number,
        required: true,
      },

      securityDeposit: {
        type: Number,
        required: true,
        default: 0,
      },

      rentalAmount: {
        type: Number,
        required: true,
      },

      totalAmount: {
        type: Number,
        required: true,
      },
    },
    { _id: false }
  );

const rentalSchema = new Schema<IRental>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    vehicle: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    vehicleSnapshot: {
      type: rentalVehicleSnapshotSchema,
      required: true,
    },

    dates: {
      type: [Date],
      required: true,
      validate: {
        validator: function(v: Date[]) {
          return v && v.length > 0;
        },
        message: 'A rental must have at least one date'
      }
    },

    duration: {
      type: Number,
      required: true,
      min: 1,
    },

    priceSnapshot: {
      type: rentalPriceSnapshotSchema,
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(RentalStatus),
      default: RentalStatus.PENDING,
    },

    razorpayOrderId: {
      type: String,
    },

    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },

    notes: {
      type: String,
      trim: true,
    },
    
    expireAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

rentalSchema.index({
  vehicle: 1,
  dates: 1,
});

// TTL index to automatically delete documents when expireAt is reached
rentalSchema.index(
  { expireAt: 1 },
  { expireAfterSeconds: 0 }
);

export const Rental = mongoose.model<IRental>(
  "Rental",
  rentalSchema
);