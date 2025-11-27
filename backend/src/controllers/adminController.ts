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
 * Finalizes a dispute with an admin decision.
 * - Accepts disputeId (from params) and resolverDecision (body: "client" | "freelancer")
 * - Attaches resolution to the dispute record
 * - Does NOT perform any blockchain calls
 * - Returns { success: true, decision }
 */
export const resolveDispute = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { resolverDecision } = req.body as { resolverDecision?: 'client' | 'freelancer' };

    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'Invalid or missing dispute id' });
      return;
    }

    if (resolverDecision !== 'client' && resolverDecision !== 'freelancer') {
      res.status(400).json({ error: 'Invalid resolverDecision. Use "client" or "freelancer".' });
      return;
    }

    await resolveDisputeRecord(id, resolverDecision);

    res.status(200).json({ success: true, decision: resolverDecision });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('resolveDispute error:', message);

    if (message === 'Dispute not found') {
      res.status(404).json({ error: 'Dispute not found' });
      return;
    }

    if (message === 'Dispute already finalized') {
      res.status(409).json({ error: 'Dispute already finalized' });
      return;
    }

    res.status(500).json({ error: 'Failed to resolve dispute' });
  }
};

// Backward-compatible aliases used by existing routes
export const listAllDisputes = getAllDisputes;
export const fetchSingleDispute = getDispute;
