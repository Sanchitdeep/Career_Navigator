import React, { useState, useEffect } from 'react';
import ResumeUpload from './components/ResumeUpload';
import RoleSelector from './components/RoleSelector';
import ResultsDashboard from './components/ResultsDashboard';
import { analyzeResume, checkBackendHealth } from './api/client';
import './App.css';

function App() {
  const [resumeText, setResumeText] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [backendReady, setBackendReady] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Check if backend is running on app load
  useEffect(() => {
    const checkBackend = async () => {
      try {
        await checkBackendHealth();
        setBackendReady(true);
      } catch (err) {
        setError(
          '⚠️ Backend server is not running. Please start it with: npm start (from backend folder)'
        );
        setBackendReady(false);
      }
    };

    checkBackend();

    // Check every 10 seconds if backend comes online
    const interval = setInterval(checkBackend, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleResumeUploaded = (text) => {
    setResumeText(text);
    setError('');
    setResults(null);
    setShowResults(false);
  };

  const handleRoleSelected = (role) => {
    setSelectedRole(role);
  };

  const handleAnalyze = async () => {
    if (!resumeText || !selectedRole) {
      setError('Please upload resume and select a role');
      return;
    }

    setLoading(true);
    setError('');
    console.log('📤 Sending analysis request to backend...');
    console.log('Resume length:', resumeText.length, 'characters');
    console.log('Target role:', selectedRole);

    try {
      console.log('⏳ Waiting for backend response (this may take 20-30 seconds)...');
      const analysisResults = await analyzeResume(resumeText, selectedRole);
      console.log('✅ Response received from backend');
      console.log('Response data:', analysisResults);
      setResults(analysisResults);
      setShowResults(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('❌ Error from backend:', err);
      const errorMsg = err.message || 'Failed to analyze resume. Please try again.';
      console.error('Error message:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResumeText('');
    setSelectedRole('');
    setResults(null);
    setError('');
    setShowResults(false);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div>
              <h1>🌉 Skill-Bridge Career Navigator</h1>
              <p className="tagline">
                Discover your career path and identify skills to master
              </p>
            </div>
            {backendReady && (
              <span className="status-badge" style={{
                background: '#4caf50',
                color: 'white'
              }}>
                ✓ Connected
              </span>
            )}
            {!backendReady && (
              <span className="status-badge" style={{
                background: '#f44336',
                color: 'white'
              }}>
                ✗ Disconnected
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container main-content">
        {/* Error/Warning Alert */}
        {error && backendReady === false && (
          <div className="error-alert" style={{ marginBottom: '30px' }}>
            <h4>Backend Not Running</h4>
            <p>{error}</p>
          </div>
        )}

        {error && backendReady && (
          <div className="error-alert" style={{ marginBottom: '30px' }}>
            <h4>Error</h4>
            <p>{error}</p>
            <button
              onClick={() => setError('')}
              style={{
                background: '#f44336',
                marginTop: '10px',
                padding: '8px 16px',
                fontSize: '0.9rem'
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Results View */}
        {showResults && (
          <div className="results-section">
            <div className="results-header">
              <div>
                <h2>📊 Your Career Analysis</h2>
                <p style={{ color: '#666', marginTop: '8px' }}>
                  Analysis for: <strong>{selectedRole}</strong>
                </p>
              </div>
              <button
                onClick={handleReset}
                style={{
                  background: '#666',
                  padding: '10px 20px',
                  fontSize: '0.95rem'
                }}
              >
                ↻ Start Over
              </button>
            </div>
            <div className="divider"></div>
            <ResultsDashboard results={results} targetRole={selectedRole} />
          </div>
        )}

        {/* Input Section */}
        {!showResults && (
          <>
            <div className="grid grid-2">
              <ResumeUpload
                onResumeUploaded={handleResumeUploaded}
                onError={setError}
              />
              <RoleSelector
                onRoleSelected={handleRoleSelected}
                onAnalyze={handleAnalyze}
                loading={loading}
                resumeUploaded={!!resumeText}
              />
            </div>

            {/* Info Section */}
            <div className="info-section">
              <h2>How It Works</h2>
              <div className="grid grid-3">
                <div className="info-card">
                  <div className="step-number">1</div>
                  <h3>Upload Resume</h3>
                  <p>Upload your resume in PDF format to get started with the analysis.</p>
                </div>
                <div className="info-card">
                  <div className="step-number">2</div>
                  <h3>Select Target Role</h3>
                  <p>Choose the job role you want to pursue from our curated list.</p>
                </div>
                <div className="info-card">
                  <div className="step-number">3</div>
                  <h3>Get Insights</h3>
                  <p>Receive AI-powered analysis and a personalized learning roadmap.</p>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className="features-section">
              <h2>Features</h2>
              <div className="features-list">
                <div className="feature">
                  <span className="feature-icon">🤖</span>
                  <div>
                    <h4>AI-Powered Analysis</h4>
                    <p>Uses Gemini API to intelligently extract and analyze your skills</p>
                  </div>
                </div>
                <div className="feature">
                  <span className="feature-icon">📊</span>
                  <div>
                    <h4>Gap Analysis</h4>
                    <p>Identifies missing skills and shows your match percentage</p>
                  </div>
                </div>
                <div className="feature">
                  <span className="feature-icon">🛣️</span>
                  <div>
                    <h4>Learning Roadmap</h4>
                    <p>Get personalized recommendations with resources and projects</p>
                  </div>
                </div>
                <div className="feature">
                  <span className="feature-icon">⚡</span>
                  <div>
                    <h4>Instant Feedback</h4>
                    <p>Real-time analysis with actionable career guidance</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>
            🌉 Skill-Bridge Career Navigator | Powered by React, Node.js, and Gemini AI
          </p>
          <p style={{ marginTop: '10px', fontSize: '0.85rem', opacity: 0.8 }}>
            © 2024 Career Navigator. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
