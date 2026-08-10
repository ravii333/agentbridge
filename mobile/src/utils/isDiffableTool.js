const DIFF_TOOLS = new Set(['Edit', 'MultiEdit', 'Write']);

function isDiffable(tool, input) {
  if (!DIFF_TOOLS.has(tool)) return false;
  return (
    Array.isArray(input?.edits) ||
    typeof input?.old_string === 'string' ||
    typeof input?.new_string === 'string' ||
    typeof input?.content === 'string'
  );
}

export default isDiffable;
