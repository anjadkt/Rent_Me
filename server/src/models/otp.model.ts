import { Document, Schema, model } from "mongoose";

export interface IOtp extends Document {
  email: string;
  name: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    otp: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

otpSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

export const Otp = model<IOtp>("Otp", otpSchema);