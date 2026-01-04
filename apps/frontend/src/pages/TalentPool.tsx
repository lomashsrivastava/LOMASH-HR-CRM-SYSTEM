import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    PlusIcon, MagnifyingGlassIcon, XMarkIcon, TrashIcon, EllipsisHorizontalIcon,
    PencilIcon, EyeIcon, ArrowUpTrayIcon, ArrowDownTrayIcon, BriefcaseIcon,
    MapPinIcon, EnvelopeIcon, CheckBadgeIcon, ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface Talent {
    _id: string;
    name: string;
    role: string;
    skills: string[];
    email: string;
    status: string;
    experience?: number;
    location?: string;
    linkedIn?: string;
    phone?: string;
    notes?: string;
    tags?: string[];
}

const TalentPool = () => {
    const { token } = useAuth();
    const [talents, setTalents] = useState<Talent[]>([]);
    const [filteredTalents, setFilteredTalents] = useState<Talent[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals & Selectors
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Form
    const [formData, setFormData] = useState<Partial<Talent>>({
        name: '', role: '', skills: [], email: '', status: 'Available', experience: 0, location: ''
    });

    useEffect(() => {
        if (token) fetchTalents();
        const handleClickOutside = () => setActiveMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [token]);

    useEffect(() => {
        let result = talents;
        if (searchTerm) {
            const lowerInfo = searchTerm.toLowerCase();
            result = result.filter(t =>
                t.name.toLowerCase().includes(lowerInfo) ||
                t.email.toLowerCase().includes(lowerInfo) ||
                t.skills.some(s => s.toLowerCase().includes(lowerInfo))
            );
        }
        if (statusFilter !== 'All') {
            result = result.filter(t => t.status === statusFilter);
        }
        setFilteredTalents(result);
    }, [talents, searchTerm, statusFilter]);

    const fetchTalents = async () => {
        try {
            const { data } = await axios.get('http://localhost:4000/api/v1/talent-pool', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTalents(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                skills: Array.isArray(formData.skills) ? formData.skills : (formData.skills as any).split(',').map((s: string) => s.trim())
            };

            if (formData._id) {
                await axios.put(`http://localhost:4000/api/v1/talent-pool/${formData._id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('http://localhost:4000/api/v1/talent-pool', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            fetchTalents();
            setIsModalOpen(false);
            setFormData({});
        } catch (error: any) {
            alert(`Failed to save: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            await axios.delete(`http://localhost:4000/api/v1/talent-pool/${deleteConfirmId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDeleteConfirmId(null);
            fetchTalents();
        } catch (error: any) {
            alert(`Delete failed: ${error.message}`);
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedIds.length} talents?`)) return;
        try {
            const promises = selectedIds.map(id => axios.delete(`http://localhost:4000/api/v1/talent-pool/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            }));
            await Promise.all(promises);
            setSelectedIds([]);
            fetchTalents();
        } catch (error) {
            console.error(error);
        }
    };

    const handleExport = () => {
        const headers = ['Name', 'Email', 'Role', 'Status', 'Experience', 'Location'];
        const rows = filteredTalents.map(t => [t.name, t.email, t.role, t.status, t.experience || 0, t.location || '']);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const link = document.createElement("a");
        link.href = encodeURI(csvContent);
        link.download = "talent_pool.csv";
        document.body.appendChild(link);
        link.click();
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (evt) => {
            const text = evt.target?.result as string;
            const lines = text.split('\n');
            const newTalents = [];
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                const [name, email, role, skills] = lines[i].split(',');
                if (name && email) {
                    newTalents.push({
                        name: name.trim(), email: email.trim(), role: role?.trim(),
                        skills: skills ? skills.split(';').map(s => s.trim()) : [], status: 'Available'
                    });
                }
            }
            if (newTalents.length > 0) {
                try {
                    await axios.post('http://localhost:4000/api/v1/talent-pool/bulk', newTalents, { headers: { Authorization: `Bearer ${token}` } });
                    fetchTalents();
                    alert(`Imported ${newTalents.length} candidates.`);
                } catch (err) { console.error(err); alert('Import failed'); }
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6 h-full flex flex-col relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Talent Pool</h1>
                    <p className="text-gray-400 mt-1">Search, tag, and manage potential candidates.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {selectedIds.length > 0 && (
                        <button onClick={handleBulkDelete} className="bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-2 rounded-lg hover:bg-red-500/30 transition text-sm font-bold flex items-center gap-2">
                            <TrashIcon className="w-4 h-4" /> Delete ({selectedIds.length})
                        </button>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="bg-white/5 text-gray-300 border border-white/10 px-3 py-2 rounded-lg hover:bg-white/10 transition text-sm flex items-center gap-2">
                        <ArrowUpTrayIcon className="w-4 h-4" /> Import
                    </button>
                    <button onClick={handleExport} className="bg-white/5 text-gray-300 border border-white/10 px-3 py-2 rounded-lg hover:bg-white/10 transition text-sm flex items-center gap-2">
                        <ArrowDownTrayIcon className="w-4 h-4" /> Export
                    </button>
                    <button onClick={() => { setFormData({}); setIsModalOpen(true); }} className="bg-neon-magenta text-black px-4 py-2 rounded-lg font-bold hover:bg-neon-magenta/80 shadow-lg shadow-neon-magenta/20 transition flex items-center gap-2">
                        <PlusIcon className="w-5 h-5" /> Add Talent
                    </button>
                </div>
            </div>

            <div className="glass-panel p-3 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
                    <input type="text" placeholder="Search by name, email, or skills..." className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-neon-magenta outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <select className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-neon-magenta outline-none" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="All">All Statuses</option>
                    <option value="Available">Available</option>
                    <option value="Reviewing">Reviewing</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Blacklisted">Blacklisted</option>
                </select>
            </div>

            <div className="glass-panel overflow-hidden flex-1 flex flex-col">
                <div className="overflow-auto custom-scrollbar flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#1a1a2e] text-gray-400 uppercase text-xs sticky top-0 z-10 font-bold">
                            <tr>
                                <th className="p-4 w-10 border-b border-white/5"><input type="checkbox" onChange={e => setSelectedIds(e.target.checked ? filteredTalents.map(t => t._id) : [])} checked={selectedIds.length === filteredTalents.length && filteredTalents.length > 0} className="rounded bg-black/20 border-gray-600 text-neon-magenta focus:ring-neon-magenta" /></th>
                                <th className="p-4 border-b border-white/5">Candidate</th>
                                <th className="p-4 border-b border-white/5">Role & Experience</th>
                                <th className="p-4 border-b border-white/5">Skills</th>
                                <th className="p-4 border-b border-white/5">Status</th>
                                <th className="p-4 border-b border-white/5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {filteredTalents.map(t => (
                                <tr key={t._id} className="hover:bg-white/5 transition group">
                                    <td className="p-4"><input type="checkbox" checked={selectedIds.includes(t._id)} onChange={() => setSelectedIds(prev => prev.includes(t._id) ? prev.filter(x => x !== t._id) : [...prev, t._id])} className="rounded bg-black/20 border-gray-600 text-neon-magenta focus:ring-neon-magenta" /></td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setSelectedTalent(t); setIsViewModalOpen(true); }}>
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center font-bold text-white shadow-lg">{t.name.charAt(0)}</div>
                                            <div>
                                                <div className="font-bold text-white group-hover:text-neon-magenta transition">{t.name}</div>
                                                <div className="text-xs text-gray-500">{t.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-gray-300">{t.role}</div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1"><BriefcaseIcon className="w-3 h-3" /> {t.experience || 0} Years • {t.location || 'Remote'}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1">
                                            {t.skills.slice(0, 3).map((s, i) => <span key={i} className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-400 border border-white/10">{s}</span>)}
                                            {t.skills.length > 3 && <span className="text-[10px] text-gray-500">+{t.skills.length - 3}</span>}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${t.status === 'Available' ? 'bg-green-500/10 text-green-400' :
                                            t.status === 'Blacklisted' ? 'bg-red-500/10 text-red-400' :
                                                'bg-blue-500/10 text-blue-400'
                                            }`}>{t.status}</span>
                                    </td>
                                    <td className="p-4 text-right relative">
                                        <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === t._id ? null : t._id); }} className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"><EllipsisHorizontalIcon className="w-5 h-5" /></button>
                                        <AnimatePresence>
                                            {activeMenuId === t._id && (
                                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 top-8 w-40 bg-[#0f111a] border border-white/10 rounded-lg shadow-2xl z-50 text-left overflow-hidden">
                                                    <button onClick={() => { setSelectedTalent(t); setIsViewModalOpen(true); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-white/5 flex items-center gap-2"><EyeIcon className="w-3 h-3" /> View Profile</button>
                                                    <button onClick={() => { setFormData(t); setIsModalOpen(true); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-white/5 flex items-center gap-2"><PencilIcon className="w-3 h-3" /> Edit</button>
                                                    <div className="border-t border-white/5 my-1"></div>
                                                    <button onClick={() => { setDeleteConfirmId(t._id); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2"><TrashIcon className="w-3 h-3" /> Delete</button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Details Modal */}
            <AnimatePresence>
                {isViewModalOpen && selectedTalent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} onClick={e => e.stopPropagation()} className="bg-[#1a1a2e] border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
                            <div className="p-6 border-b border-white/10 flex justify-between items-start bg-gradient-to-r from-pink-900/20 to-purple-900/20">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-2xl font-bold text-white border-4 border-[#1a1a2e] shadow-lg">
                                        {selectedTalent.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{selectedTalent.name}</h2>
                                        <p className="text-neon-magenta font-medium">{selectedTalent.role}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsViewModalOpen(false)} className="bg-black/20 hover:bg-white/10 p-2 rounded-full text-gray-400 hover:text-white transition"><XMarkIcon className="w-6 h-6" /></button>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="bg-white/5 p-4 rounded-lg">
                                        <p className="text-gray-500 text-xs font-bold uppercase mb-2">Contact Info</p>
                                        <div className="flex items-center gap-2 text-gray-300 mb-1"><EnvelopeIcon className="w-4 h-4" /> {selectedTalent.email}</div>
                                        <div className="flex items-center gap-2 text-gray-300"><MapPinIcon className="w-4 h-4" /> {selectedTalent.location || 'N/A'}</div>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-lg">
                                        <p className="text-gray-500 text-xs font-bold uppercase mb-2">Details</p>
                                        <div className="flex justify-between mb-2"><span className="text-gray-400">Experience</span> <span className="text-white">{selectedTalent.experience || 0} Years</span></div>
                                        <div className="flex justify-between"><span className="text-gray-400">Status</span> <span className="text-neon-magenta">{selectedTalent.status}</span></div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs font-bold uppercase mb-2">Skills</p>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {selectedTalent.skills.map((s, i) => <span key={i} className="bg-neon-magenta/10 text-neon-magenta px-3 py-1 rounded-full text-xs font-bold border border-neon-magenta/20">{s}</span>)}
                                    </div>
                                    <p className="text-gray-500 text-xs font-bold uppercase mb-2">Notes</p>
                                    <p className="text-gray-400 text-sm italic">{selectedTalent.notes || 'No notes added yet.'}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#1a1a2e] border border-white/10 rounded-xl p-6 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
                            <h2 className="text-xl font-bold text-white mb-6">{formData._id ? 'Edit Talent' : 'Add New Talent'}</h2>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input required placeholder="Name" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-neon-magenta outline-none" />
                                    <input required placeholder="Email" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} className="bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-neon-magenta outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input required placeholder="Role" value={formData.role || ''} onChange={e => setFormData({ ...formData, role: e.target.value })} className="bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-neon-magenta outline-none" />
                                    <input type="number" placeholder="Experience (Years)" value={formData.experience || ''} onChange={e => setFormData({ ...formData, experience: Number(e.target.value) })} className="bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-neon-magenta outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-neon-magenta outline-none">
                                        <option value="Available">Available</option>
                                        <option value="Reviewing">Reviewing</option>
                                        <option value="Contacted">Contacted</option>
                                        <option value="Blacklisted">Blacklisted</option>
                                    </select>
                                    <input placeholder="Location" value={formData.location || ''} onChange={e => setFormData({ ...formData, location: e.target.value })} className="bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-neon-magenta outline-none" />
                                </div>
                                <input placeholder="Skills (comma separated)" value={Array.isArray(formData.skills) ? formData.skills.join(', ') : formData.skills || ''} onChange={e => setFormData({ ...formData, skills: e.target.value as any })} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-neon-magenta outline-none" />
                                <textarea placeholder="Notes / Comments" value={formData.notes || ''} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-neon-magenta outline-none h-24 resize-none" />

                                <div className="flex justify-end gap-3 mt-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                                    <button type="submit" className="px-6 py-2 bg-neon-magenta text-black font-bold rounded-lg hover:bg-neon-magenta/80">Save Talent</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirm */}
            <AnimatePresence>
                {deleteConfirmId && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#1a1a2e] border border-red-500/30 rounded-xl p-6 w-full max-w-md shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-2 text-red-400 flex items-center gap-2"><ExclamationTriangleIcon className="w-6 h-6" /> Delete Candidate?</h3>
                            <p className="text-gray-400 mb-6">Are you sure you want to remove this candidate from the pool?</p>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-white/5 border border-white/5">Cancel</button>
                                <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold">Delete</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default TalentPool;
