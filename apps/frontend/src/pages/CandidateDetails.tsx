import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { XMarkIcon, PaperClipIcon, CalendarIcon, ChatBubbleLeftIcon, ClockIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface CandidateDetailsProps {
    candidateId: string;
    onClose: () => void;
}

const CandidateDetails = ({ candidateId, onClose }: CandidateDetailsProps) => {
    const { token } = useAuth();
    const [candidate, setCandidate] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchCandidate();
    }, [candidateId]);

    const fetchCandidate = async () => {
        try {
            const { data } = await axios.get(`http://localhost:4000/api/v1/candidates/${candidateId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCandidate(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!candidate) return <div>Not Found</div>;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="fixed inset-y-0 right-0 w-[600px] bg-[#0f0f1a] border-l border-white/10 shadow-2xl z-50 overflow-y-auto"
            >
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white">{candidate.name}</h2>
                            <p className="text-gray-400">{candidate.positionApplied?.title || 'No Role'}</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex space-x-6 border-b border-white/10 mb-6">
                        {['overview', 'resume', 'timeline', 'interviews'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-2 capitalize ${activeTab === tab ? 'text-neon-cyan border-b-2 border-neon-cyan' : 'text-gray-400 hover:text-white'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="glass-panel p-4">
                                <h3 className="text-white font-bold mb-3">Contact Info</h3>
                                <div className="space-y-2">
                                    <p className="text-gray-400">
                                        <span className="block text-xs text-gray-500 uppercase">Emails</span>
                                        {candidate.emails?.length ? candidate.emails.join(', ') : 'N/A'}
                                    </p>
                                    <p className="text-gray-400">
                                        <span className="block text-xs text-gray-500 uppercase">Phones</span>
                                        {candidate.phones?.length ? candidate.phones.join(', ') : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="glass-panel p-4">
                                <h3 className="text-white font-bold mb-3">AI Analysis</h3>
                                <div className="flex flex-wrap gap-2">
                                    {candidate.parsed?.skills?.map((skill: string) => (
                                        <span key={skill} className="px-2 py-1 bg-white/5 rounded text-xs text-neon-blue border border-white/10">
                                            {skill}
                                        </span>
                                    ))}
                                    {candidate.resume?.url && (
                                        <a href={candidate.resume.url} target="_blank" rel="noopener noreferrer" className="bg-neon-magenta text-black w-full py-2 rounded-lg font-bold hover:bg-neon-magenta/80 transition flex items-center justify-center space-x-2">
                                            <PaperClipIcon className="w-5 h-5" />
                                            <span>Download Resume</span>
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="glass-panel p-4">
                                <h3 className="text-white font-bold mb-3">Profile Details</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Source</span>
                                        <span className="text-white">{candidate.source || 'Direct'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Exp. Salary</span>
                                        <span className="text-white">{candidate.expectedSalary || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Notice Period</span>
                                        <span className="text-white">{candidate.noticePeriod || '-'}</span>
                                    </div>
                                    {candidate.linkedin && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Social</span>
                                            <a href={candidate.linkedin} target="_blank" className="text-neon-cyan hover:underline">LinkedIn</a>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {candidate.tags?.map((tag: string, i: number) => (
                                        <span key={i} className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300 border border-white/5">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'timeline' && (
                        <div className="space-y-4">
                            {candidate.timeline?.map((event: any, i: number) => (
                                <div key={i} className="flex items-start space-x-3">
                                    <div className="mt-1">
                                        <ClockIcon className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-gray-300 text-sm">{event.action}</p>
                                        <p className="text-gray-500 text-xs">{new Date(event.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                            {(!candidate.timeline || candidate.timeline.length === 0) && (
                                <p className="text-gray-500">No activity yet.</p>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CandidateDetails;
