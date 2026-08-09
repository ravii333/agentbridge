import { useState } from 'react';

function CommandInput({ onSendCommand }) {
  const [command, setCommand] = useState('');

  const submit = (event) => {
    event.preventDefault();
    if (!command.trim()) {
      return;
    }
    onSendCommand(command.trim());
    setCommand('');
  };

  return (
    <form onSubmit={submit}>
      <h2>Send Command</h2>
      <input
        value={command}
        onChange={(event) => setCommand(event.target.value)}
        placeholder="Enter agent command"
      />
      <div style={{ marginTop: '12px' }}>
        <button type="submit">Send</button>
      </div>
    </form>
  );
}

export default CommandInput;
