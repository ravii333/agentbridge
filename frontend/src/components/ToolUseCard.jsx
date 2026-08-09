import { useState } from 'react';

function formatBlock(value) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function ToolUseCard({ tool, input, result }) {
  const [open, setOpen] = useState(false);
  const status = !result ? 'running' : result.ok ? 'ok' : 'error';
  const icon = status === 'ok' ? '✓' : status === 'error' ? '✕' : '…';
  const detail = input?.file_path || input?.path || input?.command || input?.pattern;

  return (
    <div className={`tool-card tool-card--${status}`}>
      <button type="button" className="tool-card__header" onClick={() => setOpen((v) => !v)}>
        <span className="tool-card__chevron">{open ? '›' : '›'}</span>
        <span className="tool-card__name">
          {tool}
          {detail && <span>{String(detail)}</span>}
        </span>
        <span className="tool-card__icon">{icon}</span>
      </button>
      {open && (
        <div className="tool-card__body">
          <div>
            <div className="tool-card__label">input:</div>
            <pre>{formatBlock(input)}</pre>
          </div>
          {result && (
            <div>
              <div className={`tool-card__label ${status === 'error' ? 'tool-card__label--result' : ''}`}>
                {status === 'error' ? 'error:' : 'output:'}
              </div>
              <pre className={status === 'error' ? 'tool-card__result' : ''}>{formatBlock(result.preview)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ToolUseCard;
