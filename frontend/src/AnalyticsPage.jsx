import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

function AnalyticsPage() {
    const { shortCode } = useParams();
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        setError('');

        fetch(`http://localhost:8080/analytics/${shortCode}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                setAnalytics(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Analytics fetch error:', err);
                setError('Failed to load analytics. Make sure the short code exists.');
                setLoading(false);
            });
    }, [shortCode]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin text-5xl mb-4">⏳</div>
                    <p className="text-gray-600">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="text-blue-600 hover:text-blue-800 font-semibold mb-4 flex items-center gap-2 transition"
                    >
                        ← Back to Home
                    </button>
                    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-5xl">📊</span>
                            <div>
                                <h1 className="text-4xl font-bold text-gray-800">Analytics</h1>
                                <p className="text-gray-600 font-mono text-lg text-blue-600">localhost:8080/{shortCode}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-8">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <p className="font-semibold text-red-800">{error}</p>
                                <p className="text-red-700 text-sm mt-2">
                                    Make sure your backend server is running on port 8080 and the short code exists.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {analytics && !error && (
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
                                <p className="text-blue-100 text-sm font-semibold mb-2">Total Clicks</p>
                                <p className="text-6xl font-bold mb-2">{analytics.totalClicks || 0}</p>
                                <p className="text-blue-100 text-sm">Views received</p>
                            </div>

                            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-8 text-white">
                                <p className="text-green-100 text-sm font-semibold mb-2">Days Active</p>
                                <p className="text-6xl font-bold mb-2">
                                    {analytics.clicksByDay ? analytics.clicksByDay.length : 0}
                                </p>
                                <p className="text-green-100 text-sm">Days with clicks</p>
                            </div>
                        </div>

                        {/* Charts Section */}
                        {analytics.clicksByDay && analytics.clicksByDay.length > 0 ? (
                            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <span>📈</span> Clicks Over Time
                                </h2>

                                {/* Chart */}
                                <div className="w-full overflow-x-auto mb-8">
                                    <div className="min-w-[400px] flex justify-center">
                                        <LineChart width={600} height={300} data={analytics.clicksByDay} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db' }}
                                                formatter={(value) => [`${value} clicks`, 'Clicks']}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="clicks"
                                                stroke="#3b82f6"
                                                strokeWidth={3}
                                                dot={{ fill: '#3b82f6', r: 5 }}
                                                activeDot={{ r: 7 }}
                                            />
                                        </LineChart>
                                    </div>
                                </div>

                                {/* Daily Breakdown Table */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Daily Breakdown</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b-2 border-gray-300 bg-gray-50">
                                                    <th className="text-left px-4 py-3 text-gray-700 font-semibold">Date</th>
                                                    <th className="text-left px-4 py-3 text-gray-700 font-semibold">Clicks</th>
                                                    <th className="text-left px-4 py-3 text-gray-700 font-semibold">Trend</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {analytics.clicksByDay.map((day, i) => {
                                                    let trend = '➡️'; // default for first day
                                                    if (i > 0) {
                                                        const prevClicks = analytics.clicksByDay[i - 1].clicks;
                                                        if (day.clicks > prevClicks) {
                                                            trend = '📈';
                                                        } else if (day.clicks < prevClicks) {
                                                            trend = '📉';
                                                        }
                                                    }
                                                    return (
                                                        <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                                            <td className="px-4 py-3 text-gray-700 font-medium">{day.date}</td>
                                                            <td className="px-4 py-3">
                                                                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
                                                                    {day.clicks}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-xl">{trend}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                                <div className="inline-block p-4 bg-yellow-100 rounded-full mb-4">
                                    <span className="text-4xl">🔗</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Data Yet</h3>
                                <p className="text-gray-600 mb-6">
                                    This link hasn't received any clicks yet. Share it to start tracking analytics!
                                </p>
                                <button
                                    onClick={() => navigate('/')}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition"
                                >
                                    Create New Link
                                </button>
                            </div>
                        )}

                        {/* Info Box */}
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">ℹ️</span>
                                <div>
                                    <p className="font-semibold text-blue-900 mb-1">About This Analytics</p>
                                    <p className="text-blue-800 text-sm">
                                        This analytics page shows click data for the last 7 days. Each time someone visits your shortened link,
                                        it's recorded and displayed here. The data updates in real-time as visitors click your link.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AnalyticsPage;
