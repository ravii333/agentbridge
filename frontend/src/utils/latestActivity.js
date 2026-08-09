// Derives a short "currently doing X" line from the most recent log event,
// for the glanceable activity preview on the status card.
function latestActivity(logs) {
  for (let i = logs.length - 1; i >= 0; i--) {
    const log = logs[i];
    const data = log.data || {};

    if (log.kind === 'text' && data.text) {
      return data.text.split('\n')[0].slice(0, 140);
    }

    if (log.kind === 'tool_use' && data.tool) {
      const input = data.input || {};
      const detail = input.file_path || input.path || input.command || input.pattern || '';
      return `${data.tool}${detail ? ` ${String(detail).slice(0, 80)}` : ''}`;
    }
  }

  return null;
}

export default latestActivity;
