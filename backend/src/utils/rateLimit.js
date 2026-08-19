import rateLimit from 'express-rate-limit';

// Credential-guessing surfaces: login/register (password guessing) and the
// pairing endpoints (userCode/deviceCode guessing). Keyed by IP, which is
// enough to blunt automated brute-forcing without needing per-account state.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later' },
});

const pairingLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later' },
});

export { authLimiter, pairingLimiter };
