/**
 * backend/src/routes/disputeRoutes.ts
 * 
 * Express routes for dispute handling
 */

import { Router } from 'express';
import { uploadEvidence } from '../middleware/upload';
// TODO: Import dispute controllers
// import { openDispute, uploadEvidenceController, getAISummary, getDisputeById } from '../controllers/disputeController';

const router = Router();

/**
 * POST /disputes/open
 * Open a new dispute for a milestone
 */
router.post('/open', (_req, res) => {
  // TODO: Implement openDispute controller
  res.status(501).json({ error: 'Not implemented' });
});

/**
 * POST /disputes/upload-evidence
 * Upload evidence files for a dispute
 */
router.post('/upload-evidence', uploadEvidence.array('files', 5), (_req, res) => {
  // TODO: Implement uploadEvidenceController
  res.status(501).json({ error: 'Not implemented' });
});

/**
 * POST /disputes/ai-summary
 * Generate AI-powered summary and recommendation for a dispute
 */
router.post('/ai-summary', (_req, res) => {
  // TODO: Implement getAISummary controller
  res.status(501).json({ error: 'Not implemented' });
});

/**
 * GET /disputes/:id
 * Retrieve dispute details by ID
 */
router.get('/:id', (_req, res) => {
  // TODO: Implement getDisputeById controller
  res.status(501).json({ error: 'Not implemented' });
});

export default router;
