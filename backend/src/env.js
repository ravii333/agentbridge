// Side-effect-only module: loads .env before anything else. Must be the very
// first import in any entry point — ESM hoists imports above other top-level
// code, so a bare `import { config } from 'dotenv'; config();` inside the
// entry file itself runs too late to affect modules that read process.env at
// their own top level (e.g. utils/jwt.js).
import { config } from 'dotenv';

config();
