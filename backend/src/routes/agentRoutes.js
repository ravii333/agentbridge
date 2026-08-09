import express from 'express';
const router = express.Router();
import { getStatus, sendCommand } from '../controllers/agentController.js';

// Basic REST endpoint for agent status and command forwarding
router.get('/status', getStatus);
router.post('/command', sendCommand);

export default router;
