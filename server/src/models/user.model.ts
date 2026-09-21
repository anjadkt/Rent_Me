import { Schema, model, Document } from "mongoose";
import { UserRole } from "../types/auth.types.js";

export interface IUser extends Document {
  name: string;
  email: string;
  avatar?: string;

  googleId?: string;

  role: UserRole;

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    avatar: {
      type: String,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>("User", userSchema);