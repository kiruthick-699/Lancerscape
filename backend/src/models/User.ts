import { Schema, model, models } from "mongoose";

export type UserRole = "client" | "freelancer" | "admin";

export interface IUser {
  address: string;
  email?: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    address: { type: String, required: true, index: true, lowercase: true, trim: true },
    email: { type: String, required: false, trim: true },
    role: { type: String, required: true, enum: ["client", "freelancer", "admin"], default: "freelancer" },
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>("User", UserSchema);
