function BrandMark({ size = 24, animated = true, className = '' }) {
  return (
    <svg
      className={`brand-svg${animated ? ' brand-svg--animated' : ''} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="AgentBridge"
    >
      <circle cx="22" cy="58" r="9" fill="var(--accent)" />
      <circle cx="78" cy="58" r="9" stroke="var(--text-dim)" strokeWidth="5" />
      <path
        className="brand-svg-arc"
        d="M22 58 C 34 30, 66 30, 78 58"
        stroke="var(--accent)"
        strokeWidth="5.5"
        strokeLinecap="round"
        pathLength="1"
      />
      <path
        className="brand-svg-cable brand-svg-cable--1"
        d="M40 38 L40 58"
        stroke="var(--accent)"
        strokeWidth="3.5"
        strokeLinecap="round"
        pathLength="1"
      />
      <path
        className="brand-svg-cable brand-svg-cable--2"
        d="M50 33 L50 58"
        stroke="var(--accent)"
        strokeWidth="3.5"
        strokeLinecap="round"
        pathLength="1"
      />
      <path
        className="brand-svg-cable brand-svg-cable--3"
        d="M60 38 L60 58"
        stroke="var(--accent)"
        strokeWidth="3.5"
        strokeLinecap="round"
        pathLength="1"
      />
    </svg>
  );
}

export default BrandMark;
