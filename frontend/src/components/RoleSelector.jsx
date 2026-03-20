import React, { useState, useEffect, useRef } from 'react';
import client from '../api/client.js';

const RoleSelector = ({ onRoleSelected, onAnalyze, loading, resumeUploaded }) => {
  const [selectedRole, setSelectedRole] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchRoles = async () => {
    try {
      setRolesLoading(true);
      setRolesError(null);
      console.log('🔍 Fetching roles from /roles endpoint...');
      const response = await client.get('/roles');
      console.log('📦 Response received:', response.data);
      
      if (response.data.success && response.data.roles && response.data.roles.length > 0) {
        console.log(`✅ Loaded ${response.data.roles.length} roles`);
        setRoles(response.data.roles);
      } else {
        console.error('❌ Invalid or empty roles response:', response.data);
        setRolesError(`No roles available (${response.data.count || 0} roles found)`);
      }
    } catch (error) {
      console.error('❌ Error fetching roles:', error);
      setRolesError(`Failed to load available roles: ${error.message}`);
    } finally {
      setRolesLoading(false);
    }
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setSearchQuery('');
    setIsDropdownOpen(false);
    onRoleSelected(role);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setIsDropdownOpen(true);
  };

  const filteredRoles = roles.filter(role =>
    role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAnalyzeClick = () => {
    if (!selectedRole) {
      alert('Please select a role first');
      return;
    }
    onAnalyze();
  };

  return (
    <div className="card">
      <h2>🎯 Select Target Role</h2>
      <p style={{ marginTop: '10px', marginBottom: '20px', color: '#666' }}>
        Choose the job role you want to pursue
      </p>

      <div className="form-group">
        <label htmlFor="role-search">Career Role</label>
        {rolesLoading ? (
          <div style={{ padding: '10px', color: '#666', fontSize: '0.9rem' }}>
            <span className="spinner" style={{
              width: '14px',
              height: '14px',
              marginRight: '8px',
              display: 'inline-block',
              marginTop: '-2px'
            }}></span>
            Loading roles...
          </div>
        ) : rolesError ? (
          <div style={{ padding: '10px', color: '#f44336', fontSize: '0.9rem' }}>
            ⚠️ {rolesError}
          </div>
        ) : (
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <div style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center'
            }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  id="role-search"
                  type="text"
                  placeholder={selectedRole ? selectedRole : "Type to search roles..."}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setIsDropdownOpen(true)}
                  disabled={!resumeUploaded || loading}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box',
                    cursor: !resumeUploaded || loading ? 'not-allowed' : 'text',
                    opacity: !resumeUploaded || loading ? 0.6 : 1
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown' && isDropdownOpen && filteredRoles.length > 0) {
                      e.preventDefault();
                    }
                    if (e.key === 'Escape') {
                      setIsDropdownOpen(false);
                    }
                  }}
                />
                {selectedRole && (
                  <button
                    onClick={() => {
                      setSelectedRole('');
                      setSearchQuery('');
                      onRoleSelected('');
                    }}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      color: '#999',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Clear selection"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Dropdown List */}
            {isDropdownOpen && !selectedRole && filteredRoles.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'white',
                border: '2px solid #e0e0e0',
                borderTop: 'none',
                borderRadius: '0 0 6px 6px',
                maxHeight: '300px',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}>
                {filteredRoles.map((role, index) => (
                  <div
                    key={role}
                    onClick={() => handleRoleChange(role)}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      background: index === 0 ? '#f5f5f5' : 'white',
                      borderBottom: index < filteredRoles.length - 1 ? '1px solid #f0f0f0' : 'none',
                      transition: 'all 0.2s ease',
                      fontSize: '0.95rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#667eea';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = index === 0 ? '#f5f5f5' : 'white';
                      e.currentTarget.style.color = 'black';
                    }}
                  >
                    {role}
                  </div>
                ))}
              </div>
            )}

            {/* No results message */}
            {isDropdownOpen && searchQuery && filteredRoles.length === 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'white',
                border: '2px solid #e0e0e0',
                borderTop: 'none',
                borderRadius: '0 0 6px 6px',
                padding: '16px',
                color: '#999',
                textAlign: 'center',
                fontSize: '0.9rem',
                zIndex: 1000
              }}>
                No roles found matching "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={handleAnalyzeClick}
        disabled={!resumeUploaded || !selectedRole || loading}
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
            Analyzing...
          </>
        ) : (
          '🔍 Analyze My Skills'
        )}
      </button>

      {!resumeUploaded && (
        <p style={{
          marginTop: '15px',
          color: '#f44336',
          fontSize: '0.9rem'
        }}>
          ⓘ Please upload your resume first
        </p>
      )}
    </div>
  );
};

export default RoleSelector;
