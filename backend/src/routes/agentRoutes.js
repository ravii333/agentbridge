import express from 'express';
const router = express.Router();
import { getStatus, sendCommand, getRuns, getRun } from '../controllers/agentController.js';

// Basic REST endpoint for agent status and command forwarding
router.get('/status', getStatus);
router.post('/command', sendCommand);
router.get('/runs', getRuns);
router.get('/runs/:runId', getRun);

export default router;
