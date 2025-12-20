/**
 * backend/src/controllers/adminController.ts
 *
 * Admin controllers for dispute management
 */

import { Request, Response } from 'express';
import { listDisputes, fetchDispute, resolveDisputeRecord } from '../services/disputeService';

/**
 * getAllDisputes
 *
 * Returns a list of all disputes.
 */
export const getAllDisputes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const disputes = await listDisputes();
    res.status(200).json({ disputes });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('getAllDisputes error:', message);
    res.status(500).json({ error: 'Failed to fetch disputes' });
  }
};

/**
 * getDispute
 *
 * Returns a single dispute by ID.
 */
export const getDispute = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'Invalid or missing dispute id' });
      return;
    }

    const dispute = await fetchDispute(id);
    if (!dispute) {
      res.status(404).json({ error: 'Dispute not found' });
      return;
    }

    res.status(200).json({ dispute });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('getDispute error:', message);
    res.status(500).json({ error: 'Failed to fetch dispute' });
  }
};

/**
 * resolveDispute
 *
 * Admin endpoint to finalize a dispute with a decision.
 * 
 * Features:
 * - Accepts resolverDecision ("client" | "freelancer") from request body
 * - Updates disputeDB entry with resolution
 * - Marks status as Resolved
 * - Preserves AI summary if generated
 * - NO blockchain logic (metadata only)
 * - NO private keys or sensitive data
 * 
 * @param req.params.id - Dispute ID
 * @param req.body.resolverDecision - "client" or "freelancer"
 * @returns { success: true, decision, dispute }
 */
export const resolveDispute = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { resolverDecision } = req.body as { resolverDecision?: 'client' | 'freelancer' };
    const adminAddress = process.env.ADMIN_ADDRESS?.toLowerCase();
    const callerAddress = (req.headers['x-admin-address'] as string | undefined)?.toLowerCase();

    // Simple admin gate for MVP
    if (adminAddress && callerAddress !== adminAddress) {
      res.status(403).json({ error: 'Forbidden', details: 'Admin address mismatch' });
      return;
    }

    // Validate dispute ID
    if (!id || typeof id !== 'string') {
      res.status(400).json({ 
        error: 'Invalid or missing dispute id',
        details: 'Dispute ID must be a non-empty string'
      });
      return;
    }

    // Validate resolverDecision
    if (resolverDecision !== 'client' && resolverDecision !== 'freelancer') {
      res.status(400).json({ 
        error: 'Invalid resolverDecision',
        details: 'Decision must be either "client" or "freelancer"'
      });
      return;
    }

    // Resolve dispute (updates DB, marks as Resolved, saves AI summary if present)
    const resolvedDispute = await resolveDisputeRecord(id, resolverDecision);

    res.status(200).json({ 
      success: true, 
      message: 'Dispute resolved successfully',
      decision: resolverDecision,
      dispute: {
        id: resolvedDispute.id,
        status: resolvedDispute.status,
        resolution: resolvedDispute.resolution,
        resolvedAt: resolvedDispute.resolvedAt,
        hasAISummary: !!resolvedDispute.aiSummary
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('resolveDispute error:', message);

    // Handle specific error cases
    if (message === 'Dispute not found') {
      res.status(404).json({ error: 'Dispute not found' });
      return;
    }

    if (message === 'Dispute already finalized') {
      res.status(409).json({ error: 'Dispute already resolved' });
      return;
    }

    // Generic error response
    res.status(500).json({ 
      error: 'Failed to resolve dispute',
      ...(process.env.NODE_ENV === 'development' && { details: message })
    });
  }
};

// Backward-compatible aliases used by existing routes
export const listAllDisputes = getAllDisputes;
export const fetchSingleDispute = getDispute;
