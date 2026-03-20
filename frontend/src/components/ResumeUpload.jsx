import React, { useState } from 'react';
import { uploadResume } from '../api/client';

const ResumeUpload = ({ onResumeUploaded, onError }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        onError('Please select a PDF file');
        setFile(null);
        setFileName('');
        return;
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
        onError('File size must be less than 5MB');
        setFile(null);
        setFileName('');
        return;
      }

      setFile(selectedFile);
      setFileName(selectedFile.name);
      setSuccess(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      onError('Please select a PDF file');
      return;
    }

    setLoading(true);
    try {
      const result = await uploadResume(file);
      onResumeUploaded(result.resumeText);
      setSuccess(true);
      setFile(null);
      setFileName('');
    } catch (error) {
      onError(
        error.message || 'Failed to upload resume. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>📄 Upload Your Resume</h2>
      <p style={{ marginTop: '10px', marginBottom: '20px', color: '#666' }}>
        Upload your resume in PDF format to get started
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="resume-input">Select PDF File</label>
          <input
            id="resume-input"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={loading}
            style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
          />
          {fileName && (
            <p style={{ marginTop: '10px', color: '#667eea', fontSize: '0.9rem' }}>
              ✓ Selected: {fileName}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!file || loading}
          style={{ width: '100%' }}
        >
          {loading ? (
            <>
              <span className="spinner" style={{
                width: '16px',
                height: '16px',
                marginRight: '10px',
                display: 'inline-block',
                marginTop: '-4px'
              }}></span>
              Uploading...
            </>
          ) : (
            '📤 Upload Resume'
          )}
        </button>
      </form>

      {success && (
        <div className="success-alert" style={{ marginTop: '20px' }}>
          <p>✓ Resume uploaded successfully! Now select a role and click Analyze.</p>
        </div>
      )}

      <p style={{
        marginTop: '15px',
        fontSize: '0.85rem',
        color: '#999'
      }}>
        ℹ️ Max file size: 5MB | Supported format: PDF
      </p>
    </div>
  );
};

export default ResumeUpload;
