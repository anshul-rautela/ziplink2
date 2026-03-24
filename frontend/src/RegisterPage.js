import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password, confirm } = form;

    if (!username.trim() || !email.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await register(username.trim(), email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card animate-slideup">
        <div className="card-body">
          <div className="auth-header">
            <div className="auth-icon">🚀</div>
            <h1 className="auth-title">Create account</h1>
            <p className="auth-subtitle">Join ZipLink — it's free forever</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-username">Username</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  id="reg-username"
                  name="username"
                  type="text"
                  className="form-input input-with-icon"
                  placeholder="cool_username"
                  value={form.username}
                  onChange={handleChange}
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  className="form-input input-with-icon"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="reg-password"
                  name="password"
                  type="password"
                  className="form-input input-with-icon"
                  placeholder="min 6 characters"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
              <div className="input-wrapper">
                <span className="input-icon">✅</span>
                <input
                  id="reg-confirm"
                  name="confirm"
                  type="password"
                  className="form-input input-with-icon"
                  placeholder="repeat password"
                  value={form.confirm}
                  onChange={handleChange}
                />
              </div>
            </div>

            {error && (
              <div className="alert alert-error mb-4">
                <span className="alert-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner"></span> Creating account…</>
              ) : (
                <>🚀 Create Account</>
              )}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
