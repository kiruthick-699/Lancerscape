import { Schema, model, models } from "mongoose";

export type DisputeStatus = "Pending" | "EvidenceSubmitted" | "AI_SummaryGenerated" | "AdminReview" | "Resolved";

export interface IDispute {
  projectId: string; // project contract address
  milestoneId: number;
  openedBy: string; // wallet address
  reason: string;
  status: DisputeStatus;
  aiSummary?: string;
  resolvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const DisputeSchema = new Schema<IDispute>(
  {
    projectId: { type: String, required: true, index: true, lowercase: true, trim: true },
    milestoneId: { type: Number, required: true },
    openedBy: { type: String, required: true, lowercase: true, trim: true },
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "EvidenceSubmitted", "AI_SummaryGenerated", "AdminReview", "Resolved"],
      default: "Pending",
    },
    aiSummary: { type: String, required: false },
    resolvedAt: { type: Date, required: false },
  },
  { timestamps: true }
);

DisputeSchema.index({ projectId: 1, milestoneId: 1 });

export const Dispute = models.Dispute || model<IDispute>("Dispute", DisputeSchema);
