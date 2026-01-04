import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BriefcaseIcon, MapPinIcon, CurrencyDollarIcon, PlusIcon, XMarkIcon, CalendarIcon, TagIcon, TrashIcon, PencilSquareIcon, DocumentDuplicateIcon, ShareIcon, EllipsisHorizontalIcon, MagnifyingGlassIcon, BuildingOffice2Icon, AcademicCapIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface Job {
    _id: string;
    title: string;
    department: string;
    locations: string[];
    employmentType: string;
    status: string;
    createdAt: string;
    openDate?: string;
    description?: string;
    tags?: string[];
    salaryMin?: number;
    salaryMax?: number;
    currency?: string;
    experienceLevel?: string;
    workMode?: string;
}

const Jobs = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    // Confirmation Modals
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [viewJob, setViewJob] = useState<Job | null>(null);

    // Filters & Search
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deptFilter, setDeptFilter] = useState('all');

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        department: '',
        location: '',
        employmentType: 'Full-time',
        description: '',
        tags: '',
        openDate: new Date().toISOString().split('T')[0],
        status: 'open',
        salaryMin: '',
        salaryMax: '',
        currency: 'USD',
        experienceLevel: 'Mid',
        workMode: 'On-site'
    });

    useEffect(() => {
        fetchJobs();
        const handleClickOutside = () => setActiveMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const fetchJobs = async () => {
        try {
            const { data } = await axios.get('http://localhost:4000/api/v1/jobs', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(data);
        } catch (error) {
            console.error('Failed to fetch jobs', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdateJob = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                locations: [formData.location],
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                salaryMin: formData.salaryMin ? Number(formData.salaryMin) : undefined,
                salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
            };

            if (editingId) {
                await axios.put(`http://localhost:4000/api/v1/jobs/${editingId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('http://localhost:4000/api/v1/jobs', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            closeModal();
            fetchJobs();
        } catch (error) {
            console.error('Failed to save job', error);
            alert('Failed to save job. Please try again.');
        }
    };

    // Trigger Delete Modal
    const initiateDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setConfirmDeleteId(id);
        setActiveMenuId(null);
    };

    // Execute Delete
    const confirmDeleteJob = async () => {
        if (!confirmDeleteId) return;
        try {
            await axios.delete(`http://localhost:4000/api/v1/jobs/${confirmDeleteId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(prev => prev.filter(j => j._id !== confirmDeleteId));
            setConfirmDeleteId(null);
        } catch (error: any) {
            console.error('Delete failed', error);
            alert('Failed to delete job: ' + (error.response?.data?.message || 'Unknown error'));
        }
    };

    const handleDuplicate = (job: Job) => {
        setFormData({
            title: `${job.title} (Copy)`,
            department: job.department,
            location: job.locations[0] || '',
            employmentType: job.employmentType,
            description: job.description || '',
            tags: job.tags?.join(', ') || '',
            openDate: new Date().toISOString().split('T')[0],
            status: 'draft',
            salaryMin: job.salaryMin?.toString() || '',
            salaryMax: job.salaryMax?.toString() || '',
            currency: job.currency || 'USD',
            experienceLevel: job.experienceLevel || 'Mid',
            workMode: job.workMode || 'On-site'
        });
        setEditingId(null);
        setIsModalOpen(true);
        setActiveMenuId(null);
    };

    const handleEdit = (job: Job) => {
        setFormData({
            title: job.title,
            department: job.department,
            location: job.locations[0] || '',
            employmentType: job.employmentType,
            description: job.description || '',
            tags: job.tags?.join(', ') || '',
            openDate: job.openDate ? new Date(job.openDate).toISOString().split('T')[0] : '',
            status: job.status,
            salaryMin: job.salaryMin?.toString() || '',
            salaryMax: job.salaryMax?.toString() || '',
            currency: job.currency || 'USD',
            experienceLevel: job.experienceLevel || 'Mid',
            workMode: job.workMode || 'On-site'
        });
        setEditingId(job._id);
        setIsModalOpen(true);
        setActiveMenuId(null);
    };

    const toggleMenu = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setActiveMenuId(activeMenuId === id ? null : id);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            title: '', department: '', location: '',
            employmentType: 'Full-time', description: '',
            tags: '', openDate: new Date().toISOString().split('T')[0],
            status: 'open',
            salaryMin: '',
            salaryMax: '',
            currency: 'USD',
            experienceLevel: 'Mid',
            workMode: 'On-site'
        });
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        return "Today";
    };

    const filteredJobs = useMemo(() => {
        return jobs.filter(job => {
            const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.department.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
            const matchesDept = deptFilter === 'all' || job.department === deptFilter;
            return matchesSearch && matchesStatus && matchesDept;
        });
    }, [jobs, searchQuery, statusFilter, deptFilter]);

    const uniqueDepartments = useMemo(() => [...new Set(jobs.map(j => j.department))], [jobs]);

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Talent Acquisition</h1>
                    <p className="text-gray-400 mt-1">Manage openings, track status, and organize your hiring pipeline.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-neon-cyan text-black px-4 py-2 rounded-lg font-bold hover:bg-neon-cyan/80 shadow-neon-cyan transition transform hover:scale-105 flex items-center space-x-2"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Create Requisition</span>
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-[#1a1a2e]/50 p-4 rounded-xl border border-white/5">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search jobs by title, department..."
                        className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-neon-cyan focus:outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="draft">Draft</option>
                </select>
                <select
                    className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none"
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                >
                    <option value="all">All Departments</option>
                    {uniqueDepartments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="text-white">Loading jobs...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJobs.map((job) => (
                        <div key={job._id} className="glass-panel p-6 hover:border-neon-cyan/50 transition duration-300 group relative overflow-visible flex flex-col h-full">

                            {/* Header */}
                            <div className="flex justify-between items-start mb-4 relative z-20">
                                <div className="flex-1 pr-4">
                                    <h3 className="text-xl font-bold text-white group-hover:text-neon-cyan transition truncate" title={job.title}>
                                        {job.title}
                                    </h3>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold border ${job.status === 'open' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            job.status === 'closed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                                            {job.status}
                                        </span>
                                        {job.workMode && <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20">{job.workMode}</span>}
                                        {job.experienceLevel && <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20">{job.experienceLevel}</span>}
                                    </div>
                                </div>

                                <div className="relative">
                                    <button
                                        onClick={(e) => toggleMenu(e, job._id)}
                                        className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
                                    >
                                        <EllipsisHorizontalIcon className="w-6 h-6" />
                                    </button>

                                    {/* Dropdown Menu */}
                                    <AnimatePresence>
                                        {activeMenuId === job._id && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                className="absolute right-0 mt-2 w-48 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                                            >
                                                <button onClick={() => { setViewJob(job); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2">
                                                    <MagnifyingGlassIcon className="w-4 h-4" /> View Details
                                                </button>
                                                <button onClick={() => handleEdit(job)} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2">
                                                    <PencilSquareIcon className="w-4 h-4" /> Edit Requisition
                                                </button>
                                                <button onClick={() => handleDuplicate(job)} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2">
                                                    <DocumentDuplicateIcon className="w-4 h-4" /> Duplicate
                                                </button>
                                                <button onClick={(e) => initiateDelete(job._id, e)} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 border-t border-white/5">
                                                    <TrashIcon className="w-4 h-4" /> Delete Permanently
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="flex-1 space-y-4 text-sm text-gray-400 relative z-10">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex items-center space-x-2">
                                        <BuildingOffice2Icon className="w-4 h-4 text-neon-magenta shrink-0" />
                                        <span className="truncate">{job.department}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <MapPinIcon className="w-4 h-4 text-neon-blue shrink-0" />
                                        <span className="truncate">{job.locations.join(', ')}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <BriefcaseIcon className="w-4 h-4 text-gray-400 shrink-0" />
                                        <span className="truncate">{job.employmentType}</span>
                                    </div>
                                    {job.salaryMin && (
                                        <div className="flex items-center space-x-2">
                                            <CurrencyDollarIcon className="w-4 h-4 text-green-400 shrink-0" />
                                            <span className="truncate">{Number(job.salaryMin).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-2">
                                    <div className="flex flex-wrap gap-1">
                                        {job.tags && job.tags.slice(0, 3).map((tag, i) => (
                                            <span key={i} className="text-xs bg-white/5 px-1.5 py-0.5 rounded text-gray-500">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center relative z-10">
                                <span className="text-xs text-gray-600 flex items-center gap-1">
                                    <CalendarIcon className="w-3 h-3" /> {getTimeAgo(job.createdAt)}
                                </span>
                                <button onClick={() => navigate('/candidates')} className="text-neon-cyan text-sm hover:underline flex items-center gap-1">
                                    View Candidates &rarr;
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Add New Card Placeholder */}
                    <button onClick={() => setIsModalOpen(true)} className="border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:text-white hover:border-white/30 transition h-full min-h-[250px] group">
                        <div className="p-4 rounded-full bg-white/5 group-hover:bg-white/10 mb-4 transition">
                            <PlusIcon className="w-8 h-8" />
                        </div>
                        <span className="font-medium">Create New Requisition</span>
                    </button>

                    {filteredJobs.length === 0 && (
                        <div className="col-span-full text-center py-12 glass-panel border-dashed">
                            <MagnifyingGlassIcon className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                            <p className="text-gray-400">No jobs match your filters. Try clearing them.</p>
                            <button onClick={() => { setSearchQuery(''); setStatusFilter('all'); setDeptFilter('all'); }} className="mt-2 text-neon-cyan hover:underline">Clear Filters</button>
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Job Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#1a1a2e] border border-white/10 rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Requisition' : 'Create New Requisition'}</h2>
                                <button onClick={closeModal} className="text-gray-400 hover:text-white">
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateOrUpdateJob} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm text-gray-400 mb-1">Job Title</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white focus:border-neon-cyan focus:outline-none"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="e.g. Senior Frontend Engineer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Department</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white focus:border-neon-cyan focus:outline-none"
                                            value={formData.department}
                                            onChange={e => setFormData({ ...formData, department: e.target.value })}
                                            placeholder="e.g. Engineering"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Location</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white focus:border-neon-cyan focus:outline-none"
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                            placeholder="e.g. Remote / New York"
                                        />
                                    </div>

                                    {/* New Filter Fields */}
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Experience Level</label>
                                        <select
                                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white focus:border-neon-cyan focus:outline-none"
                                            value={formData.experienceLevel}
                                            onChange={e => setFormData({ ...formData, experienceLevel: e.target.value })}
                                        >
                                            <option value="Intern">Intern</option>
                                            <option value="Junior">Junior</option>
                                            <option value="Mid">Mid-Level</option>
                                            <option value="Senior">Senior</option>
                                            <option value="Lead">Lead</option>
                                            <option value="Executive">Executive</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Work Mode</label>
                                        <select
                                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white focus:border-neon-cyan focus:outline-none"
                                            value={formData.workMode}
                                            onChange={e => setFormData({ ...formData, workMode: e.target.value })}
                                        >
                                            <option value="On-site">On-site</option>
                                            <option value="Remote">Remote</option>
                                            <option value="Hybrid">Hybrid</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Employment Type</label>
                                        <select
                                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white focus:border-neon-cyan focus:outline-none"
                                            value={formData.employmentType}
                                            onChange={e => setFormData({ ...formData, employmentType: e.target.value })}
                                        >
                                            <option value="Full-time">Full-time</option>
                                            <option value="Part-time">Part-time</option>
                                            <option value="Contract">Contract</option>
                                            <option value="Internship">Internship</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Status</label>
                                        <select
                                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white focus:border-neon-cyan focus:outline-none"
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="open">Open</option>
                                            <option value="closed">Closed</option>
                                            <option value="draft">Draft</option>
                                            <option value="archived">Archived</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Salary Range</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white focus:border-neon-cyan focus:outline-none"
                                                value={formData.salaryMin}
                                                onChange={e => setFormData({ ...formData, salaryMin: e.target.value })}
                                                placeholder="Min"
                                            />
                                            <input
                                                type="number"
                                                className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white focus:border-neon-cyan focus:outline-none"
                                                value={formData.salaryMax}
                                                onChange={e => setFormData({ ...formData, salaryMax: e.target.value })}
                                                placeholder="Max"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Start/Post Date</label>
                                        <input
                                            type="date"
                                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white focus:border-neon-cyan focus:outline-none"
                                            value={formData.openDate}
                                            onChange={e => setFormData({ ...formData, openDate: e.target.value })}
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm text-gray-400 mb-1">Skills / Tags (comma separated)</label>
                                        <input
                                            type="text"
                                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white focus:border-neon-cyan focus:outline-none"
                                            value={formData.tags}
                                            onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                            placeholder="React, Node.js, TypeScript, AWS..."
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm text-gray-400 mb-1">Job Description</label>
                                        <textarea
                                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white focus:border-neon-cyan focus:outline-none h-32 custom-scrollbar resize-y"
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Enter detailed job description here..."
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-neon-cyan text-black font-bold py-2 rounded-lg hover:bg-neon-cyan/80 transition mt-4 shadow-neon-cyan">
                                    {editingId ? 'Update Requisition' : 'Publish Requisition'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
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
                                <h3 className="text-xl font-bold text-white">Delete Requisition?</h3>
                            </div>
                            <p className="text-gray-400 mb-6">Are you sure you want to permanently delete this job posting? This action cannot be undone and will remove all associated applicant links.</p>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-white/5 transition border border-white/5">Cancel</button>
                                <button onClick={confirmDeleteJob} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold transition shadow-lg shadow-red-500/20">Delete Forever</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* View Details Modal */}
            <AnimatePresence>
                {viewJob && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#1a1a2e] border border-white/10 rounded-xl p-6 w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{viewJob.title}</h2>
                                    <p className="text-neon-cyan mt-1">{viewJob.department} • {viewJob.locations.join(', ')}</p>
                                </div>
                                <button onClick={() => setViewJob(null)} className="text-gray-400 hover:text-white">
                                    <XMarkIcon className="w-8 h-8" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase ${viewJob.status === 'open' ? 'bg-green-500/20 text-green-400' :
                                            viewJob.status === 'closed' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                                        }`}>{viewJob.status}</span>
                                </div>
                                <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Salary Range</p>
                                    <p className="text-white font-medium">
                                        {viewJob.salaryMin ? `${viewJob.currency} ${viewJob.salaryMin.toLocaleString()} - ${viewJob.salaryMax?.toLocaleString()}` : 'Not specified'}
                                    </p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Posted</p>
                                    <p className="text-white font-medium">{new Date(viewJob.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-2 border-b border-white/10 pb-2">Description</h3>
                                    <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                                        {viewJob.description || 'No description provided.'}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-white mb-2 border-b border-white/10 pb-2">Experience & Work Mode</h3>
                                    <div className="flex gap-4">
                                        <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm">{viewJob.experienceLevel || 'Mid'} Level</span>
                                        <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm">{viewJob.workMode || 'On-site'}</span>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-white mb-2 border-b border-white/10 pb-2">Required Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {viewJob.tags && viewJob.tags.map((tag, i) => (
                                            <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300 border border-white/5">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/10 flex justify-end gap-3">
                                <button onClick={() => { setViewJob(null); handleEdit(viewJob); }} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition">Edit Job</button>
                                <button onClick={() => setViewJob(null)} className="px-4 py-2 rounded-lg bg-neon-cyan text-black font-bold hover:bg-neon-cyan/80 transition">Close</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Jobs;
