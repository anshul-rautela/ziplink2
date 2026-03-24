import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend 
} from 'recharts';
import API_URL from './config';

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

function AnalyticsPage() {
    const { shortCode } = useParams();
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        setError('');

        fetch(`${API_URL}/analytics/${shortCode}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('zl_token') || ''}` }
        })
            .then(res => {
                if (!res.ok) {
                    if (res.status === 404) throw new Error('Short code not found');
                    if (res.status === 403) throw new Error('You do not have permission to view these analytics');
                    throw new Error(`Error: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                setAnalytics(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Analytics fetch error:', err);
                setError(err.message || 'Failed to load analytics.');
                setLoading(false);
            });
    }, [shortCode]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#000000]">
                <div className="text-center">
                    <div className="animate-spin text-5xl mb-4">🌀</div>
                    <p className="text-slate-400 font-medium">Analyzing audience data...</p>
                </div>
            </div>
        );
    }

    const StatCard = ({ title, value, subValue, icon, accentColor }) => (
        <div className="bg-[#111111]/60 backdrop-blur-xl rounded-3xl p-6 border border-white/5 hover:border-white/10 transition duration-300">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.1em]">{title}</p>
                    <p className="text-4xl font-black text-white mt-1 leading-none">{value || 0}</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 text-2xl" style={{ color: accentColor }}>{icon}</div>
            </div>
            {subValue && <p className="text-slate-400 text-[11px] font-medium">{subValue}</p>}
        </div>
    );

    const ChartCard = ({ title, icon, children }) => (
        <div className="bg-[#0f0f0f]/80 backdrop-blur-2xl rounded-[32px] border border-white/5 p-6 sm:p-8 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-300 mb-8 flex items-center gap-3 uppercase tracking-widest bg-white/5 w-fit px-4 py-2 rounded-full border border-white/5">
                <span className="opacity-70">{icon}</span> {title}
            </h3>
            {children}
        </div>
    );

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 border border-white/10 p-4 rounded-2xl backdrop-blur-xl shadow-2xl">
                    <p className="text-slate-400 text-xs font-bold mb-1">{label}</p>
                    <p className="text-white text-lg font-black">{payload[0].value} <span className="text-xs text-blue-400 ml-1">CLICKS</span></p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-[#000000] text-slate-200">
             {/* Gradient Background Orbs */}
             <div className="fixed top-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none z-0" />
             <div className="fixed bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-indigo-600/5 blur-[100px] rounded-full pointer-events-none z-0" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:py-16">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                    <div className="flex-1">
                        <button
                            onClick={() => navigate('/')}
                            className="text-blue-400 hover:text-white font-bold flex items-center gap-2 mb-8 transition group px-4 py-2 bg-white/5 rounded-full border border-white/5 active:scale-95"
                        >
                            <span className="group-hover:-translate-x-1 transition duration-300 text-xl font-black">←</span> 
                            <span className="text-xs uppercase tracking-widest">Return to Dashboard</span>
                        </button>
                        
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[28px] flex items-center justify-center text-4xl shadow-2xl shadow-blue-500/20">
                                <span role="img" aria-label="chart">📊</span>
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
                                    Analytics <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Insights</span>
                                </h1>
                                <p className="text-slate-500 font-mono text-sm tracking-tight flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    {API_URL.replace(/https?:\/\//, '')}/code/{shortCode}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <button
                        onClick={() => window.open(`${API_URL}/code/${shortCode}`, '_blank')}
                        className="bg-white text-black px-10 py-5 rounded-[22px] font-black text-lg hover:bg-blue-500 hover:text-white transition duration-500 shadow-xl shadow-white/5 active:scale-95"
                    >
                        Visit Final Destination ↗
                    </button>
                </div>

                {error && (
                    <div className="bg-[#111] border-2 border-red-500/20 rounded-[40px] p-12 text-center max-w-2xl mx-auto shadow-2xl">
                         <div className="text-7xl mb-6">🏜️</div>
                         <h2 className="text-3xl font-black text-white mb-4 italic">"{error}"</h2>
                         <p className="text-slate-500 mb-8 font-medium">Check the alias or consult your terminal logs.</p>
                         <button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-500 text-white font-black py-4 px-10 rounded-2xl transition shadow-xl shadow-blue-500/20">
                            BACK TO BASE 🏠
                         </button>
                    </div>
                )}

                {analytics && !error && (
                    <div className="space-y-8 animate-in fade-in zoom-in duration-1000">
                        {/* Summary Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            <StatCard 
                                title="Total Engagement" 
                                value={analytics.totalClicks} 
                                subValue="CLICK REACH" 
                                icon="📈" 
                                accentColor="#3b82f6" 
                            />
                            <StatCard 
                                title="Days Tracked" 
                                value={analytics.dailyClicks ? analytics.dailyClicks.length : 0} 
                                subValue="TIME SPAN" 
                                icon="🗓️" 
                                accentColor="#10b981" 
                            />
                            <StatCard 
                                title="Top Referrer" 
                                value={analytics.referrers?.[0]?.name === "Direct / Referral" ? "Direct" : (analytics.referrers?.[0]?.name || 'N/A')} 
                                subValue="PRIMARY ORIGIN" 
                                icon="🌐" 
                                accentColor="#8b5cf6" 
                            />
                            <StatCard 
                                title="Primary Device" 
                                value={analytics.devices?.[0]?.name || 'N/A'} 
                                subValue="DOMINANT PLATFORM" 
                                icon="📱" 
                                accentColor="#f59e0b" 
                            />
                        </div>

                        {/* Main Trend Chart */}
                        <ChartCard title="Daily Traffic Volume" icon="⚡">
                             {analytics.dailyClicks && analytics.dailyClicks.length > 0 ? (
                                <div className="space-y-12">
                                    <div className="w-full h-[400px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={analytics.dailyClicks}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                                <XAxis 
                                                    dataKey="date" 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} 
                                                    dy={15}
                                                />
                                                <YAxis 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} 
                                                />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Line
                                                    type="monotone"
                                                    dataKey="count"
                                                    stroke="#2563eb"
                                                    strokeWidth={6}
                                                    dot={{ fill: '#2563eb', r: 8, strokeWidth: 4, stroke: '#000' }}
                                                    activeDot={{ r: 10, stroke: '#fff', strokeWidth: 4 }}
                                                    animationDuration={2000}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                         {analytics.dailyClicks.slice(0, 4).map((day, i) => (
                                              <div key={i} className="p-5 rounded-[22px] bg-white/[0.03] border border-white/5 flex items-center justify-between">
                                                   <div>
                                                        <p className="text-slate-500 text-[10px] font-black tracking-widest uppercase mb-1">{day.date}</p>
                                                        <p className="text-2xl font-black text-white">{day.count} <span className="text-xs text-slate-500">Hits</span></p>
                                                   </div>
                                                   <div className={`text-xl ${i === 0 ? 'text-emerald-400 opacity-100' : 'opacity-20'}`}>⏺</div>
                                              </div>
                                         ))}
                                    </div>
                                </div>
                             ) : (
                                <div className="py-32 flex flex-col items-center justify-center text-center">
                                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-4xl mb-6">📉</div>
                                    <h4 className="text-xl font-black text-white mb-2 italic">Zero Engagement Detected</h4>
                                    <p className="text-slate-500 max-w-sm font-medium">The digital trails are quiet. Share your link to ignite the tracking engine.</p>
                                </div>
                             )}
                        </ChartCard>

                        {/* Detailed Segments Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <SegmentedPanel title="Referral Origins" data={analytics.referrers} icon="🚀" />
                            <SegmentedPanel title="Device Ecosystem" data={analytics.devices} icon="🔋" />
                            <SegmentedPanel title="Browser Stack" data={analytics.browsers} icon="🧭" />
                            <SegmentedPanel title="OS Dominance" data={analytics.platforms} icon="🕹️" />
                        </div>

                        {/* Professional Note */}
                        <div className="bg-[#111] p-10 rounded-[44px] border border-white/5 flex flex-col md:flex-row items-center gap-10">
                             <div className="text-8xl p-6 bg-white/5 rounded-full select-none">💎</div>
                             <div>
                                <h3 className="text-2xl font-black text-white mb-3">Professional Data Analytics</h3>
                                <p className="text-slate-500 font-medium leading-relaxed max-w-3xl">
                                    ZipLink tracks every interaction using advanced header parsing. We protect privacy by sanitizing 
                                    IP addresses while providing the granularity needed for marketing attribution. 
                                    This dashboard updates in real-time as your link propagates across the web.
                                </p>
                             </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const SegmentedPanel = ({ title, data, icon }) => {
    const hasData = data && data.length > 0;
    return (
        <div className="bg-[#0f0f0f]/80 backdrop-blur-2xl rounded-[32px] border border-white/5 p-8 flex flex-col h-full">
            <h4 className="flex items-center gap-3 text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-8">
                <span className="opacity-50">{icon}</span> {title}
            </h4>
            
            {hasData ? (
                <div className="flex-1 flex flex-col justify-between">
                     <div className="h-[220px] mb-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    dataKey="count"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={90}
                                    paddingAngle={8}
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.5)" strokeWidth={4} />
                                    ))}
                                </Pie>
                                <Tooltip content={<div className="bg-black/90 border border-white/10 p-3 rounded-xl backdrop-blur-md text-xs font-bold text-white shadow-2xl">Hover Entry</div>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-3">
                        {data.slice(0, 4).map((item, i) => (
                            <div key={i} className="group p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 flex justify-between items-center transition duration-500">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="text-sm font-bold text-slate-300">{item.name}</span>
                                </div>
                                <span className="text-xs font-black text-white/50 group-hover:text-blue-400 transition">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center py-20 opacity-20 italic text-xs uppercase tracking-widest font-bold">
                    No data points
                </div>
            )}
        </div>
    );
};

export default AnalyticsPage;
