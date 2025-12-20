/**
 * backend/src/controllers/disputeController.ts
 * 
 * Dispute-related controller functions
 * Implements full dispute lifecycle API functionality
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { 
  createDisputeEntry, 
  fetchDispute, 
  attachAISummary, 
  saveEvidence,
  getAllDisputes,
  updateDisputeStatus 
} from '../services/disputeService';

// Validation schemas
const openDisputeSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  milestoneId: z.number().int().min(0, 'Milestone ID must be a non-negative integer'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  openedBy: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  projectDescription: z.string().optional(),
  milestoneDescription: z.string().optional(),
});

const uploadEvidenceSchema = z.object({
  disputeId: z.string().min(1, 'Dispute ID is required'),
  uploadedBy: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
});

const aiSummarySchema = z.object({
  disputeId: z.string().min(1, 'Dispute ID is required'),
});

const listDisputesSchema = z.object({
  status: z.enum(['Pending', 'EvidenceSubmitted', 'AI_SummaryGenerated', 'AdminReview', 'Resolved']).optional(),
  projectId: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

/**
 * openDispute
 * 
 * Purpose: Create a new dispute record
 * Status transition: null → Pending
 * 
 * Request body:
 * - projectId: string
 * - milestoneId: number
 * - reason: string (min 10 chars)
 * - openedBy: ethereum address
 * - projectDescription: string (optional)
 * - milestoneDescription: string (optional)
 */
