/**
 * backend/src/models/disputeTypes.ts
 * 
 * TypeScript interfaces and types for dispute-related data structures
 */

/**
 * Dispute
 * 
 * Represents a dispute record in the system
 */
export interface Dispute {
  /** Unique dispute identifier */
  id?: string;
  
  /** Project contract address or identifier */
  projectId?: string;
  
  /** Milestone ID within the project */
  milestoneId?: number;
  
  /** Wallet address of the user who opened the dispute */
  openedBy?: string;
  
  /** Text description of the dispute reason */
  reason?: string;
  
  /** Current status of the dispute */
  status?: 'open' | 'pending_review' | 'resolved' | 'closed';
  
  /** Array of evidence file references (IPFS CIDs or file paths) */
  evidenceHashes?: string[];
  
  /** AI-generated summary and recommendation (if available) */
  aiSummary?: AISummaryResult;
  
  /** Timestamp when dispute was created */
  createdAt?: Date | string;
  
  /** Timestamp when dispute was last modified */
  lastModified?: Date | string;
  
  /** Timestamp when dispute was resolved (if applicable) */
  resolvedAt?: Date | string;
  
  /** Resolution outcome (if resolved) */
  resolution?: 'client_wins' | 'freelancer_wins' | 'partial' | null;
}

/**
 * EvidenceFile
 * 
 * Represents metadata for an uploaded evidence file
 */
export interface EvidenceFile {
  /** Unique file identifier */
  id?: string;
  
  /** Associated dispute ID */
  disputeId?: string;
  
  /** Original filename (sanitized) */
  originalName?: string;
  
  /** File type/extension */
  fileType?: string;
  
  /** MIME type */
  mimeType?: string;
  
  /** File size in bytes */
  size?: number;
  
  /** IPFS CID or storage path */
  storagePath?: string;
  
  /** Wallet address of the user who uploaded the file */
  uploadedBy?: string;
  
  /** Timestamp when file was uploaded */
  uploadedAt?: Date | string;
  
  /** Extracted text content (if applicable) */
  extractedText?: string;
}

/**
 * AISummaryResult
 * 
 * Represents the result of AI analysis for a dispute
 */
export interface AISummaryResult {
  /** Brief summary of the dispute */
  summary?: string;
  
  /** AI recommendation for resolution */
  recommendation?: 'approve' | 'reject' | 'partial';
  
  /** Confidence score (0-1) */
  confidence?: number;
  
  /** Detailed reasoning for the recommendation */
  reasoning?: string;
  
  /** Timestamp when AI analysis was generated */
  generatedAt?: Date | string;
  
  /** AI model/version used for analysis */
  modelVersion?: string;
}
