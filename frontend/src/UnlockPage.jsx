import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_URL from './config';
import { useAuth } from './AuthContext';

export default function UnlockPage() {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const { authFetch, user } = useAuth();
  
  const [protectionType, setProtectionType] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [successUrl, setSuccessUrl] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/unlock/${shortCode}/info`)
      .then(r => {
        if (!r.ok) throw new Error('Link not found');
        return r.json();
      })
      .then(data => {
        setProtectionType(data.protectionType);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [shortCode]);

  useEffect(() => {
    // Auto-unlock if it's EMAIL_LIST and user is logged in
    if (protectionType === 'EMAIL_LIST' && user) {
      handleUnlock();
    }
    // Also auto-unlock if NONE
    if (protectionType === 'NONE') {
      handleUnlock();
    }
  }, [protectionType, user]);

  const handleUnlock = async (e) => {
    if (e) e.preventDefault();
    setUnlocking(true);
    setError('');
    try {
      const res = await authFetch(`${API_URL}/unlock/${shortCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error('Invalid password or login required');
        if (res.status === 403) throw new Error('Your email is not authorized to view this link');
        if (res.status === 404) throw new Error('Link not found');
        throw new Error('Failed to unlock link');
      }
      const data = await res.json();
      if (data.originalUrl) {
        setSuccessUrl(data.originalUrl);
        // Show success state briefly then redirect
        setTimeout(() => {
          window.location.href = data.originalUrl;
        }, 1500);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUnlocking(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ maxWidth: 400, width: '100%' }}>
        
        {successUrl ? (
          <div className="text-center">
             <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
             <h2 className="mb-2" style={{ color: '#86efac', marginTop: 0 }}>Access Granted!</h2>
             <p style={{ color: 'var(--text-secondary)' }}>Redirecting you to the destination...</p>
             <a href={successUrl} className="btn btn-primary mt-4" style={{ display: 'inline-block' }}>Proceed Now</a>
          </div>
        ) : (
          <>
            <h2 className="text-center mb-4" style={{ color: 'var(--text-primary)', marginTop: 0 }}>🔒 Protected Link</h2>
            
            {protectionType === 'PASSWORD' && (
              <>
                <p className="text-center mb-4" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  This link requires a password to proceed.
                </p>
                <form onSubmit={handleUnlock}>
                  <div className="form-group mb-4">
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Enter link password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoFocus
                    />
                  </div>
                  
                  {error && (
                    <div className="alert alert-error mb-4" style={{ fontSize: '0.85rem' }}>
                      ⚠️ {error}
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary btn-full" disabled={unlocking}>
                    {unlocking ? 'Verifying...' : 'Unlock Link'}
                  </button>
                </form>
              </>
            )}

            {protectionType === 'EMAIL_LIST' && (
              <div className="text-center">
                <p className="mb-4" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  This link is restricted to authorized users only.
                </p>
                
                {error && (
                  <div className="alert alert-error mb-4 text-left" style={{ fontSize: '0.85rem' }}>
                    ⚠️ {error}
                  </div>
                )}

                {!user ? (
                  <button onClick={() => navigate('/login')} className="btn btn-primary btn-full">
                    Log In to Access
                  </button>
                ) : (
                   !error && (
                     <div className="flex flex-col items-center">
                       <div className="spinner mt-2 mb-4"></div>
                       <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Verifying your authorization...</span>
                     </div>
                   )
                )}
              </div>
            )}
            
            {protectionType === null && error && (
                <div className="alert alert-error" style={{ fontSize: '0.85rem' }}>
                  ⚠️ {error}
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
