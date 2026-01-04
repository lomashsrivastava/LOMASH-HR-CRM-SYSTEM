import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
    PlusIcon, ArrowUpTrayIcon, DocumentTextIcon, XMarkIcon, StarIcon, PencilIcon,
    XCircleIcon, TrashIcon, EllipsisHorizontalIcon, CalendarIcon, BriefcaseIcon,
    AcademicCapIcon, UserIcon, FunnelIcon, MagnifyingGlassIcon, ExclamationTriangleIcon,
    CheckCircleIcon, HandThumbUpIcon, HandThumbDownIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import CandidateDetails from './CandidateDetails';

interface Candidate {
    _id: string;
    name: string;
    stage: string;
    positionApplied: { title: string; _id: string };
    finalScore: number;
    emails: string[];
    phones: string[];
    priority?: boolean;
    tags?: string[];
    source?: string;
    expectedSalary?: string;
    noticePeriod?: string;
    ratings?: number;
    interviewDate?: string;
}

const STAGES = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];

const Candidates = () => {
    const { token } = useAuth();
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null); // For dropdown menu

    // Delete Confirmation State
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

    // Form data for manual add/edit
    const [formData, setFormData] = useState({
        _id: '',
        name: '',
        email: '',
        phone: '',
        positionApplied: '',
        stage: 'applied',
        resume: null as File | null
    });

    useEffect(() => {
        if (token) {
            fetchCandidates();
            const handleClickOutside = () => setActiveMenuId(null);
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [token]);

    const fetchCandidates = async () => {
        try {
            const { data } = await axios.get('http://localhost:4000/api/v1/candidates', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCandidates(data);
        } catch (error) {
            console.error('Failed to fetch candidates', error);
        } finally {
            setLoading(false);
        }
    };

    // Advanced Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [stageFilter, setStageFilter] = useState('All');

    // Derived state for filtering
    const filteredCandidates = candidates.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'All' || c.positionApplied?.title === roleFilter;
        const matchesStage = stageFilter === 'All' || c.stage === stageFilter;
        return matchesSearch && matchesRole && matchesStage;
    });

    const getCandidatesByStage = (stage: string) => filteredCandidates.filter(c => c.stage === stage);

    // Unique Roles for Filter
    const roles = ['All', ...Array.from(new Set(candidates.map(c => c.positionApplied?.title).filter(Boolean)))];

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('resume', file);

        try {
            setUploading(true);
            await axios.post('http://localhost:4000/api/v1/candidates/upload', uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            alert('Resume processed successfully!');
            fetchCandidates();
        } catch (error: any) {
            console.error('Upload failed', error);
            alert(`Resume upload failed: ${error.response?.data?.message || error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleAddManual = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload: any = {
            name: formData.name,
            emails: [formData.email],
            phones: [formData.phone],
            stage: formData.stage,
            positionApplied: formData.positionApplied
        };

        if (!payload.positionApplied) delete payload.positionApplied;

        try {
            if (formData._id) {
                await axios.put(`http://localhost:4000/api/v1/candidates/${formData._id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('http://localhost:4000/api/v1/candidates', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            setIsModalOpen(false);
            setFormData({ _id: '', name: '', email: '', phone: '', positionApplied: '', stage: 'applied', resume: null });
            fetchCandidates();
        } catch (error: any) {
            console.error('Failed to save candidate', error);
            alert(`Failed to save candidate: ${error.response?.data?.message || 'Unknown error'}`);
        }
    };

    const togglePriority = async (candidate: Candidate) => {
        try {
            // Optimistic update
            setCandidates(prev => prev.map(c => c._id === candidate._id ? { ...c, priority: !c.priority } : c));
            await axios.put(`http://localhost:4000/api/v1/candidates/${candidate._id}`, { priority: !candidate.priority }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCandidates(); // Sync
        } catch (error) {
            console.error('Failed to update priority', error);
            fetchCandidates(); // Revert
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            // Optimistic Update
            setCandidates(prev => prev.map(c => c._id === id ? { ...c, stage: status } : c));
            setActiveMenuId(null);

            await axios.put(`http://localhost:4000/api/v1/candidates/${id}/stage`, { stage: status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Failed to update status', error);
            fetchCandidates(); // Revert
        }
    };

    const handleEditClick = (candidate: any) => {
        setFormData({
            _id: candidate._id,
            name: candidate.name,
            email: candidate.emails?.[0] || '',
            phone: candidate.phones?.[0] || '',
            positionApplied: candidate.positionApplied?._id || '',
            stage: candidate.stage,
            resume: null
        });
        setIsModalOpen(true);
        setActiveMenuId(null);
    };

    const initiateDelete = (id: string) => {
        setConfirmDeleteId(id);
        setActiveMenuId(null);
    };

    const confirmDeleteCandidate = async () => {
        if (!confirmDeleteId) return;
        try {
            await axios.delete(`http://localhost:4000/api/v1/candidates/${confirmDeleteId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCandidates(prev => prev.filter(c => c._id !== confirmDeleteId));
            setConfirmDeleteId(null);
            if (activeMenuId === confirmDeleteId) setActiveMenuId(null);
        } catch (error: any) {
            console.error('Delete failed', error);
            alert('Failed to delete candidate: ' + (error.response?.data?.message || 'Unknown error'));
        }
    };

    const onDragEnd = async (result: any) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const newStage = destination.droppableId;

        // Optimistic Update
        const updatedCandidates = candidates.map(c =>
            c._id === draggableId ? { ...c, stage: newStage } : c
        );
        setCandidates(updatedCandidates);

        try {
            await axios.put(`http://localhost:4000/api/v1/candidates/${draggableId}/stage`, { stage: newStage }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Failed to update stage', error);
            fetchCandidates(); // Revert on failure
        }
    };

    // View & Bulk Control
    const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleBulkDelete = async () => {
        try {
            // Using a loop for now (simulating bulk op, ideally backend needs a bulk endpoint)
            const promises = selectedIds.map(id => axios.delete(`http://localhost:4000/api/v1/candidates/${id}`, { headers: { Authorization: `Bearer ${token}` } }));
            await Promise.all(promises);

            setCandidates(prev => prev.filter(c => !selectedIds.includes(c._id)));
            setSelectedIds([]);
            setBulkDeleteConfirm(false);
        } catch (error) {
            console.error('Failed to bulk delete candidates', error);
            alert('Failed to delete candidates. Please try again.');
        }
    };

    const toggleMenu = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setActiveMenuId(activeMenuId === id ? null : id);
    };

    return (
        <div className="h-full flex flex-col space-y-6 overflow-hidden relative pb-4">
            {selectedCandidateId && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                        onClick={() => setSelectedCandidateId(null)}
                    ></div>
                    <CandidateDetails
                        candidateId={selectedCandidateId}
                        onClose={() => setSelectedCandidateId(null)}
                    />
                </>
            )}

            <div className="flex flex-col space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Pipeline Management</h1>
                        <p className="text-gray-400 mt-1">Track, screen, and hire top talent efficiently.</p>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                        <div className="bg-white/5 rounded-lg p-1 flex border border-white/10">
                            <button
                                onClick={() => setViewMode('board')}
                                className={`px-3 py-1.5 rounded text-sm font-medium transition flex items-center gap-1 ${viewMode === 'board' ? 'bg-neon-magenta text-black shadow-lg shadow-neon-magenta/30' : 'text-gray-400 hover:text-white'}`}
                            >
                                <CheckCircleIcon className="w-4 h-4" /> Board
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-1.5 rounded text-sm font-medium transition flex items-center gap-1 ${viewMode === 'list' ? 'bg-neon-magenta text-black shadow-lg shadow-neon-magenta/30' : 'text-gray-400 hover:text-white'}`}
                            >
                                <DocumentTextIcon className="w-4 h-4" /> List
                            </button>
                        </div>

                        {selectedIds.length > 0 && (
                            <button
                                onClick={() => setBulkDeleteConfirm(true)}
                                className="bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg hover:bg-red-500/30 transition text-sm font-bold flex items-center gap-2"
                            >
                                <TrashIcon className="w-4 h-4" /> Delete ({selectedIds.length})
                            </button>
                        )}

                        <label className={`
                            flex items-center space-x-2 px-4 py-2 rounded-lg border border-white/10 
                            cursor-pointer transition
                            ${uploading ? 'bg-white/10 text-white cursor-wait animate-pulse' : 'bg-white/5 text-gray-300 hover:bg-white/10'}
                        `}>
                            {uploading ? <span>Processing Resume...</span> : (
                                <>
                                    <ArrowUpTrayIcon className="w-5 h-5" />
                                    <span className="hidden md:inline">Upload Resume</span>
                                </>
                            )}
                            <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileUpload} disabled={uploading} />
                        </label>
                        <button
                            onClick={() => {
                                setFormData({ _id: '', name: '', email: '', phone: '', positionApplied: '', stage: 'applied', resume: null });
                                setIsModalOpen(true);
                            }}
                            className="bg-neon-magenta text-black px-4 py-2 rounded-lg font-bold hover:bg-neon-magenta/80 shadow-neon-magenta transition flex items-center space-x-2"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span className="hidden md:inline">Add Candidate</span>
                        </button>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="glass-panel p-3 flex flex-col md:flex-row gap-4 items-center border border-white/5 rounded-xl bg-[#1a1a2e]/50">
                    <div className="relative flex-1 w-full">
                        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search candidates by name, email, or tags..."
                            className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-neon-cyan focus:outline-none placeholder-gray-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <select
                            className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none w-full md:w-auto text-sm"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="All">All Roles</option>
                            {roles.filter(r => r !== 'All').map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <select
                            className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none w-full md:w-auto text-sm"
                            value={stageFilter}
                            onChange={(e) => setStageFilter(e.target.value)}
                        >
                            <option value="All">All Stages</option>
                            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {viewMode === 'board' ? (
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                        <div className="flex space-x-6 h-full min-w-max px-2">
                            {STAGES.map((stage) => (
                                <Droppable key={stage} droppableId={stage}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className="w-80 flex-shrink-0 glass-panel flex flex-col h-full bg-[#16213e]/40 backdrop-blur-md rounded-xl border border-white/5"
                                        >
                                            <div className={`p-4 border-b flex justify-between items-center sticky top-0 z-10 rounded-t-xl
                                                ${stage === 'applied' ? 'border-blue-500/20 bg-blue-500/5' :
                                                    stage === 'hired' ? 'border-green-500/20 bg-green-500/5' :
                                                        stage === 'rejected' ? 'border-red-500/20 bg-red-500/5' : 'border-white/5 bg-[#16213e]'}`}>
                                                <h3 className="font-bold text-gray-200 capitalize flex items-center gap-2">
                                                    {stage === 'applied' && <UserIcon className="w-4 h-4 text-blue-400" />}
                                                    {stage === 'hired' && <CheckCircleIcon className="w-4 h-4 text-green-400" />}
                                                    {stage === 'rejected' && <XCircleIcon className="w-4 h-4 text-red-400" />}
                                                    {stage}
                                                </h3>
                                                <span className="bg-white/5 px-2 py-0.5 rounded text-xs text-gray-400 border border-white/5 font-mono">
                                                    {getCandidatesByStage(stage).length}
                                                </span>
                                            </div>
                                            <div className="p-3 flex-1 overflow-y-auto custom-scrollbar">
                                                {getCandidatesByStage(stage).map((candidate, index) => (
                                                    <Draggable key={candidate._id} draggableId={candidate._id} index={index}>
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className="mb-3"
                                                            >
                                                                <motion.div
                                                                    whileHover={{ scale: 1.02 }}
                                                                    // onClick={() => setSelectedCandidateId(candidate._id)} // Removed broad click to allow precise control
                                                                    className="bg-[#1a1a2e] p-4 rounded-lg border border-white/5 hover:border-neon-magenta/50 transition relative group shadow-lg"
                                                                >
                                                                    <div className="flex justify-between items-start">
                                                                        <div className="flex flex-col cursor-pointer" onClick={() => setSelectedCandidateId(candidate._id)}>
                                                                            <div className="flex items-center space-x-2">
                                                                                <h4 className="font-bold text-white group-hover:text-neon-magenta transition truncate max-w-[150px]">{candidate.name}</h4>
                                                                                {candidate.priority && <StarIcon className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                                                                            </div>
                                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                                {candidate.tags?.slice(0, 3).map((tag: string, i: number) => (
                                                                                    <span key={i} className="text-[10px] bg-white/10 px-1 rounded text-gray-300">{tag}</span>
                                                                                ))}
                                                                            </div>
                                                                        </div>

                                                                        <div className="relative">
                                                                            <button
                                                                                onClick={(e) => toggleMenu(e, candidate._id)}
                                                                                className="p-1 rounded-full hover:bg-white/10 text-gray-500 hover:text-white transition"
                                                                            >
                                                                                <EllipsisHorizontalIcon className="w-5 h-5" />
                                                                            </button>

                                                                            <AnimatePresence>
                                                                                {activeMenuId === candidate._id && (
                                                                                    <motion.div
                                                                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                                                        className="absolute right-0 top-6 w-48 bg-[#0f111a] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden"
                                                                                    >
                                                                                        <button onClick={() => { setSelectedCandidateId(candidate._id); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white">View Profile</button>
                                                                                        <button onClick={() => handleEditClick(candidate)} className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white">Edit Details</button>
                                                                                        <div className="border-t border-white/5 my-1"></div>
                                                                                        <div className="px-4 py-1 text-[10px] text-gray-500 uppercase tracking-wider">Move To</div>
                                                                                        {STAGES.filter(s => s !== candidate.stage).map(s => (
                                                                                            <button key={s} onClick={(e) => { e.stopPropagation(); updateStatus(candidate._id, s); }} className="w-full text-left px-4 py-1.5 text-xs text-gray-400 hover:bg-white/5 hover:text-white capitalize pl-6">{s}</button>
                                                                                        ))}
                                                                                        <div className="border-t border-white/5 my-1"></div>
                                                                                        <button onClick={(e) => { e.stopPropagation(); initiateDelete(candidate._id); }} className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2">
                                                                                            <TrashIcon className="w-3 h-3" /> Delete
                                                                                        </button>
                                                                                    </motion.div>
                                                                                )}
                                                                            </AnimatePresence>
                                                                        </div>
                                                                    </div>

                                                                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                                                        <BriefcaseIcon className="w-3 h-3" />
                                                                        <span className="truncate max-w-[180px]">{candidate.positionApplied?.title || 'Unknown Role'}</span>
                                                                    </p>

                                                                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5">
                                                                        <span className="text-[10px] text-gray-600 font-mono flex items-center gap-1">
                                                                            {candidate.interviewDate && <CalendarIcon className="w-3 h-3" />} {candidate.interviewDate ? new Date(candidate.interviewDate).toLocaleDateString() : 'No Interview'}
                                                                        </span>
                                                                        {candidate.finalScore > 0 && (
                                                                            <span className="text-[10px] bg-neon-cyan/10 text-neon-cyan px-1 rounded border border-neon-cyan/20">
                                                                                Score: {candidate.finalScore}%
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {/* Quick Action Bar on Hover */}
                                                                    <div className="absolute inset-x-0 bottom-0 py-1 flex justify-center bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition duration-200">
                                                                        <div className="flex gap-4">
                                                                            <button onClick={(e) => { e.stopPropagation(); togglePriority(candidate); }} title="Star" className="hover:text-yellow-400 text-gray-400 transition transform hover:scale-110">
                                                                                <StarIcon className={`w-4 h-4 ${candidate.priority ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                                                                            </button>
                                                                            <button onClick={(e) => { e.stopPropagation(); updateStatus(candidate._id, 'hired'); }} title="Quick Hire" className="hover:text-green-400 text-gray-400 transition transform hover:scale-110">
                                                                                <HandThumbUpIcon className="w-4 h-4" />
                                                                            </button>
                                                                            <button onClick={(e) => { e.stopPropagation(); updateStatus(candidate._id, 'rejected'); }} title="Quick Reject" className="hover:text-red-400 text-gray-400 transition transform hover:scale-110">
                                                                                <HandThumbDownIcon className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        </div>
                                    )}
                                </Droppable>
                            ))}
                        </div>
                    </div>
                </DragDropContext>
            ) : (
                <div className="glass-panel overflow-hidden flex-1 flex flex-col mx-1">
                    <div className="overflow-auto custom-scrollbar flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#1a1a2e] sticky top-0 z-10 text-xs uppercase text-gray-400 font-medium tracking-wider">
                                <tr>
                                    <th className="p-4 w-10 border-b border-white/5"><input type="checkbox" onChange={(e) => {
                                        if (e.target.checked) setSelectedIds(filteredCandidates.map(c => c._id));
                                        else setSelectedIds([]);
                                    }} checked={selectedIds.length === filteredCandidates.length && filteredCandidates.length > 0} className="rounded border-gray-600 bg-black/20 focus:ring-neon-magenta text-neon-magenta" /></th>
                                    <th className="p-4 border-b border-white/5">Candidate</th>
                                    <th className="p-4 border-b border-white/5">Role</th>
                                    <th className="p-4 border-b border-white/5">Stage</th>
                                    <th className="p-4 border-b border-white/5">Source</th>
                                    <th className="p-4 border-b border-white/5">Rating/Score</th>
                                    <th className="p-4 border-b border-white/5 hidden md:table-cell">Details</th>
                                    <th className="p-4 border-b border-white/5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {filteredCandidates.map(candidate => (
                                    <tr key={candidate._id} className="hover:bg-white/5 transition group">
                                        <td className="p-4">
                                            <input type="checkbox" checked={selectedIds.includes(candidate._id)} onChange={() => toggleSelect(candidate._id)} className="rounded border-gray-600 bg-black/20 focus:ring-neon-magenta text-neon-magenta" />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setSelectedCandidateId(candidate._id)}>
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-magenta to-neon-purple flex items-center justify-center text-xs font-bold text-white">
                                                    {candidate.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white flex items-center space-x-2">
                                                        <span className="group-hover:text-neon-cyan transition">{candidate.name}</span>
                                                        {candidate.priority && <StarIcon className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                                                    </div>
                                                    <div className="text-gray-500 text-xs">{candidate.emails?.[0]}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-300 font-medium">{candidate.positionApplied?.title}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded text-xs border uppercase tracking-wide font-bold
                                                ${candidate.stage === 'applied' ? 'border-blue-500/20 bg-blue-500/10 text-blue-400' :
                                                    candidate.stage === 'hired' ? 'border-green-500/20 bg-green-500/10 text-green-400' :
                                                        candidate.stage === 'rejected' ? 'border-red-500/20 bg-red-500/10 text-red-400' :
                                                            'border-gray-500/20 bg-gray-500/10 text-gray-400'}`}>
                                                {candidate.stage}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-400">{candidate.source || '-'}</td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-yellow-500 text-xs">{candidate.ratings ? `${candidate.ratings} ★` : '-'}</span>
                                                {candidate.finalScore > 0 && <span className="text-[10px] text-neon-cyan/80">Score: {candidate.finalScore}%</span>}
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-400 hidden md:table-cell">
                                            <div className="text-xs">
                                                <div>Exp: <span className="text-white">{candidate.expectedSalary || '-'}</span></div>
                                                <div>Notice: <span className="text-white">{candidate.noticePeriod || '-'}</span></div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="relative inline-block">
                                                <button
                                                    onClick={(e) => toggleMenu(e, candidate._id)}
                                                    className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
                                                >
                                                    <EllipsisHorizontalIcon className="w-5 h-5" />
                                                </button>
                                                {activeMenuId === candidate._id && (
                                                    <div className="absolute right-0 top-8 w-40 bg-[#0f111a] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden text-left">
                                                        <button onClick={() => { setSelectedCandidateId(candidate._id); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-white/5">View</button>
                                                        <button onClick={() => handleEditClick(candidate)} className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-white/5">Edit details</button>
                                                        <button onClick={(e) => { e.stopPropagation(); initiateDelete(candidate._id); }} className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10">Delete</button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Manual Delete Confirmation Modal */}
            <AnimatePresence>
                {confirmDeleteId && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#1a1a2e] border border-red-500/30 rounded-xl p-6 w-full max-w-md shadow-2xl"
                        >
                            <div className="flex items-center gap-3 mb-4 text-red-400">
                                <ExclamationTriangleIcon className="w-8 h-8" />
                                <h3 className="text-xl font-bold text-white">Delete Candidate?</h3>
                            </div>
                            <p className="text-gray-400 mb-6 font-light">
                                This will permanently remove <span className="text-white font-medium">{candidates.find(c => c._id === confirmDeleteId)?.name}</span> from the pipeline.
                                All associated data (resume, scores, notes) will be lost.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-white/5 transition border border-white/5">Cancel</button>
                                <button onClick={confirmDeleteCandidate} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold transition shadow-lg shadow-red-500/20">Delete Forever</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Bulk Delete Confirmation Modal */}
            <AnimatePresence>
                {bulkDeleteConfirm && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#1a1a2e] border border-red-500/30 rounded-xl p-6 w-full max-w-md shadow-2xl"
                        >
                            <div className="flex items-center gap-3 mb-4 text-red-400">
                                <ExclamationTriangleIcon className="w-8 h-8" />
                                <h3 className="text-xl font-bold text-white">Bulk Delete?</h3>
                            </div>
                            <p className="text-gray-400 mb-6 font-light">
                                You are about to delete <span className="text-white font-bold">{selectedIds.length}</span> candidates. This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setBulkDeleteConfirm(false)} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-white/5 transition border border-white/5">Cancel</button>
                                <button onClick={handleBulkDelete} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold transition shadow-lg shadow-red-500/20">Delete All Selected</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add/Edit Candidate Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#1a1a2e] border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">{formData._id ? 'Edit Candidate Details' : 'Add Candidate (Manual)'}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleAddManual} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white focus:border-neon-cyan focus:outline-none"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white focus:border-neon-cyan focus:outline-none"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Phone</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white focus:border-neon-cyan focus:outline-none"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Pipeline Stage</label>
                                    <select
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white focus:border-neon-cyan focus:outline-none capitalize"
                                        value={formData.stage}
                                        onChange={e => setFormData({ ...formData, stage: e.target.value })}
                                    >
                                        {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>

                                <button type="submit" className="w-full bg-neon-magenta text-black font-bold py-2 rounded-lg hover:bg-neon-magenta/80 transition mt-4 shadow-neon-magenta">
                                    {formData._id ? 'Update Changes' : 'Add to Pipeline'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Candidates;
