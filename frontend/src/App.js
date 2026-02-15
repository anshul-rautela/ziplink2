import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'; 
import API_URL from './config';

function App() {
  const [url, setUrl] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [copiedItem, setCopiedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [linkAnalytics, setLinkAnalytics] = useState(null);

  const isValidUrl = (string) => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!isValidUrl(url)) {
      setError('Please enter a valid URL (include http:// or https://)');
      return;
    }

    if (customCode && !/^[a-zA-Z0-9-_]+$/.test(customCode)) {
      setError('Custom code can only contain letters, numbers, hyphens, and underscores');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const requestBody = { originalUrl: url };
      if (customCode.trim()) {
        requestBody.customCode = customCode.trim();
      }

      const response = await fetch(`${API_URL}/shorten`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setShortCode(data.shortCode);

      const newEntry = {
        originalUrl: url,
        shortCode: data.shortCode,
        timestamp: new Date().toLocaleString()
      };
      setHistory(prev => [newEntry, ...prev].slice(0, 5));

    } catch (error) {
      setError(error.message || 'Failed to shorten URL. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code, itemId) => {
    navigator.clipboard.writeText(`${API_URL}/${code}`);
    setCopiedItem(itemId);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleReset = () => {
    setUrl('');
    setShortCode('');
    setCustomCode('');
    setError('');
  };

  useEffect(() => {
    if (selectedItem) {
      setLinkAnalytics(null);
      console.log('Fetching analytics for:', selectedItem.shortCode);
      fetch(`${API_URL}/analytics/${selectedItem.shortCode}`)
        .then(res => {
          console.log('Analytics response status:', res.status);
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('Analytics data received:', data);
          setLinkAnalytics(data);
        })
        .catch(err => {
          console.error('Analytics fetch error:', err);
          setLinkAnalytics({ totalClicks: 0, clicksByDay: [] });
        });
    }
  }, [selectedItem]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
            <span className="text-4xl">🔗</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-2">
            URL Shortener
          </h1>
          <p className="text-gray-600">
            Transform long URLs into short, shareable links
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter your long URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="https://example.com/your-very-long-url..."
              className={`w-full px-6 py-4 text-lg border-2 rounded-lg focus:outline-none transition ${
                error ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
            />
            {url && (
              <button
                onClick={handleReset}
                className="absolute right-3 top-[52px] -translate-y-1/2 text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              Custom Short Code (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="my-custom-link"
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition pr-40"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-mono">
                {API_URL.replace('https://', '').replace('http://', '')}/
                              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <span>💡</span>
              Leave empty for a random code, or create your own memorable link
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <span className="text-red-500 text-xl">⚠️</span>
              <p className="text-red-700 text-sm flex-1">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !url.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-lg shadow-md hover:shadow-xl transition duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> Shortening...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                ✨ Shorten URL
              </span>
            )}
          </button>
        </div>

        {shortCode && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <p className="text-sm text-green-800 font-semibold">
                Success! Your shortened URL:
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border-2 border-green-300 shadow-sm">
              <p className="text-xs text-gray-500 mb-2">Original URL:</p>
              <p className="text-sm text-gray-700 mb-4 break-all">{url}</p>

              <p className="text-xs text-gray-500 mb-2">Shortened URL:</p>
              <p className="text-lg font-mono font-bold text-blue-600 break-all mb-4">
                <a
                  href={`${API_URL}/${shortCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:opacity-80 transition-all cursor-pointer"
                >
                  `${API_URL}/${shortCode}`
                </a>
              </p>

              <div className="bg-gray-50 p-4 rounded-lg flex justify-center">
              <QRCodeCanvas value={`${API_URL}/${item.shortCode}`} size={200} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => copyToClipboard(shortCode, 'main')}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                <span>{copiedItem === 'main' ? '✅' : '📋'}</span>
                {copiedItem === 'main' ? 'Copied!' : 'Copy Link'}
              </button>
              <button
               onClick={() => window.open(`${API_URL}/${shortCode}`, '_blank')}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                <span>🔗</span> Visit Link
              </button>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span>📝</span> Recent Links
            </h3>
            <div className="space-y-3">
              {history.map((item, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedItem(item)}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
  <QRCodeCanvas value={`${API_URL}/${shortCode}`} size={200} /> 
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1">{item.timestamp}</p>
                      <p className="text-sm text-gray-700 truncate mb-2">{item.originalUrl}</p>
                      <p className="text-sm font-mono text-blue-600">{API_URL.replace('https://', '').replace('http://', '')}/{item.shortCode}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(item.shortCode, `history-${index}`);
                      }}
                      className="text-gray-400 hover:text-blue-500 transition text-xl flex-shrink-0"
                      title="Copy"
                    >
                      {copiedItem === `history-${index}` ? '✅' : '📋'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500 mb-2">Created with Spring Boot + React</p>
          <p className="text-xs text-gray-400">Make sure your backend server is running on port 8080</p>
        </div>
      </div>

      {selectedItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Link Details</h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">Created:</p>
                <p className="text-gray-700">{selectedItem.timestamp}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">Original URL:</p>
                <p className="text-gray-700 break-all bg-gray-50 p-3 rounded-lg">{selectedItem.originalUrl}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">Short URL:</p>
                <p className="text-lg font-mono font-bold text-blue-600 break-all bg-blue-50 p-3 rounded-lg">
                  <a
                    href={`${API_URL}/${selectedItem.shortCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {API_URL}/{selectedItem.shortCode}
                  </a>
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg flex justify-center">
                <QRCodeCanvas value={`${API_URL}/${selectedItem.shortCode}`} size={250} />
              </div>

              {linkAnalytics && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <span>📊</span> Analytics
                  </h3>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border-2 border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">Total Clicks</p>
                    <p className="text-4xl font-bold text-blue-600">{linkAnalytics.totalClicks || 0}</p>
                  </div>

                  {linkAnalytics.clicksByDay && linkAnalytics.clicksByDay.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-4">Clicks Over Time</p>
                      
                      <div className="w-full overflow-x-auto mb-4">
                        <div className="min-w-[400px]">
                          <LineChart width={500} height={200} data={linkAnalytics.clicksByDay}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} />
                          </LineChart>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {linkAnalytics.clicksByDay.map((day, i) => (
                          <div key={i} className="flex justify-between items-center py-2 px-3 bg-white rounded border-b border-gray-100 last:border-0">
                            <span className="text-sm text-gray-600">{day.date}</span>
                            <span className="font-bold text-blue-600">{day.clicks} clicks</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!linkAnalytics.clicksByDay || linkAnalytics.clicksByDay.length === 0) && linkAnalytics.totalClicks === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                      <p className="text-sm text-yellow-800">No clicks yet. Share your link to start tracking!</p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => copyToClipboard(selectedItem.shortCode, 'modal')}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition"
                >
                  {copiedItem === 'modal' ? '✅ Copied!' : '📋 Copy Link'}
                </button>
                <button
                  onClick={() => window.open(`${API_URL}/${selectedItem.shortCode}`, '_blank')}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition"
                >
                  🔗 Visit Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;