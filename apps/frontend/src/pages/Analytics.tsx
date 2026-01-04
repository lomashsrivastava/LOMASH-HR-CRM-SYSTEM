import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const analyticsData = [
    { name: 'Mon', applications: 40, interviews: 24 },
    { name: 'Tue', applications: 30, interviews: 13 },
    { name: 'Wed', applications: 20, interviews: 58 },
    { name: 'Thu', applications: 27, interviews: 39 },
    { name: 'Fri', applications: 18, interviews: 48 },
    { name: 'Sat', applications: 23, interviews: 38 },
    { name: 'Sun', applications: 34, interviews: 43 },
];

const sourceData = [
    { name: 'LinkedIn', value: 400 },
    { name: 'Indeed', value: 300 },
    { name: 'Referral', value: 300 },
    { name: 'Website', value: 200 },
];

const Analytics = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Recruitment Analytics</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Application Trends</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analyticsData}>
                                <defs>
                                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#00f3ff" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#bc13fe" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#bc13fe" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="applications" stroke="#00f3ff" fillOpacity={1} fill="url(#colorApps)" />
                                <Area type="monotone" dataKey="interviews" stroke="#bc13fe" fillOpacity={1} fill="url(#colorInterviews)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Source Efficiency</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sourceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Legend />
                                <Bar dataKey="value" fill="#00f3ff" barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
