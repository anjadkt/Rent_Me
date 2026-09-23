import mongoose, { Document, Schema, Types } from "mongoose";

export interface IRentalLog extends Document {
  rental: Types.ObjectId;
  action: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const rentalLogSchema = new Schema<IRentalLog>(
  {
    rental: {
      type: Schema.Types.ObjectId,
      ref: "Rental",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries by rental ID
rentalLogSchema.index({ rental: 1 });

export const RentalLog = mongoose.model<IRentalLog>("RentalLog", rentalLogSchema);
