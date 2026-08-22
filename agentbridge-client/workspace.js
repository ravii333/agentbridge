import { existsSync, readdirSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import config from './config.js';

let currentPath = config.AGENT_CWD;

function getWorkspace() {
  return currentPath;
}

function setWorkspace(target) {
  if (!target || typeof target !== 'string') {
    throw new Error('A workspace path is required');
  }
  if (!existsSync(target)) {
    throw new Error(`Path does not exist: ${target}`);
  }
  if (!statSync(target).isDirectory()) {
    throw new Error(`Not a directory: ${target}`);
  }
  currentPath = target;
  return currentPath;
}

function listWindowsDrives() {
  try {
    const output = execSync('wmic logicaldisk get name', { encoding: 'utf8' });
    return output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => /^[A-Za-z]:$/.test(line))
      .map((drive) => ({ name: `${drive}\\`, isDirectory: true }));
  } catch {
    return [];
  }
}

function isWindowsDriveRoot(target) {
  return process.platform === 'win32' && /^[A-Za-z]:\\?$/.test(target);
}

// '' is a virtual "This PC" root, listing drive letters, only reachable/used on Windows.
const COMPUTER_ROOT = '';

function listDir(target) {
  const dirPath = target === undefined || target === null ? currentPath : target;

  if (dirPath === COMPUTER_ROOT && process.platform === 'win32') {
    const entries = listWindowsDrives().map((drive) => ({ ...drive, path: drive.name }));
    return { path: COMPUTER_ROOT, parent: null, entries };
  }

  if (!existsSync(dirPath)) {
    throw new Error(`Path does not exist: ${dirPath}`);
  }
  if (!statSync(dirPath).isDirectory()) {
    throw new Error(`Not a directory: ${dirPath}`);
  }

  const entries = readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({ name: entry.name, path: path.join(dirPath, entry.name), isDirectory: true }))
    .sort((a, b) => a.name.localeCompare(b.name));

  let parent;
  if (isWindowsDriveRoot(dirPath)) {
    parent = COMPUTER_ROOT;
  } else {
    const up = path.dirname(dirPath);
    parent = up !== dirPath ? up : null;
  }

  return { path: dirPath, parent, entries };
}

export { getWorkspace, setWorkspace, listDir };
