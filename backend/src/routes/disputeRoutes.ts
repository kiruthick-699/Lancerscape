/**
 * backend/src/routes/disputeRoutes.ts
 * 
 * Express routes for dispute handling
 */

import { Router } from 'express';
import { uploadEvidence as uploadMiddleware } from '../middleware/upload';
import { 
  openDispute, 
  uploadEvidence, 
  getDispute, 
  listDisputes, 
  generateAISummary 
} from '../controllers/disputeController';

const router = Router();

/**
 * POST /disputes/open
 * Create a new dispute record
 */
router.post('/open', openDispute);

/**
 * POST /disputes/upload-evidence
 * Upload evidence files for a dispute
 */
router.post('/upload-evidence', uploadMiddleware.array('files', 5), uploadEvidence);

/**
 * GET /disputes
 * List all disputes with optional filters
 */
router.get('/', listDisputes);

/**
 * GET /disputes/:id
 * Retrieve dispute details by ID
 */
router.get('/:id', getDispute);

/**
 * POST /disputes/ai-summary
 * Generate AI-powered summary and recommendation for a dispute
 */
router.post('/ai-summary', generateAISummary);

export default router;
