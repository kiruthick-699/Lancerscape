import { Schema, model, models } from "mongoose";

export interface IEvidence {
  disputeId: string; // Dispute document id or external id
  uploadedBy: string; // wallet address
  filename: string;
  mimeType: string;
  size: number; // bytes
  url?: string; // storage URL
  hash?: string; // IPFS CID or hash
  createdAt?: Date;
  updatedAt?: Date;
}

const EvidenceSchema = new Schema<IEvidence>(
  {
    disputeId: { type: String, required: true, index: true },
    uploadedBy: { type: String, required: true, lowercase: true, trim: true },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: false },
    hash: { type: String, required: false },
  },
  { timestamps: true }
);

export const Evidence = models.Evidence || model<IEvidence>("Evidence", EvidenceSchema);
