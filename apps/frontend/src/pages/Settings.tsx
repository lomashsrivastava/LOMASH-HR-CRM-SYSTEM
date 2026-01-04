import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Settings = () => {
    const { token, user, login } = useAuth();
    const [orgName, setOrgName] = useState('');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });

    // User Management
    const [users, setUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'recruiter' });
    const [showAddUser, setShowAddUser] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

    useEffect(() => {
        if (token) {
            fetchOrgProfile();
            fetchUsers();
        }
    }, [token]);

    const fetchOrgProfile = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/users/organization`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // If data.name exists, use it. If not, default to user's email domain or empty.
            if (data && data.name) {
                setOrgName(data.name);
            } else if (user?.email) {
                // Pre-fill with domain as suggestion if empty
                // setOrgName(user.email.split('@')[1]); 
            }
        } catch (error) {
            console.error('Failed to fetch org profile', error);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoadingUsers(true);
            const { data } = await axios.get(`${API_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/users`, newUser, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('User added successfully!');
            setShowAddUser(false);
            setNewUser({ name: '', email: '', password: '', role: 'recruiter' });
            fetchUsers();
        } catch (error: any) {
            alert(`Failed to add user: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleSave = async () => {
        setSaveStatus({ type: '', message: '' }); // Clear previous status
        try {
            // Save organization name
            const { data } = await axios.put(`${API_URL}/users/organization`, { name: orgName }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local session with new token and user data (which has updated orgId)
            if (data.token && data.user) {
                login(data.token, data.user);
            }

            setSaveStatus({ type: 'success', message: 'Organization Profile Updated Successfully!' });

            // Clear success message after 3 seconds
            setTimeout(() => setSaveStatus({ type: '', message: '' }), 3000);
        } catch (error: any) {
            console.error(error);
            const errMsg = error.response?.data?.message || error.message;
            setSaveStatus({ type: 'error', message: `Failed to save: ${errMsg}` });
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Settings</h1>

            {saveStatus.message && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border ${saveStatus.type === 'success'
                            ? 'bg-green-500/20 border-green-500/50 text-green-300'
                            : 'bg-red-500/20 border-red-500/50 text-red-300'
                        }`}
                >
                    {saveStatus.message}
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Organization Profile */}
                <div className="glass-panel p-6 space-y-4">
                    <h2 className="text-xl font-bold text-white">Organization Profile</h2>
                    <div className="space-y-2">
                        <label className="block text-gray-400 text-sm">Company Name</label>
                        <input
                            type="text"
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white"
                            placeholder="Enter your organization name"
                        />
                    </div>
                    <button onClick={handleSave} className="bg-neon-cyan text-black px-4 py-2 rounded-lg font-bold hover:bg-neon-cyan/80 transition">
                        Save Changes
                    </button>
                    <p className="text-xs text-gray-400 mt-2">
                        Note: Saving the Company Name is required to add team members.
                    </p>
                </div>

                {/* Notifications */}
                <div className="glass-panel p-6 space-y-4">
                    <h2 className="text-xl font-bold text-white">Notifications</h2>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-300">Email Alerts</span>
                        <div
                            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                            className={`w-10 h-6 rounded-full relative cursor-pointer transition ${notificationsEnabled ? 'bg-neon-cyan/20' : 'bg-gray-700'}`}
                        >
                            <motion.div
                                animate={{ x: notificationsEnabled ? 16 : 4 }}
                                className={`absolute top-1 w-4 h-4 rounded-full shadow-lg ${notificationsEnabled ? 'bg-neon-cyan' : 'bg-gray-400'}`}
                            ></motion.div>
                        </div>
                    </div>
                </div>

                {/* Team Management */}
                <div className="glass-panel p-6 space-y-4 lg:col-span-2">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Team Management</h2>
                        <button
                            onClick={() => setShowAddUser(!showAddUser)}
                            className="bg-neon-magenta text-black px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-neon-magenta/80"
                        >
                            {showAddUser ? 'Cancel' : 'Add Member'}
                        </button>
                    </div>

                    {showAddUser && (
                        <form onSubmit={handleAddUser} className="bg-white/5 p-4 rounded-lg space-y-3 mb-4 border border-white/10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                    type="text" placeholder="Full Name" required
                                    className="bg-black/20 border border-white/10 rounded p-2 text-white"
                                    value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                />
                                <input
                                    type="email" placeholder="Email" required
                                    className="bg-black/20 border border-white/10 rounded p-2 text-white"
                                    value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                />
                                <input
                                    type="password" placeholder="Temporary Password" required
                                    className="bg-black/20 border border-white/10 rounded p-2 text-white"
                                    value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                />
                                <select
                                    className="bg-black/20 border border-white/10 rounded p-2 text-white"
                                    value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="recruiter">Recruiter</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-neon-cyan text-black font-bold py-2 rounded hover:bg-neon-cyan/80">
                                Send Invite
                            </button>
                        </form>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#13131f] text-gray-400 text-xs uppercase">
                                <tr>
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Email</th>
                                    <th className="p-3">Role</th>
                                    <th className="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {users.map((u: any) => (
                                    <tr key={u._id} className="hover:bg-white/5">
                                        <td className="p-3 font-medium text-white">{u.name}</td>
                                        <td className="p-3 text-gray-400">{u.email}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded text-xs capitalize ${u.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                                                u.role === 'manager' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-3 text-green-400 text-xs">Active</td>
                                    </tr>
                                ))}
                                {users.length === 0 && !loadingUsers && (
                                    <tr><td colSpan={4} className="p-4 text-center text-gray-500">No other team members found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
