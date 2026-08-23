import TerminalMockup from './components/TerminalMockup.jsx';
import PhoneMockup from './components/PhoneMockup.jsx';
import BrandMark from './components/BrandMark.jsx';

const AGENTS = [
  { name: 'Claude Code', status: 'available' },
  { name: 'Codex CLI', status: 'available' },
  { name: 'Cursor', status: 'coming soon' },
];

const FEATURES = [
  {
    title: 'Pair in one command',
    body: 'Run one command on your machine, enter the short code it prints into the app. No tokens to copy, no config to hand-edit.',
  },
  {
    title: 'Approve before it touches anything',
    body: 'Every tool call routes to your phone first, with a diff view for file edits, so nothing runs against your codebase without a tap.',
  },
  {
    title: 'Watch it work, live',
    body: 'Full streamed output as it happens — not just a final summary once the run finishes.',
  },
  {
    title: 'Built for more than one CLI',
    body: 'A pluggable adapter layer means Claude Code and Codex CLI today, and more (like Cursor) next, without changing how you pair or approve.',
  },
  {
    title: 'Your account, your history',
    body: 'Every session, log, and command is scoped to your account — viewable from the app any time, on any of your paired machines.',
  },
  {
    title: 'Switch workspaces remotely',
    body: 'Browse and change the agent’s working directory from your phone when you need to point it somewhere else.',
  },
];

const STEPS = [
  { n: '01', title: 'Install the agent', body: 'One command on the machine already running your coding CLI.' },
  { n: '02', title: 'Pair your phone', body: 'Enter the short code the agent prints. That machine is now yours, and only yours.' },
  { n: '03', title: 'Work from anywhere', body: 'Send commands, approve tool calls, and watch output stream in from wherever you are.' },
];

function App() {
  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <a className="brand" href="#top">
            <BrandMark size={22} /> AgentBridge
          </a>
          <nav className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#download">Download</a>
            <a href="https://github.com/ravii333/agentbridge" target="_blank" rel="noreferrer">GitHub</a>
          </nav>
          <a href="#download" className="btn btn--solid btn--sm">Download</a>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Open source · self-hosted</p>
            <h1>Your coding agent, tethered to your pocket.</h1>
            <p className="hero-sub">
              AgentBridge pairs the AI agent running on your PC with an app in your hand —
              watch every line stream in, approve every file it touches, from anywhere.
            </p>
            <div className="hero-actions">
              <a href="#download" className="btn btn--solid">Get started</a>
              <a
                href="https://github.com/ravii333/agentbridge"
                target="_blank"
                rel="noreferrer"
                className="btn btn--ghost"
              >
                View on GitHub
              </a>
            </div>
          </div>

          <div className="hero-mocks">
            <TerminalMockup />
            <span className="hero-link" aria-hidden="true">
              <BrandMark size={30} />
            </span>
            <PhoneMockup />
          </div>
        </section>

        <section className="works-with">
          <p className="works-with-label">Works with</p>
          <ul className="agent-strip">
            {AGENTS.map((agent) => (
              <li key={agent.name} className={`agent-chip agent-chip--${agent.status === 'available' ? 'live' : 'soon'}`}>
                {agent.name}
                <span className="agent-chip-status">{agent.status}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="features" className="features">
          <h2>Everything you need to trust a remote agent</h2>
          <div className="feature-grid">
            {FEATURES.map((f) => (
              <article key={f.title} className="feature-card">
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="how">
          <h2>How it works</h2>
          <ol className="steps">
            {STEPS.map((step) => (
              <li key={step.n} className="step">
                <span className="step-n">{step.n}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="download" className="download">
          <h2>Get AgentBridge</h2>
          <p className="download-sub">
            Source-available today — packaged installers and an npm release are on the roadmap.
            Clone the repo and you're running in minutes.
          </p>
          <div className="download-grid">
            <div className="download-card">
              <h3>AgentBridge Agent</h3>
              <p>Runs on the machine with your coding CLI installed. Windows, macOS, and Linux.</p>
              <pre className="download-snippet">
                <code>{'git clone https://github.com/ravii333/agentbridge\ncd agentbridge/agentbridge-client\nnpm install && npm start'}</code>
              </pre>
            </div>
            <div className="download-card">
              <h3>AgentBridge Mobile</h3>
              <p>Pair with your agent and take it with you. Runs via Expo Go today.</p>
              <pre className="download-snippet">
                <code>{'cd agentbridge/mobile\nnpm install && npm start'}</code>
              </pre>
            </div>
          </div>
          <a
            href="https://github.com/ravii333/agentbridge"
            target="_blank"
            rel="noreferrer"
            className="btn btn--solid download-cta"
          >
            View full setup on GitHub
          </a>
        </section>
      </main>

      <footer className="site-footer">
        <span className="footer-brand">
          <BrandMark size={22} /> AgentBridge
        </span>
        <a href="https://github.com/ravii333/agentbridge" target="_blank" rel="noreferrer">View on GitHub</a>
      </footer>
    </>
  );
}

export default App;
