const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:4000';

async function apiFetch(path, token) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }

  return res.json();
}

export function fetchRuns(token, limit = 50) {
  return apiFetch(`/api/agent/runs?limit=${limit}`, token);
}

export function fetchRunLogs(token, runId) {
  return apiFetch(`/api/agent/runs/${encodeURIComponent(runId)}`, token);
}
