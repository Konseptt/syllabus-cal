import './LoadingState.css';

/**
 * Animated loading state shown while the AI processes the syllabus.
 * Shows a multi-step progress indicator.
 */
function LoadingState({ step }) {
  const steps = [
    { label: 'Reading PDF', icon: '📄' },
    { label: 'Sending to AI', icon: '🤖' },
    { label: 'Extracting events', icon: '📅' },
  ];

  return (
    <div className="loading-container animate-fade-in">
      <div className="loading-card glass-card">
        {/* Spinner */}
        <div className="loading-spinner-ring">
          <div className="spinner-inner" />
        </div>

        {/* Current step */}
        <p className="loading-label">
          {steps[step]?.icon} {steps[step]?.label || 'Processing'}...
        </p>

        {/* Progress steps */}
        <div className="loading-steps">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`loading-step ${
                i < step ? 'done' : i === step ? 'active' : ''
              }`}
            >
              <div className="step-dot" />
              <span className="step-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Shimmer bars */}
        <div className="shimmer-lines">
          <div className="shimmer-line" style={{ width: '80%' }} />
          <div className="shimmer-line" style={{ width: '60%', animationDelay: '0.15s' }} />
          <div className="shimmer-line" style={{ width: '70%', animationDelay: '0.3s' }} />
        </div>
      </div>
    </div>
  );
}

export default LoadingState;
