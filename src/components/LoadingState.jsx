import './LoadingState.css';

// the loading screen animation you see when it's parsing the syllabus
function LoadingState() {
  return (
    <div className="loading-container animate-fade-in">
      <div className="typewriter-cursor"></div>
      <p className="loading-text">Extracting Academic Ledger...</p>
      <p className="loading-subtext">Executing string extraction. Stand by.</p>
      <div className="hard-progress-container">
        <div className="hard-progress-bar"></div>
      </div>
    </div>
  );
}

export default LoadingState;