export const openDispute = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validationResult = openDisputeSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
      return;
    }

    const { 
      projectId, 
      milestoneId, 
      reason, 
      openedBy,
      projectDescription,
      milestoneDescription 
    } = validationResult.data;

    // Create dispute entry with Pending status
    const dispute = await createDisputeEntry(
      projectId,
      milestoneId,
      openedBy,
      reason,
      projectDescription,
      milestoneDescription
    );

    res.status(201).json({
      success: true,
      message: 'Dispute created successfully',
      dispute: {
        id: dispute.id,
        projectId: dispute.projectId,
        milestoneId: dispute.milestoneId,
        status: dispute.status,
        reason: dispute.reason,
        openedBy: dispute.openedBy,
        createdAt: dispute.createdAt,
      },
    });
  } catch (error) {
    console.error('Error opening dispute:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to open dispute',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
};

/**
 * uploadEvidence
 * 
 * Purpose: Handle evidence file uploads
 * Status transition: Pending → EvidenceSubmitted
 * 
 * Request body:
 * - disputeId: string
 * - uploadedBy: ethereum address
 * Files: req.files (handled by multer middleware)
 */
export const uploadEvidence = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validationResult = uploadEvidenceSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
      return;
    }

    const { disputeId, uploadedBy } = validationResult.data;

    // Validate that files were uploaded
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    // Extract file metadata (store metadata only, not file content)
    const evidenceMetadata = (req.files as Express.Multer.File[]).map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      uploadedBy,
      uploadedAt: new Date().toISOString(),
    }));

    // Save evidence metadata and update dispute status
    const updatedDispute = await saveEvidence(disputeId, evidenceMetadata, uploadedBy);

    res.status(200).json({
      success: true,
      message: 'Evidence uploaded successfully',
      dispute: {
        id: updatedDispute.id,
        status: updatedDispute.status,
        evidenceCount: updatedDispute.evidenceHashes?.length || 0,
      },
      uploadedFiles: evidenceMetadata.map(e => ({
        filename: e.filename,
        originalName: e.originalName,
        size: e.size,
      })),
    });
  } catch (error) {
    console.error('Error uploading evidence:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to upload evidence',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
};

/**
 * getDispute
 * 
 * Purpose: Retrieve dispute details by ID
 * 
 * URL params:
 * - id: dispute ID
 */
export const getDispute = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate dispute ID
    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'Invalid dispute ID' });
      return;
    }

    // Fetch dispute from database
    const dispute = await fetchDispute(id);

    if (!dispute) {
      res.status(404).json({ error: 'Dispute not found' });
      return;
    }

    res.status(200).json({
      success: true,
      dispute: {
        id: dispute.id,
        projectId: dispute.projectId,
        milestoneId: dispute.milestoneId,
        status: dispute.status,
        reason: dispute.reason,
        openedBy: dispute.openedBy,
        evidenceCount: dispute.evidenceHashes?.length || 0,
        evidenceFiles: dispute.evidenceHashes || [],
        aiSummary: dispute.aiSummary || null,
        freelancerResponse: dispute.freelancerResponse || null,
        createdAt: dispute.createdAt,
        lastModified: dispute.lastModified,
        resolvedAt: dispute.resolvedAt || null,
        resolution: dispute.resolution || null,
      },
    });
  } catch (error) {
    console.error('Error fetching dispute:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to fetch dispute',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
};

/**
 * listDisputes
 * 
 * Purpose: List all disputes with optional filtering
 * 
 * Query params (optional):
 * - status: filter by status
 * - projectId: filter by project
 * - limit: max results (default 20, max 100)
 * - offset: pagination offset (default 0)
 */
export const listDisputes = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate query parameters
    const validationResult = listDisputesSchema.safeParse({
      status: req.query.status,
      projectId: req.query.projectId,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
    });

    if (!validationResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
      return;
    }

    const { status, projectId, limit = 20, offset = 0 } = validationResult.data;

    // Fetch disputes from database with filters
    const { disputes, total } = await getAllDisputes({ status, projectId, limit, offset });

    res.status(200).json({
      success: true,
      total,
      count: disputes.length,
      limit,
      offset,
      disputes: disputes.map((d: any) => ({
        id: d.id,
        projectId: d.projectId,
        milestoneId: d.milestoneId,
        status: d.status,
        openedBy: d.openedBy,
        evidenceCount: d.evidenceHashes?.length || 0,
        hasAISummary: !!d.aiSummary,
        createdAt: d.createdAt,
        resolvedAt: d.resolvedAt || null,
      })),
    });
  } catch (error) {
    console.error('Error listing disputes:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to list disputes',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
};

/**
 * generateAISummary
 * 
 * Purpose: Generate AI-powered analysis and recommendation for a dispute
 * 
 * Phase 7 Implementation:
 * - Extract dispute ID or evidence data from request body
 * - Fetch evidence files from IPFS
 * - Extract text/metadata from uploaded files (OCR for images, parse PDFs)
 * - Call AI service (e.g., OpenAI, Anthropic) with:
 *   - Dispute context (milestone details, evidence)
 *   - Prompt for fairness analysis
 *   - Request for resolution recommendation
 * - Parse AI response and structure output
 * - Return JSON with:
 *   - Summary of evidence
 *   - Recommended outcome (approve/reject/partial refund)
 *   - Confidence score
 *   - Reasoning explanation
 * 
 * Security:
 * - DO NOT expose API keys in client responses
 * - Validate and sanitize all inputs before AI processing
 * - Rate limit to prevent abuse
 * - DO NOT send private keys or wallet data to AI
 * - Consider privacy implications of sending user data to third-party AI
 */
export const generateAISummary = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract dispute ID from request body
    const { disputeId } = req.body;

    // Validate dispute ID
    if (!disputeId || typeof disputeId !== 'string') {
      res.status(400).json({ error: 'Invalid or missing disputeId' });
      return;
    }

    // Fetch dispute data from service layer
    // TODO: Phase 7 - Replace with real database query
    const dispute = await fetchDispute(disputeId);

    if (!dispute) {
      res.status(404).json({ error: 'Dispute not found' });
      return;
    }

    // MVP stub: return deterministic summary without external AI call
    const aiSummary = {
      summaryText: 'MVP summary: review submitted evidence and proceed to admin decision.',
      suggestedOutcome: 'manual_review',
      clientStrengths: [],
      freelancerStrengths: [],
      inconsistencies: [],
    };

    const summaryData = {
      summary: aiSummary.summaryText,
      recommendation: aiSummary.suggestedOutcome,
      confidence: 0.5,
      reasoning: JSON.stringify(aiSummary),
    };

    await attachAISummary(disputeId, summaryData);

    res.status(200).json({
      disputeId,
      summary: aiSummary,
      message: 'AI summary (stub) generated successfully',
    });
  } catch (error) {
    // Log error for debugging (but don't expose details to client)
    console.error('Error generating AI summary:', error);

    // Return safe error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to generate AI summary',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
};
