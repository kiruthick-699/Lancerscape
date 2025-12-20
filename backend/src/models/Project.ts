import { Schema, model, models, Types } from "mongoose";

export interface IProject {
  address: string; // on-chain project contract address
  title?: string;
  clientAddress: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    address: { type: String, required: true, index: true, lowercase: true, trim: true },
    title: { type: String, required: false, trim: true },
    clientAddress: { type: String, required: true, lowercase: true, trim: true },
  },
  { timestamps: true }
);

export const Project = models.Project || model<IProject>("Project", ProjectSchema);
