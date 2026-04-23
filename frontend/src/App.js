import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import API_URL from './config';
import { useAuth } from './AuthContext';

/* ─── small helpers ─── */
const isValidUrl = (s) => {
  try { const u = new URL(s); return u.protocol === 'http:' || u.protocol === 'https:'; }
  catch { return false; }
};

function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <a href="/" className="navbar-brand">
          <div className="navbar-logo">🔗</div>
          <span className="navbar-brand-text">ZipLink</span>
        </a>

        <div className="navbar-actions">
          {user ? (
            <>
              <div className="navbar-user">
                <div className="navbar-avatar">{user.username[0].toUpperCase()}</div>
                <span>{user.username}</span>
              </div>
              <button className="btn btn-danger btn-sm" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>Sign in</button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Get started</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

/* ─── Analytics Modal ─── */
function AnalyticsModal({ item, onClose }) {
  const { authFetch } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    authFetch(`${API_URL}/analytics/${item.shortCode}`)
      .then(r => r.json())
      .then(d => { setAnalytics(d); setLoading(false); })
      .catch(() => { setAnalytics({ totalClicks: 0, dailyClicks: [] }); setLoading(false); });
  }, [item.shortCode, authFetch]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">📊 Link Details</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* URL info */}
        <div className="mb-4">
          <p className="text-xs text-muted mb-1">ORIGINAL URL</p>
          <p className="text-sm break-all" style={{ color: 'var(--text-secondary)' }}>{item.originalUrl}</p>
        </div>
        <div className="mb-4">
          <p className="text-xs text-muted mb-1">SHORT LINK</p>
          <a
            href={`${API_URL}/code/${item.shortCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono font-bold"
            style={{ color: 'var(--accent-light)', fontSize: '1.1rem' }}
          >
            {API_URL.replace(/https?:\/\//, '')}/code/{item.shortCode}
          </a>
        </div>

        {/* QR */}
        <div className="qr-wrapper mb-4">
          <QRCodeCanvas
            value={`${API_URL}/code/${item.shortCode}`}
            size={220}
            bgColor="transparent"
            fgColor="#ffffff"
          />
        </div>

        {/* Copy / Visit */}
        <div className="grid-2 mb-6">
          <CopyBtn code={item.shortCode} id="modal" />
          <button
            className="btn btn-success"
            onClick={() => window.open(`${API_URL}/code/${item.shortCode}`, '_blank')}
          >
            🔗 Visit Link
          </button>
        </div>

        {/* Analytics */}
        <div className="divider">Analytics</div>

        {loading ? (
          <div className="text-center" style={{ padding: '24px', color: 'var(--text-muted)' }}>
            <span className="spinner" style={{ borderTopColor: 'var(--accent)' }}></span>
          </div>
        ) : (
          <>
            <div className="analytics-total">
              <div className="analytics-number">{analytics?.totalClicks ?? 0}</div>
              <div className="analytics-label">total clicks</div>
            </div>

            {analytics?.dailyClicks?.length > 0 ? (
              <div className="chart-wrapper mt-4">
                <p className="text-sm font-bold mb-4" style={{ color: 'var(--text-secondary)' }}>
                  📈 Daily Clicks — last 30 days
                </p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={analytics.dailyClicks}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6060a0' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#6060a0' }} />
                    <Tooltip
                      contentStyle={{ background: '#1a1a28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#ffffff' }}
                      formatter={v => [`${v} clicks`, '']}
                    />
                    <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} dot={{ fill: '#2563eb', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="alert alert-info mt-4">
                <span className="alert-icon">🔗</span>
                <span>No clicks yet. Share your link to see daily data!</span>
              </div>
            )}

            {/* Referrers & Devices */}
            <div className="grid-2 mt-6">
              <div className="flex flex-col gap-4">
                <AnalyticsPie title="🌐 Top Referrers" data={analytics?.referrers} />
                <DetailList title="Referrer Stats" data={analytics?.referrers} />
              </div>
              <div className="flex flex-col gap-4">
                <AnalyticsPie title="📱 Device Types" data={analytics?.devices} />
                <DetailList title="Device Stats" data={analytics?.devices} />
              </div>
            </div>

            <div className="grid-2 mt-6">
              <div className="flex flex-col gap-4">
                <AnalyticsPie title="🌐 Browsers" data={analytics?.browsers} />
                <DetailList title="Browser Stats" data={analytics?.browsers} />
              </div>
              <div className="flex flex-col gap-4">
                <AnalyticsPie title="💻 Platforms" data={analytics?.platforms} />
                <DetailList title="Platform Stats" data={analytics?.platforms} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DetailList({ title, data }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="mt-2 p-3 rounded-lg bg-white/5 border border-white/5">
      <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2" style={{ fontSize: '0.65rem' }}>{title}</p>
      {data.map((item, i) => (
        <div key={i} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
          <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{item.count}</span>
        </div>
      ))}
    </div>
  );
}

function AnalyticsPie({ title, data }) {
  const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];
  const hasData = data && data.length > 0;
  
  return (
    <div className="chart-wrapper">
      <p className="text-sm font-bold mb-4" style={{ color: 'var(--text-secondary)' }}>{title}</p>
      {hasData ? (
        <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={60}
            paddingAngle={5}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
             contentStyle={{ background: '#1a1a28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
          />
            <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center py-8 text-xs text-muted" style={{ minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          No data yet
        </div>
      )}
    </div>
  );
}


/* ─── Copy button with feedback ─── */
function CopyBtn({ code, id }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(`${API_URL}/code/${code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button className={`btn ${copied ? 'btn-success' : 'btn-secondary'}`} onClick={copy}>
      {copied ? '✅ Copied!' : '📋 Copy Link'}
    </button>
  );
}

/* ─── Main App ─── */
export default function App() {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();

  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [isProtected, setIsProtected] = useState(false);
  const [protectionType, setProtectionType] = useState('PASSWORD');
  const [linkPassword, setLinkPassword] = useState('');
  const [allowedEmails, setAllowedEmails] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('zl_history') || '[]'); } catch { return []; }
  });
  const [selectedItem, setSelectedItem] = useState(null);

  // Sync history with backend if logged in
  useEffect(() => {
    if (user) {
      authFetch(`${API_URL}/analytics`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            const formatted = data.map(u => ({
              originalUrl: u.originalUrl,
              shortCode: u.shortCode,
              timestamp: new Date(u.createdAt).toLocaleString(),
              clicks: u.totalClicks
            }));
            setHistory(formatted);
          }
        })
        .catch(console.error);
    }
  }, [user, authFetch]);

  // Persist history to localStorage (for anonymous users)
  useEffect(() => {
    if (!user) {
      localStorage.setItem('zl_history', JSON.stringify(history));
    }
  }, [history, user]);

  const handleSubmit = async () => {
    if (!url.trim()) { setError('Please enter a URL'); return; }
    if (!isValidUrl(url)) { setError('Please enter a valid URL (include http:// or https://)'); return; }
    if (customCode && !/^[a-zA-Z0-9-_]+$/.test(customCode)) {
      setError('Custom code can only contain letters, numbers, hyphens, and underscores');
      return;
    }
    // Removed mandatory sign-in check

    setLoading(true);
    setError('');
    try {
      const body = { originalUrl: url };
      if (customCode.trim()) body.customCode = customCode.trim();

      if (isProtected) {
        body.isProtected = true;
        body.protectionType = protectionType;
        if (protectionType === 'PASSWORD') {
          if (!linkPassword) { setError('Please enter a password'); setLoading(false); return; }
          body.linkPassword = linkPassword;
        } else {
          if (!allowedEmails) { setError('Please enter at least one allowed email'); setLoading(false); return; }
          body.allowedEmails = allowedEmails.split(',').map(e => e.trim()).filter(e => e);
        }
      }

      const res = await authFetch(`${API_URL}/shorten`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.status === 401) { setError('Session expired. Please log in again.'); return; }
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || `Server error: ${res.status}`);
      }

      const data = await res.json();
      setShortCode(data.shortCode);

      const entry = { originalUrl: url, shortCode: data.shortCode, timestamp: new Date().toLocaleString() };
      setHistory(prev => [entry, ...prev].slice(0, 10));
    } catch (e) {
      setError(e.message || 'Failed to shorten URL.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { 
    setUrl(''); setShortCode(''); setCustomCode(''); setError(''); 
    setIsProtected(false); setProtectionType('PASSWORD'); setLinkPassword(''); setAllowedEmails('');
  };

  return (
    <div className="page-wrapper">
      <NavBar />

      <main className="main-content">
        {/* Hero header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            Shorten. Share.<br />
            <span className="gradient-text">Track everything.</span>
          </h1>
          <p className="dashboard-subtitle">
            Transform long URLs into powerful short links with QR codes and real-time analytics.
          </p>
        </div>

        {/* Stats bar */}
        {history.length > 0 && (
          <div className="stats-bar" style={{ maxWidth: 900, margin: '0 auto 28px' }}>
            <div className="stat-card">
              <div className="stat-value">{history.length}</div>
              <div className="stat-label">Links created</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{history.length > 0 ? history[0].shortCode : '—'}</div>
              <div className="stat-label">Latest code</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">∞</div>
              <div className="stat-label">Free forever</div>
            </div>
          </div>
        )}

        <div className="dashboard-grid">
          {/* ── Shorten form ── */}
          <div className="card">
            <div className="shorten-card">
              <p className="shorten-card-title">Paste your long URL</p>

              <div className="form-group">
                <div className="input-wrapper">
                  <span className="input-icon" style={{ fontSize: '1.1rem' }}>🌐</span>
                  <input
                    type="text"
                    className={`form-input form-input-lg input-with-icon ${error ? 'error' : ''}`}
                    placeholder="https://example.com/your-very-long-url..."
                    value={url}
                    onChange={e => { setUrl(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  />
                  {url && (
                    <button className="input-clear" onClick={handleReset} title="Clear">×</button>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Custom alias <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                <div className="input-wrapper">
                  <span className="input-icon">✏️</span>
                  <input
                    type="text"
                    className="form-input input-with-icon"
                    placeholder="my-cool-link"
                    value={customCode}
                    onChange={e => setCustomCode(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  />
                </div>
                <p className="form-tip">💡 3–10 characters. Leave blank for an auto-generated code.</p>
              </div>

              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="flex items-center gap-2" style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={isProtected}
                    onChange={e => setIsProtected(e.target.checked)}
                  />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>🔒 Protect this link</span>
                </label>
              </div>

              {isProtected && (
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '16px' }}>
                  <div className="form-group mb-4">
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Who can access?</label>
                    <div className="flex gap-4 mt-2" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                        <input type="radio" name="protType" checked={protectionType === 'PASSWORD'} onChange={() => setProtectionType('PASSWORD')} />
                        Anyone with password
                      </label>
                      <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                        <input type="radio" name="protType" checked={protectionType === 'EMAIL_LIST'} onChange={() => setProtectionType('EMAIL_LIST')} />
                        Specific logged-in users
                      </label>
                    </div>
                  </div>

                  {protectionType === 'PASSWORD' ? (
                    <div className="form-group mb-0">
                      <label className="form-label" style={{ fontSize: '0.85rem' }}>Link Password</label>
                      <input
                        type="password"
                        className="form-input"
                        placeholder="Enter password..."
                        value={linkPassword}
                        onChange={e => setLinkPassword(e.target.value)}
                      />
                    </div>
                  ) : (
                    <div className="form-group mb-0">
                      <label className="form-label" style={{ fontSize: '0.85rem' }}>Allowed Emails (comma-separated)</label>
                      <textarea
                        className="form-input"
                        placeholder="user1@example.com, user2@example.com"
                        value={allowedEmails}
                        onChange={e => setAllowedEmails(e.target.value)}
                        rows={2}
                        style={{ resize: 'none' }}
                      ></textarea>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="alert alert-error mb-4">
                  <span className="alert-icon">⚠️</span>
                  <span>{error}</span>
                </div>
              )}



              <button
                className="btn btn-primary btn-full btn-lg"
                onClick={handleSubmit}
                disabled={loading || !url.trim()}
              >
                {loading ? (
                  <><span className="spinner"></span> Shortening…</>
                ) : (
                  <> ✨ Shorten URL</>
                )}
              </button>
            </div>
          </div>

          {/* ── Result card ── */}
          {shortCode && (
            <div className="result-card animate-slideup">
              <div className="flex items-center gap-2 mb-4">
                <span style={{ fontSize: '1.5rem' }}>🎉</span>
                <span style={{ color: '#86efac', fontWeight: 700 }}>Your short link is ready!</span>
              </div>

              <div className="mb-2">
                <p className="text-xs text-muted mb-1">SHORT URL</p>
                <a
                  href={`${API_URL}/code/${shortCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="result-url"
                >
                  {API_URL.replace(/https?:\/\//, '')}/code/{shortCode}
                </a>
                <p className="result-original">{url}</p>
              </div>

              <div className="qr-wrapper">
                <QRCodeCanvas
                  value={`${API_URL}/code/${shortCode}`}
                  size={200}
                  bgColor="transparent"
                  fgColor="#ffffff"
                />
              </div>

              <div className="grid-2">
                <CopyBtn code={shortCode} id="result" />
                <button
                  className="btn btn-success"
                  onClick={() => window.open(`${API_URL}/code/${shortCode}`, '_blank')}
                >
                  🔗 Visit Link
                </button>
              </div>
            </div>
          )}

          {/* ── History ── */}
          {history.length > 0 && (
            <div className="card">
              <div className="history-card">
                <h2 className="section-title">
                  📝 Recent Links
                  <span className="section-title-badge">{history.length}</span>
                </h2>

                <div className="history-list">
                  {history.map((item, i) => (
                    <button
                      key={i}
                      className="history-item"
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="history-qr">
                        <QRCodeCanvas
                          value={`${API_URL}/code/${item.shortCode}`}
                          size={52}
                          bgColor="transparent"
                          fgColor="#9090c0"
                        />
                      </div>
                      <div className="history-info">
                        <div className="history-short">
                          {API_URL.replace(/https?:\/\//, '')}/code/{item.shortCode}
                        </div>
                        <div className="history-original">{item.originalUrl}</div>
                      </div>
                      <span className="history-time">{item.timestamp}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '28px 24px',
        borderTop: '1px solid var(--border)',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
      }}>
        Made with 🔗 <strong style={{ color: 'var(--accent-light)' }}>ZipLink</strong> · Spring Boot + React
      </footer>

      {/* Analytics modal */}
      {selectedItem && (
        <AnalyticsModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}