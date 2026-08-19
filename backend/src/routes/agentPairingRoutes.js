import { Router } from 'express';
import { createDeviceCode, getDeviceToken, claim } from '../controllers/agentPairingController.js';
import { requireUser } from '../utils/auth.js';
import { pairingLimiter } from '../utils/rateLimit.js';

const router = Router();

router.post('/device-code', pairingLimiter, createDeviceCode);
// Not rate-limited: agent-client legitimately polls this every ~3s for up to 10
// minutes per pairing attempt, and deviceCode has 192 bits of entropy so it isn't
// a meaningful guessing target.
router.get('/device-token', getDeviceToken);
router.post('/claim', requireUser, pairingLimiter, claim);

export default router;
