import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import config from './config.js';

const CREDENTIALS_DIR = path.join(os.homedir(), '.agentbridge');
const CREDENTIALS_PATH = path.join(CREDENTIALS_DIR, 'credentials.json');

const POLL_INTERVAL_MS = 3000;

function loadSavedCredentials() {
  if (!existsSync(CREDENTIALS_PATH)) return null;
  try {
    const data = JSON.parse(readFileSync(CREDENTIALS_PATH, 'utf8'));
    if (data?.agentToken) return data;
  } catch {
    // ignore corrupt file, fall through to re-pairing
  }
  return null;
}

function saveCredentials(data) {
  mkdirSync(CREDENTIALS_DIR, { recursive: true });
  writeFileSync(CREDENTIALS_PATH, JSON.stringify(data, null, 2));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestDeviceCode() {
  const res = await fetch(`${config.BACKEND_URL}/api/agents/device-code`, { method: 'POST' });
  if (!res.ok) {
    throw new Error(`Failed to request pairing code (${res.status})`);
  }
  return res.json();
}

async function pollDeviceToken(deviceCode) {
  const res = await fetch(`${config.BACKEND_URL}/api/agents/device-token?deviceCode=${deviceCode}`);
  if (res.status === 410) {
    return { expired: true };
  }
  if (!res.ok) {
    throw new Error(`Failed to check pairing status (${res.status})`);
  }
  return res.json();
}

async function pairDevice() {
  for (;;) {
    const { deviceCode, userCode } = await requestDeviceCode();
    console.log('\n=========================================');
    console.log(`  Open the AgentBridge app -> Add agent`);
    console.log(`  and enter this code:  ${userCode}`);
    console.log('=========================================\n');

    for (;;) {
      await sleep(POLL_INTERVAL_MS);
      const result = await pollDeviceToken(deviceCode);

      if (result.expired) {
        console.log('Pairing code expired, requesting a new one...');
        break;
      }

      if (result.status === 'claimed') {
        if (!result.agentToken) {
          // Already delivered in a previous, unacknowledged poll — can't recover this
          // pairing attempt, start over with a fresh code.
          console.log('Pairing code already used, requesting a new one...');
          break;
        }
        const credentials = { agentToken: result.agentToken, agentId: result.agentId };
        saveCredentials(credentials);
        console.log('Agent paired successfully.');
        return credentials;
      }
    }
  }
}

async function getCredentials() {
  if (config.AGENT_TOKEN) {
    return { agentToken: config.AGENT_TOKEN, agentId: null };
  }

  const saved = loadSavedCredentials();
  if (saved) {
    return saved;
  }

  return pairDevice();
}

export { getCredentials };
