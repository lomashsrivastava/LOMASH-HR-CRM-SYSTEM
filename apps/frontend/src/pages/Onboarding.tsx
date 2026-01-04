import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { PlusIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const Onboarding = () => {
    const { token } = useAuth();
    const [onboardings, setOnboardings] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ candidateId: '' });

    useEffect(() => {
        if (token) {
            axios.get('http://localhost:4000/api/v1/onboarding', { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setOnboardings(res.data));
            axios.get('http://localhost:4000/api/v1/candidates', { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setCandidates(res.data));
        }
    }, [token]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('http://localhost:4000/api/v1/onboarding', {
                candidateId: formData.candidateId,
                tasks: [
                    { title: 'Sign Contract', assignee: 'HR', status: 'Pending' },
                    { title: 'IT Setup', assignee: 'IT', status: 'Pending' }
                ]
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOnboardings([...onboardings, data] as any);
            setIsModalOpen(false);
        } catch (error: any) {
            console.error('Start Onboarding Error:', error);
            alert(`Failed to start onboarding: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Onboarding</h1>
                    <p className="text-gray-400 mt-1">Manage new hire process</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-neon-blue text-black px-4 py-2 rounded-lg font-bold hover:bg-neon-blue/80 transition flex items-center space-x-2"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Start Onboarding</span>
                </button>
            </div>

            {/* Filters */}
            <div className="glass-panel p-3 mb-6">
                <input
                    type="text"
                    placeholder="Search onboarding..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none"
                    onChange={(e) => {
                        // Simple client-side search for now
                        const term = e.target.value.toLowerCase();
                        const panels = document.querySelectorAll('.onboarding-card');
                        panels.forEach((p: any) => {
                            const name = p.getAttribute('data-name').toLowerCase();
                            p.style.display = name.includes(term) ? 'block' : 'none';
                        });
                    }}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {onboardings && onboardings.length > 0 ? onboardings.map((onb: any) => {
                    const completedTasks = (onb.tasks || []).filter((t: any) => t.status === 'Completed').length;
                    const totalTasks = (onb.tasks || []).length;
                    const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

                    return (
                        <div key={onb._id || Math.random()} className="glass-panel p-6 onboarding-card" data-name={onb.candidateId?.name || ''}>
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-bold text-white">{onb.candidateId?.name || 'Unknown Candidate'}</h2>
                                <span className="bg-neon-blue/20 text-neon-blue text-xs px-2 py-1 rounded border border-neon-blue/20">
                                    {progress}% Done
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-white/10 h-2 rounded-full mb-4 overflow-hidden">
                                <div className="bg-neon-blue h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                            </div>

                            <div className="space-y-2">
                                {(onb.tasks || []).map((task: any, i: number) => (
                                    <div
                                        key={i}
                                        onClick={async () => {
                                            const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
                                            // Optimistic Update
                                            const updatedOnb = [...onboardings];
                                            const targetOnb: any = updatedOnb.find((o: any) => o._id === onb._id);
                                            targetOnb.tasks[i].status = newStatus;
                                            setOnboardings(updatedOnb);

                                            try {
                                                await axios.put(`http://localhost:4000/api/v1/onboarding/${onb._id}/tasks/${i}`, { status: newStatus }, {
                                                    headers: { Authorization: `Bearer ${token}` }
                                                });
                                            } catch (error) {
                                                console.error('Failed to update task', error);
                                                // Revert would go here
                                            }
                                        }}
                                        className="flex justify-between items-center p-2 border border-white/5 rounded hover:bg-white/10 transition cursor-pointer select-none group"
                                    >
                                        <span className={`text-sm ${task.status === 'Completed' ? 'text-gray-500 line-through' : 'text-white'}`}>{task.title}</span>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-[10px] text-gray-500 group-hover:text-gray-300">{task.assignee}</span>
                                            <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${task.status === 'Completed' ? 'bg-green-500 border-green-500' : 'border-gray-500'}`}>
                                                {task.status === 'Completed' && <span className="text-black text-[10px]">✓</span>}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }) : (
                    <div className="text-center text-gray-400 py-10 col-span-full">No active onboarding workflows.</div>
                )}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            className="bg-[#1a1a2e] border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl"
                        >
                            <h2 className="text-xl font-bold text-white mb-6">Start Onboarding</h2>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <select
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white"
                                    value={formData.candidateId}
                                    onChange={e => setFormData({ ...formData, candidateId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Candidate</option>
                                    {candidates.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                                <button className="w-full bg-neon-blue text-black font-bold py-2 rounded-lg">Start Process</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Onboarding;
