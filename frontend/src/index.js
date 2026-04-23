import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import App from './App';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import AnalyticsPage from './AnalyticsPage';
import UnlockPage from './UnlockPage';
import { AuthProvider, useAuth } from './AuthContext';
import reportWebVitals from './reportWebVitals';

// Loading screen while restoring session
function AuthGate({ children }) {
  const { loading } = useAuth();
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0f',
      }}>
        <div style={{
          width: 48,
          height: 48,
          border: '3px solid rgba(109,86,255,0.2)',
          borderTopColor: '#6d56ff',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
  return children;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <AuthGate>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/analytics/:shortCode" element={<AnalyticsPage />} />
            <Route path="/unlock/:shortCode" element={<UnlockPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthGate>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
