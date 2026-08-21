function PhoneMockup() {
  return (
    <div className="mock-phone" role="img" aria-label="Mobile app showing a live feed and an approval prompt">
      <div className="mock-phone-notch" />
      <div className="mock-phone-screen">
        <div className="mock-phone-status">
          <span className="mock-phone-dot" />
          <span>Connected · running</span>
        </div>

        <div className="mock-bubble mock-bubble--you">Add rate limiting to the auth endpoint</div>

        <div className="mock-feed-line">Reading src/routes/auth.js…</div>
        <div className="mock-feed-line">Adding express-rate-limit to the login route.</div>

        <div className="mock-approval">
          <p className="mock-approval-heading">Claude wants to use Edit</p>
          <p className="mock-approval-detail">src/routes/auth.js</p>
          <button type="button" className="mock-approval-toggle">▸ view changes</button>
          <div className="mock-approval-actions">
            <span className="mock-btn mock-btn--ghost">Deny</span>
            <span className="mock-btn mock-btn--solid">Approve</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhoneMockup;
