// Side-effect-only module: loads .env before anything else. Must be the very
// first import in any entry point — ESM hoists imports above other top-level
// code, so a bare `import { config } from 'dotenv'; config();` inside the
// entry file itself runs too late to affect modules that read process.env at
// their own top level (e.g. utils/jwt.js).
import { config } from 'dotenv';

config();

// Fail fast on boot rather than silently running with a forgeable JWT secret
// or connecting to an unintended default database.
const REQUIRED = ['JWT_SECRET', 'MONGO_URI'];
const missing = REQUIRED.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Missing required environment variable(s): ${missing.join(', ')}`);
  process.exit(1);
}

// These don't warrant a hard fail (both are legitimate for local/dev use),
// but silently running with them in production is exactly how an operator
// ends up with an open-CORS API or a global shared-secret bypass.
if (process.env.NODE_ENV === 'production') {
  if (!process.env.CORS_ORIGIN) {
    console.warn(
      'WARNING: CORS_ORIGIN is unset in production - the API will reflect any request origin. Set it to your allowed origin(s).'
    );
  }
  if (process.env.AGENT_TOKEN) {
    console.warn(
      'WARNING: AGENT_TOKEN is set in production - this enables a shared-secret bypass with no per-user scoping. Use the device-pairing flow instead unless you specifically need this.'
    );
  }
}
