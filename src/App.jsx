import { useState } from 'react';
import FileUpload from './components/FileUpload';
import EventsTable from './components/EventsTable';
import LoadingState from './components/LoadingState';
import { extractTextFromPDF } from './services/pdfExtractor';
import { extractEvents } from './services/geminiService';
import { downloadICS } from './services/icsGenerator';
import './App.css';

function App() {
  const [phase, setPhase] = useState('upload'); // upload | loading | results | error
  const [loadingStep, setLoadingStep] = useState(0);
  const [events, setEvents] = useState([]);
  const [courseName, setCourseName] = useState('');
  const [semester, setSemester] = useState('');
  const [error, setError] = useState('');
  const [exportSuccess, setExportSuccess] = useState(false);

  async function handleFileSelect(file) {
    setPhase('loading');
    setLoadingStep(0);
    setError('');
    setExportSuccess(false);

    try {
      // Step 1: Extract text from PDF
      setLoadingStep(0);
      const text = await extractTextFromPDF(file);

      if (!text || text.trim().length < 50) {
        throw new Error('Couldn\'t extract enough text from this PDF. Maybe it\'s just an image? Try a text-based pdf.');
      }

      // step 2: toss it to the backend for the AI magic
      setLoadingStep(1);
      setTimeout(() => setLoadingStep(2), 1500);

      const result = await extractEvents(text);

      if (!result.events || result.events.length === 0) {
        throw new Error('No events found in this syllabus. Make sure it contains dates and deadlines.');
      }

      setEvents(result.events);
      setCourseName(result.courseName || 'Unknown Course');
      setSemester(result.semester || '');
      setPhase('results');
    } catch (err) {
      console.error('Processing error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setPhase('error');
    }
  }

  function handleExport(selectedEvents) {
    if (selectedEvents.length === 0) return;
    downloadICS(selectedEvents, courseName);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 4000);
  }

  function handleAddEvent(newEvent) {
    setEvents(prev => [...prev, newEvent]);
  }

  function handleReset() {
    setPhase('upload');
    setEvents([]);
    setCourseName('');
    setSemester('');
    setError('');
    setExportSuccess(false);
  }

  return (
    <>
      {/* header stuff */}
      <header className="app-header">
        <div className="container header-inner">
          <div className="logo" onClick={handleReset} role="button" tabIndex={0}>
            <div className="logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <span className="logo-text">SyllabusCal</span>
          </div>
        </div>
      </header>

      {/* main body */}
      <main className="container main-content">
        {/* Hero — upload phase only */}
        {phase === 'upload' && (
          <section className="hero animate-fade-in">
            <h1>
              Turn your syllabus into a
              <span className="gradient-text"> calendar</span>
            </h1>
            <p className="hero-subtitle">
              Upload your syllabus PDF and our AI will extract every due date,
              exam, and reading — then export a <code>.ics</code> file you can
              import into Google Calendar in one click.
            </p>
          </section>
        )}

        {/* Upload zone */}
        {(phase === 'upload' || phase === 'loading') && (
          <FileUpload
            onFileSelect={handleFileSelect}
            isProcessing={phase === 'loading'}
          />
        )}

        {/* Loading */}
        {phase === 'loading' && <LoadingState step={loadingStep} />}

        {/* Results */}
        {phase === 'results' && (
          <>
            <EventsTable
              events={events}
              courseName={courseName}
              semester={semester}
              onExport={handleExport}
              onAddEvent={handleAddEvent}
            />

            {exportSuccess && (
              <div className="success-toast animate-slide-up">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Calendar file downloaded! Import it into Google Calendar via Settings → Import.
              </div>
            )}

            <div className="results-actions">
              <button className="btn btn-secondary" onClick={handleReset} id="upload-another-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10"/>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                </svg>
                Upload Another Syllabus
              </button>
            </div>
          </>
        )}

        {/* Error */}
        {phase === 'error' && (
          <div className="error-container animate-fade-in">
            <div className="error-card glass-card">
              <div className="error-icon">⚠️</div>
              <h3>Something went wrong</h3>
              <p className="error-message">{error}</p>
              <div className="error-actions">
                <button className="btn btn-primary" onClick={handleReset}>
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* instructions */}
        {phase === 'upload' && (
          <section className="how-it-works animate-fade-in">
            <h2>How it works</h2>
            <div className="steps-grid stagger-children">
              <div className="step-card glass-card">
                <div className="step-number">1</div>
                <h3>Upload PDF</h3>
                <p>Drag and drop your syllabus or click to browse. We read it right in your browser.</p>
              </div>
              <div className="step-card glass-card">
                <div className="step-number">2</div>
                <h3>AI Extracts</h3>
                <p>NVIDIA LLaMA reads your syllabus and pulls out every date, deadline, and exam.</p>
              </div>
              <div className="step-card glass-card">
                <div className="step-number">3</div>
                <h3>Export Calendar</h3>
                <p>Review the events, select what you want, and download a .ics file for Google Calendar.</p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* basically the gdpr compliance stuff down here */}
      <footer className="app-footer">
        <div className="container footer-inner">
          <p>
            <strong>Privacy Disclaimer:</strong> none of your data is saved anywhere. we use TLS 1.2+ encryption, the backend processes everything in-memory, and then throws it out. not used for AI training either.
          </p>
        </div>
      </footer>
    </>
  );
}

export default App;
