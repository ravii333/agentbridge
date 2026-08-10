const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:4000';
const AGENT_TOKEN = process.env.EXPO_PUBLIC_AGENT_TOKEN;

async function apiFetch(path) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    headers: { 'x-agent-token': AGENT_TOKEN },
  });

  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }

  return res.json();
}

export function fetchRuns(limit = 50) {
  return apiFetch(`/api/agent/runs?limit=${limit}`);
}

export function fetchRunLogs(runId) {
  return apiFetch(`/api/agent/runs/${encodeURIComponent(runId)}`);
}
