import { Schema, model, models, Types } from "mongoose";

export type MilestoneStatus = "Created" | "Funded" | "Submitted" | "Approved" | "Disputed" | "Resolved";

export interface IMilestone {
  project: string; // project contract address
  milestoneId: number;
  amount?: string; // store as string to avoid precision issues
  status: MilestoneStatus;
  evidenceHash?: string; // IPFS CID or similar
  createdAt?: Date;
  updatedAt?: Date;
}

const MilestoneSchema = new Schema<IMilestone>(
  {
    project: { type: String, required: true, index: true, lowercase: true, trim: true },
    milestoneId: { type: Number, required: true, index: true },
    amount: { type: String, required: false },
    status: { type: String, required: true, enum: ["Created", "Funded", "Submitted", "Approved", "Disputed", "Resolved"], default: "Created" },
    evidenceHash: { type: String, required: false },
  },
  { timestamps: true }
);

MilestoneSchema.index({ project: 1, milestoneId: 1 }, { unique: true });

export const Milestone = models.Milestone || model<IMilestone>("Milestone", MilestoneSchema);
