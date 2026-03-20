import React, { useState } from 'react';

const ResultsDashboard = ({ results, targetRole }) => {
  const [expandedQuestions, setExpandedQuestions] = useState({});

  const toggleQuestion = (index) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (!results) {
    return null;
  }

  const {
    extractedSkills = [],
    requiredSkills = [],
    matchedSkills = [],
    missingSkills = [],
    matchPercentage = 0,
    roadmap = [],
    interviewQuestions = [],
    summary = {}
  } = results;

  const getSkillColor = (percentage) => {
    if (percentage >= 80) return '#4caf50'; // Green
    if (percentage >= 50) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  return (
    <div>
      {/* Summary Stats */}
      <div className="grid grid-3 mb-30">
        <div className="stat-card">
          <div className="stat-label">Match Percentage</div>
          <div className="stat-value" style={{ color: getSkillColor(matchPercentage) }}>
            {matchPercentage}%
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${matchPercentage}%`,
                background: getSkillColor(matchPercentage)
              }}
            ></div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Skills Matched</div>
          <div className="stat-value">{summary.totalMatched || 0}</div>
          <p style={{ color: '#4caf50', fontSize: '0.9rem' }}>of {summary.totalRequired || 0} required</p>
        </div>

        <div className="stat-card">
          <div className="stat-label">Skills to Learn</div>
          <div className="stat-value" style={{ color: '#f44336' }}>
            {summary.totalMissing || 0}
          </div>
          <p style={{ color: '#999', fontSize: '0.9rem' }}>gap identified</p>
        </div>
      </div>

      {/* Extracted Skills */}
      <div className="card">
        <h3>📋 Your Skills (Extracted from Resume)</h3>
        <p style={{ marginBottom: '15px', color: '#666', fontSize: '0.9rem' }}>
          {extractedSkills.length} skills detected
        </p>
        <div className="tags-container">
          {extractedSkills.length > 0 ? (
            extractedSkills.map((skill, index) => (
              <span key={index} className="tag">
                {skill}
              </span>
            ))
          ) : (
            <p style={{ color: '#999', fontStyle: 'italic' }}>No skills detected</p>
          )}
        </div>
      </div>

      {/* Matched Skills */}
      <div className="card">
        <h3>✅ Matched Skills</h3>
        <p style={{ marginBottom: '15px', color: '#666', fontSize: '0.9rem' }}>
          {matchedSkills.length} skills align with {targetRole} requirements
        </p>
        <div className="tags-container">
          {matchedSkills.length > 0 ? (
            matchedSkills.map((skill, index) => (
              <span key={index} className="tag" style={{
                background: '#4caf50',
                color: 'white'
              }}>
                {skill}
              </span>
            ))
          ) : (
            <p style={{ color: '#999', fontStyle: 'italic' }}>
              No matching skills found - this is a great opportunity to learn!
            </p>
          )}
        </div>
      </div>

      {/* Missing Skills */}
      <div className="card">
        <h3>❌ Missing Skills (Gap Analysis)</h3>
        <p style={{ marginBottom: '15px', color: '#666', fontSize: '0.9rem' }}>
          {missingSkills.length} skills required for {targetRole}
        </p>
        <div className="tags-container">
          {missingSkills.length > 0 ? (
            missingSkills.map((skill, index) => (
              <span key={index} className="tag" style={{
                background: '#f44336',
                color: 'white'
              }}>
                {skill}
              </span>
            ))
          ) : (
            <p style={{ color: '#4caf50', fontStyle: 'italic' }}>
              🎉 You have all the required skills! You're ready for a {targetRole} role!
            </p>
          )}
        </div>
      </div>

      {/* Learning Roadmap */}
      {roadmap.length > 0 && (
        <div className="card">
          <h3>🛣️ Recommended Learning Roadmap</h3>
          <p style={{ marginBottom: '25px', color: '#666', fontSize: '0.9rem' }}>
            AI-generated personalized learning path for your {targetRole} goal
          </p>

          <div className="grid">
            {roadmap.map((item, index) => (
              <div key={index} className="card" style={{
                background: '#f9f9f9',
                border: '2px solid #e0e0e0',
                marginBottom: '0'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: '8px 8px 0 0',
                  marginLeft: '-24px',
                  marginTop: '-24px',
                  marginRight: '-24px',
                  marginBottom: '16px',
                  fontWeight: 600,
                  fontSize: '1.1rem'
                }}>
                  {index + 1}. {item.skill}
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#667eea', marginBottom: '8px', fontSize: '0.95rem' }}>
                    📚 Learning Resources
                  </h4>
                  <ul style={{ marginLeft: '20px', color: '#666' }}>
                    {(item.resources || []).map((resource, rIndex) => (
                      <li key={rIndex} style={{ marginBottom: '6px', fontSize: '0.9rem' }}>
                        {typeof resource === 'string' ? (
                          resource
                        ) : resource?.isLink && resource?.url ? (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: '#667eea',
                              textDecoration: 'none',
                              fontWeight: '500',
                              cursor: 'pointer',
                              borderBottom: '2px solid transparent',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.borderBottom = '2px solid #667eea';
                              e.target.style.color = '#764ba2';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.borderBottom = '2px solid transparent';
                              e.target.style.color = '#667eea';
                            }}
                          >
                            {resource.text} 🔗
                          </a>
                        ) : (
                          resource?.text || resource
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#667eea', marginBottom: '8px', fontSize: '0.95rem' }}>
                    💻 Hands-On Project
                  </h4>
                  <p style={{ color: '#666', fontSize: '0.9rem', fontStyle: 'italic' }}>
                    {item.project}
                  </p>
                </div>

                <div>
                  <h4 style={{ color: '#667eea', marginBottom: '8px', fontSize: '0.95rem' }}>
                    ⏱️ Estimated Time
                  </h4>
                  <p style={{
                    background: '#e8eaf6',
                    color: '#667eea',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    display: 'inline-block',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}>
                    {item.time_estimate}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            background: '#e8f5e9',
            border: '2px solid #4caf50',
            color: '#2e7d32',
            padding: '16px',
            borderRadius: '8px',
            marginTop: '20px',
            fontSize: '0.95rem'
          }}>
            <strong>💡 Tip:</strong> Follow this roadmap sequentially and build projects to solidify your learning. Good luck on your career journey!
          </div>
        </div>
      )}

      {/* Interview Questions */}
      {interviewQuestions.length > 0 && (
        <div className="card">
          <h3>🎤 Interview Preparation - Common Questions & Answers</h3>
          <p style={{ marginBottom: '20px', color: '#666', fontSize: '0.9rem' }}>
            {interviewQuestions.length} frequently asked interview questions for {targetRole} positions
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {interviewQuestions.map((item, index) => (
              <div 
                key={index}
                style={{
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: expandedQuestions[index] ? '#fff9e6' : '#f9f9f9',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Question Header */}
                <div
                  onClick={() => toggleQuestion(index)}
                  style={{
                    padding: '16px',
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    userSelect: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <span style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      flexShrink: 0
                    }}>
                      Q{index + 1}
                    </span>
                    <span style={{ fontWeight: '500', fontSize: '0.95rem' }}>
                      {item.question}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '1.2rem',
                    transition: 'transform 0.3s ease',
                    transform: expandedQuestions[index] ? 'rotate(180deg)' : 'rotate(0deg)',
                    marginLeft: '12px',
                    flexShrink: 0
                  }}>
                    ▼
                  </span>
                </div>

                {/* Answer Content */}
                {expandedQuestions[index] && (
                  <div style={{
                    padding: '16px',
                    background: 'white',
                    borderTop: '2px solid #e0e0e0',
                    animation: 'slideDown 0.3s ease'
                  }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <span style={{
                        background: '#2196F3',
                        color: 'white',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        flexShrink: 0,
                        marginTop: '4px'
                      }}>
                        A
                      </span>
                      <p style={{
                        color: '#333',
                        fontSize: '0.95rem',
                        lineHeight: '1.6',
                        margin: 0
                      }}>
                        {item.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{
            background: '#e3f2fd',
            border: '2px solid #2196F3',
            color: '#1565C0',
            padding: '16px',
            borderRadius: '8px',
            marginTop: '20px',
            fontSize: '0.95rem'
          }}>
            <strong>💡 Interview Tip:</strong> Practice these questions out loud and try to provide answers naturally. Focus on real examples from your experience and always explain the 'why' behind your technical decisions.
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="card" style={{ background: '#f0f4ff' }}>
        <h3>🚀 Next Steps</h3>
        <ol style={{ marginLeft: '20px', color: '#666' }}>
          <li style={{ marginBottom: '10px' }}>
            <strong>Prioritize Learning:</strong> Start with the skills that appear most frequently in your target roles
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>Create Projects:</strong> Build real-world projects to gain hands-on experience
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>Practice Interviews:</strong> Review the interview questions and practice answers to prepare for your interviews
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>Track Progress:</strong> Update your resume as you acquire new skills
          </li>
          <li>
            <strong>Reassess Later:</strong> Upload your updated resume again to track your progress
          </li>
        </ol>
      </div>
    </div>
  );
};

export default ResultsDashboard;
