import { useState } from 'react';

function CommandInput({ onSendCommand, error, recent = [] }) {
  const [command, setCommand] = useState('');

  const send = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSendCommand(trimmed);
    setCommand('');
  };

  const submit = (event) => {
    event.preventDefault();
    send(command);
  };

  return (
    <div>
      {recent.length > 0 && (
        <div className="composer__recent">
          {recent.map((item, index) => (
            <button
              key={`${item}-${index}`}
              type="button"
              className="composer__recent-chip"
              onClick={() => send(item)}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      <form className="composer" onSubmit={submit}>
        <span className="composer__prompt">&gt;</span>
        <input
          className="composer__input"
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          placeholder="send a command"
        />
        <button className="composer__send" type="submit" disabled={!command.trim()}>
          &uarr;
        </button>
      </form>

      {error && <div className="composer__error">{error}</div>}
    </div>
  );
}

export default CommandInput;
