/**
 * backend/src/routes/adminRoutes.ts
 * 
 * Express routes for admin dispute management
 */

import { Router } from 'express';
import {
  listAllDisputes,
  fetchSingleDispute,
  resolveDispute,
} from '../controllers/adminController';

const router = Router();

/**
 * GET /admin/disputes
 * List all disputes in the system
 */
router.get('/disputes', listAllDisputes);

/**
 * GET /admin/disputes/:id
 * Fetch single dispute by ID
 */
router.get('/disputes/:id', fetchSingleDispute);

/**
 * POST /admin/disputes/:id/resolve
 * Finalize dispute resolution
 */
router.post('/disputes/:id/resolve', resolveDispute);

export default router;
