import { useEffect, useRef } from 'react';
import groupLogs from '../utils/groupLogs.js';
import ToolUseCard from './ToolUseCard.jsx';

function timeLabel(timestamp) {
  return timestamp ? new Date(timestamp).toLocaleTimeString() : '';
}

function RunMarker({ item }) {
  if (item.type === 'run_started') {
    const sessionId = item.data.sessionId;
    return (
      <div className="run-marker">
        Run started{sessionId ? ` · session ${sessionId.slice(0, 8)}` : ''}
      </div>
    );
  }

  const failed = item.data.ok === false;
  return (
    <div className={`run-marker ${failed ? 'run-marker--error' : 'run-marker--ok'}`}>
      Run finished{failed ? ' (failed)' : ''}{item.data.summary ? ` · ${item.data.summary}` : ''}
    </div>
  );
}

function LogItem({ item }) {
  switch (item.type) {
    case 'text':
      return (
        <div className="chat-bubble chat-bubble--assistant">
          <div className="chat-bubble__text">{item.data.text}</div>
          <div className="chat-bubble__time">{timeLabel(item.timestamp)}</div>
        </div>
      );
    case 'tool':
      return <ToolUseCard tool={item.tool} input={item.input} result={item.result} />;
    case 'run_started':
    case 'run_finished':
      return <RunMarker item={item} />;
    case 'error':
      return <div className="chat-bubble chat-bubble--error">{item.data.message}</div>;
    case 'notice':
      return <div className="chat-bubble chat-bubble--notice">{item.data.message}</div>;
    default:
      return <div className="chat-bubble">{item.data?.message || JSON.stringify(item.data)}</div>;
  }
}

function LogFeed({ logs, title, autoScroll = false }) {
  const items = groupLogs(logs);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ block: 'nearest' });
    }
  }, [items.length, autoScroll]);

  return (
    <div>
      {title && <h2>{title}</h2>}
      <div className="log-feed">
        {items.length === 0 && <div className="log-feed__empty">No logs yet</div>}
        {items.map((item, index) => (
          <div key={item.toolUseId || `${item.type}-${index}`} className="log-feed__item">
            <LogItem item={item} />
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

export default LogFeed;
