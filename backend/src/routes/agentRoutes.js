import express from 'express';
import { getStatus, sendCommand, getRuns, getRun } from '../controllers/agentController.js';
import { requireToken, requireUser } from '../utils/auth.js';

const router = express.Router();

// Legacy shared-secret endpoints (single global dev/dashboard agent).
router.get('/status', requireToken, getStatus);
router.post('/command', requireToken, sendCommand);

// Per-user run history — mobile authenticates these with its JWT, not the shared secret.
router.get('/runs', requireUser, getRuns);
router.get('/runs/:runId', requireUser, getRun);

export default router;
