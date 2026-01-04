import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    ClipboardDocumentCheckIcon, PlusIcon, XMarkIcon, TrashIcon, PencilIcon,
    ClockIcon, BeakerIcon, ListBulletIcon, CheckCircleIcon, UserGroupIcon,
    ArrowPathIcon, CodeBracketIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface Question {
    id: string;
    text: string;
    type: 'mcq' | 'text' | 'code';
    options?: string[];
    correctAnswer?: string;
    points: number;
}

interface Assessment {
    _id: string;
    title: string;
    description: string;
    type: string;
    duration: string;
    status: 'Active' | 'Draft' | 'Archived';
    questions: Question[];
    passingScore: number;
    candidates: string[]; // IDs
}

const Assessments = () => {
    const { token } = useAuth();
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'builder'>('list');

    // Builder State
    const [currentAssessment, setCurrentAssessment] = useState<Partial<Assessment>>({
        title: '', description: '', type: 'Technical', duration: '60', status: 'Draft', questions: [], passingScore: 70
    });

    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
    const [tempQuestion, setTempQuestion] = useState<Partial<Question>>({
        type: 'mcq', points: 10, options: ['', '', '', '']
    });

    useEffect(() => {
        if (token) fetchAssessments();
    }, [token]);

    const fetchAssessments = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('http://localhost:4000/api/v1/assessments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAssessments(data);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAssessment = async () => {
        try {
            if (currentAssessment._id) {
                await axios.put(`http://localhost:4000/api/v1/assessments/${currentAssessment._id}`, currentAssessment, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('http://localhost:4000/api/v1/assessments', currentAssessment, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            fetchAssessments();
            setViewMode('list');
            setCurrentAssessment({ title: '', description: '', type: 'Technical', duration: '60', status: 'Draft', questions: [], passingScore: 70 });
        } catch (error: any) {
            alert(`Failed to save: ${error.response?.data?.message || 'Unknown error'}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this assessment?')) return;
        try {
            await axios.delete(`http://localhost:4000/api/v1/assessments/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAssessments(prev => prev.filter(a => a._id !== id));
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const addQuestion = () => {
        if (!tempQuestion.text) return alert('Question text required');

        const newQ = { ...tempQuestion, id: Date.now().toString() } as Question;

        setCurrentAssessment(prev => ({
            ...prev,
            questions: [...(prev.questions || []), newQ]
        }));
        setTempQuestion({ type: 'mcq', points: 10, options: ['', '', '', ''], text: '' });
    };

    const removeQuestion = (id: string) => {
        setCurrentAssessment(prev => ({
            ...prev,
            questions: prev.questions?.filter(q => q.id !== id)
        }));
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            {viewMode === 'list' ? (
                <>
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Skill Assessments</h1>
                            <p className="text-gray-400 mt-1">Create, manage, and grade candidate evaluations.</p>
                        </div>
                        <button
                            onClick={() => {
                                setCurrentAssessment({ title: '', description: '', type: 'Technical', duration: '60', status: 'Draft', questions: [], passingScore: 70 });
                                setViewMode('builder');
                            }}
                            className="bg-neon-cyan text-black px-4 py-2 rounded-lg font-bold hover:bg-neon-cyan/80 transition flex items-center space-x-2 shadow-lg shadow-neon-cyan/20"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span>Create New Assessment</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar pb-4">
                        {assessments.map((assessment) => (
                            <motion.div
                                key={assessment._id}
                                whileHover={{ y: -5 }}
                                className="glass-panel p-6 border border-white/5 hover:border-neon-cyan/50 transition group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <button onClick={() => { setCurrentAssessment(assessment); setViewMode('builder'); }} className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 text-white"><PencilIcon className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(assessment._id)} className="p-1.5 bg-red-500/20 rounded-full hover:bg-red-500/40 text-red-400"><TrashIcon className="w-4 h-4" /></button>
                                </div>

                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`p-3 rounded-lg ${assessment.type === 'Technical' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                        {assessment.type === 'Technical' ? <CodeBracketIcon className="w-6 h-6" /> : <BeakerIcon className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg leading-tight">{assessment.title}</h3>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${assessment.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                                            }`}>
                                            {assessment.status}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-gray-400 text-sm mb-4 line-clamp-2 min-h-[40px]">{assessment.description || 'No description provided.'}</p>

                                <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4">
                                    <div className="text-center">
                                        <div className="text-xs text-gray-500 mb-1 flex justify-center items-center gap-1"><ClockIcon className="w-3 h-3" /> Time</div>
                                        <div className="text-white font-mono">{assessment.duration}m</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-gray-500 mb-1 flex justify-center items-center gap-1"><ListBulletIcon className="w-3 h-3" /> Q's</div>
                                        <div className="text-white font-mono">{assessment.questions?.length || 0}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-gray-500 mb-1 flex justify-center items-center gap-1"><CheckCircleIcon className="w-3 h-3" /> Pass</div>
                                        <div className="text-white font-mono">{assessment.passingScore}%</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {assessments.length === 0 && !loading && (
                            <div className="col-span-full py-20 text-center text-gray-500">
                                <ClipboardDocumentCheckIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p className="text-xl">No assessments found.</p>
                                <p className="text-sm">Create one to verify candidate skills.</p>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    {/* Builder Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setViewMode('list')} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                            <div>
                                <h2 className="text-2xl font-bold text-white">{currentAssessment._id ? 'Edit Assessment' : 'New Assessment Builder'}</h2>
                                <p className="text-gray-400 text-sm">Configure settings and add questions.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setCurrentAssessment(prev => ({ ...prev, status: 'Draft' }))} className={`px-4 py-2 rounded-lg border border-white/10 text-sm ${currentAssessment.status === 'Draft' ? 'bg-white/10 text-white' : 'text-gray-400'}`}>Draft</button>
                            <button onClick={() => setCurrentAssessment(prev => ({ ...prev, status: 'Active' }))} className={`px-4 py-2 rounded-lg border border-white/10 text-sm ${currentAssessment.status === 'Active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'text-gray-400'}`}>Active</button>
                            <button onClick={handleSaveAssessment} className="bg-neon-cyan text-black px-6 py-2 rounded-lg font-bold hover:bg-neon-cyan/80 shadow-neon-cyan transition">
                                Save Assessment
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
                        {/* Settings Column */}
                        <div className="col-span-4 glass-panel p-6 overflow-y-auto custom-scrollbar h-full space-y-6">
                            <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">General Settings</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1 font-bold">Title</label>
                                    <input value={currentAssessment.title} onChange={e => setCurrentAssessment({ ...currentAssessment, title: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-neon-cyan outline-none" placeholder="e.g. React Senior Developer Test" />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1 font-bold">Description</label>
                                    <textarea value={currentAssessment.description} onChange={e => setCurrentAssessment({ ...currentAssessment, description: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-neon-cyan outline-none h-24 resize-none" placeholder="Brief description..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase text-gray-500 mb-1 font-bold">Type</label>
                                        <select value={currentAssessment.type} onChange={e => setCurrentAssessment({ ...currentAssessment, type: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-neon-cyan outline-none">
                                            <option>Technical</option>
                                            <option>Psychometric</option>
                                            <option>Aptitude</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase text-gray-500 mb-1 font-bold">Duration (min)</label>
                                        <input type="number" value={currentAssessment.duration} onChange={e => setCurrentAssessment({ ...currentAssessment, duration: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-neon-cyan outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1 font-bold">Passing Score (%)</label>
                                    <div className="flex items-center gap-4">
                                        <input type="range" min="0" max="100" value={currentAssessment.passingScore} onChange={e => setCurrentAssessment({ ...currentAssessment, passingScore: Number(e.target.value) })} className="flex-1 accent-neon-cyan" />
                                        <span className="text-white font-mono w-12 text-right">{currentAssessment.passingScore}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Questions Builder */}
                        <div className="col-span-8 flex flex-col h-full gap-6">
                            {/* Question List */}
                            <div className="flex-1 glass-panel p-6 overflow-y-auto custom-scrollbar">
                                <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2 mb-4">Questions ({currentAssessment.questions?.length})</h3>
                                {currentAssessment.questions?.length === 0 ? (
                                    <div className="text-center py-10 text-gray-500 border-2 border-dashed border-white/5 rounded-xl">
                                        <p>No questions added yet. Use the form below.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {currentAssessment.questions?.map((q, idx) => (
                                            <div key={q.id} className="bg-white/5 border border-white/5 p-4 rounded-lg group hover:border-neon-cyan/30 transition">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex gap-3">
                                                        <span className="bg-white/10 w-6 h-6 flex items-center justify-center rounded text-xs text-gray-400 font-mono">{idx + 1}</span>
                                                        <div>
                                                            <p className="text-white font-medium">{q.text}</p>
                                                            <div className="flex gap-2 mt-1">
                                                                <span className="text-[10px] uppercase bg-black/30 px-1.5 rounded text-gray-400">{q.type}</span>
                                                                <span className="text-[10px] uppercase bg-black/30 px-1.5 rounded text-gray-400">{q.points} pts</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => removeQuestion(q.id)} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"><XMarkIcon className="w-5 h-5" /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Add Question Form */}
                            <div className="glass-panel p-6 border-t border-neon-cyan/20 bg-[#1a1a2e]">
                                <h4 className="text-sm font-bold text-neon-cyan uppercase mb-4 flex items-center gap-2"><PlusIcon className="w-4 h-4" /> Add Question</h4>
                                <div className="space-y-3">
                                    <textarea
                                        value={tempQuestion.text}
                                        onChange={e => setTempQuestion({ ...tempQuestion, text: e.target.value })}
                                        className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-neon-cyan outline-none h-20 resize-none text-sm"
                                        placeholder="Type your question here..."
                                    />
                                    <div className="flex gap-4">
                                        <select
                                            value={tempQuestion.type}
                                            onChange={e => setTempQuestion({ ...tempQuestion, type: e.target.value as any })}
                                            className="bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm outline-none w-32"
                                        >
                                            <option value="mcq">MCQ</option>
                                            <option value="text">Text</option>
                                            <option value="code">Code</option>
                                        </select>
                                        <input
                                            type="number"
                                            placeholder="Points"
                                            value={tempQuestion.points}
                                            onChange={e => setTempQuestion({ ...tempQuestion, points: Number(e.target.value) })}
                                            className="bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm outline-none w-24"
                                        />
                                        <button onClick={addQuestion} className="ml-auto bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg text-sm font-bold transition">
                                            Add to List
                                        </button>
                                    </div>

                                    {tempQuestion.type === 'mcq' && (
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            {tempQuestion.options?.map((opt, i) => (
                                                <input
                                                    key={i}
                                                    placeholder={`Option ${i + 1}`}
                                                    value={opt}
                                                    onChange={e => {
                                                        const newOpts = [...(tempQuestion.options || [])];
                                                        newOpts[i] = e.target.value;
                                                        setTempQuestion({ ...tempQuestion, options: newOpts });
                                                    }}
                                                    className="bg-black/30 border border-white/5 rounded p-2 text-xs text-white outline-none focus:border-white/20"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Assessments;
