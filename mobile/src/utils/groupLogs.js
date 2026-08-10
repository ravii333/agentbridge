// Groups a flat, chronological log stream into chat-friendly items:
// text/status entries pass through, and tool_use + its later tool_result
// are merged into a single "tool" item keyed by toolUseId.
function groupLogs(logs) {
  const items = [];
  const toolIndex = new Map();

  for (const log of logs) {
    const kind = log.kind;
    const data = log.data || {};

    if (kind === 'tool_use') {
      const item = {
        type: 'tool',
        toolUseId: data.toolUseId,
        tool: data.tool,
        input: data.input,
        result: null,
        timestamp: log.timestamp,
        runId: log.runId,
      };
      toolIndex.set(data.toolUseId, items.length);
      items.push(item);
      continue;
    }

    if (kind === 'tool_result' && toolIndex.has(data.toolUseId)) {
      const idx = toolIndex.get(data.toolUseId);
      items[idx] = { ...items[idx], result: { ok: data.ok, preview: data.preview } };
      continue;
    }

    items.push({
      type: kind || 'plain',
      data,
      timestamp: log.timestamp,
      runId: log.runId,
    });
  }

  return items;
}

export default groupLogs;
