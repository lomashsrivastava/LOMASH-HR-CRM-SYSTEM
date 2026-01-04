import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    DocumentCheckIcon, PlusIcon, XMarkIcon, TrashIcon, PencilIcon, PaperAirplaneIcon,
    CurrencyDollarIcon, CalendarIcon, BriefcaseIcon, BuildingOfficeIcon, GiftIcon,
    ArrowDownTrayIcon, PrinterIcon, EllipsisHorizontalIcon, ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface Offer {
    _id: string;
    candidateId: { _id: string, name: string, email: string };
    role: string;
    department: string;
    salary: number;
    bonus: number;
    equity: string;
    benefits: string[];
    joiningDate: string;
    expiryDate: string;
    status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Withdrawn' | 'Expired';
    sentDate?: string;
    notes?: string;
}

const Offers = () => {
    const { token } = useAuth();
    const [offers, setOffers] = useState<Offer[]>([]);
    const [candidates, setCandidates] = useState<{ _id: string, name: string }[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

    // Form
    const initialForm = {
        candidateId: '', role: '', department: '', salary: 0, bonus: 0, equity: '',
        joiningDate: '', expiryDate: '', benefits: [] as string[], notes: '', status: 'Draft'
    };
    const [formData, setFormData] = useState(initialForm);
    const [tempBenefit, setTempBenefit] = useState('');

    useEffect(() => {
        if (token) fetchOffers();
    }, [token]);

    const fetchOffers = async () => {
        try {
            const [offerRes, candRes] = await Promise.all([
                axios.get('http://localhost:4000/api/v1/offers', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:4000/api/v1/candidates', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setOffers(offerRes.data);
            setCandidates(candRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (selectedOffer?._id) {
                await axios.put(`http://localhost:4000/api/v1/offers/${selectedOffer._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('http://localhost:4000/api/v1/offers', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            fetchOffers();
            setIsModalOpen(false);
            setFormData(initialForm);
            setSelectedOffer(null);
        } catch (error: any) {
            alert(`Error: ${error.response?.data?.message || 'Failed to save offer'}`);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            await axios.delete(`http://localhost:4000/api/v1/offers/${deleteConfirmId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOffers(prev => prev.filter(o => o._id !== deleteConfirmId));
            setDeleteConfirmId(null);
        } catch (error) {
            console.error(error);
            alert('Failed to delete offer');
        }
    };

    const handleSendOffer = async (offer: Offer) => {
        if (!confirm(`Send official offer letter to ${offer.candidateId?.name}?`)) return;
        try {
            await axios.post(`http://localhost:4000/api/v1/offers/${offer._id}/send`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchOffers();
            alert('Offer sent successfully!');
        } catch (error) {
            alert('Failed to send offer');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const openEdit = (offer: Offer) => {
        setSelectedOffer(offer);
        setFormData({
            candidateId: offer.candidateId?._id || '',
            role: offer.role,
            department: offer.department || '',
            salary: offer.salary,
            bonus: offer.bonus || 0,
            equity: offer.equity || '',
            joiningDate: offer.joiningDate ? new Date(offer.joiningDate).toISOString().split('T')[0] : '',
            expiryDate: offer.expiryDate ? new Date(offer.expiryDate).toISOString().split('T')[0] : '',
            benefits: offer.benefits || [],
            notes: offer.notes || '',
            status: offer.status as any
        });
        setIsModalOpen(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Accepted': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'Rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'Sent': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'Withdrawn': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
            default: return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col relative offers-container">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Offer Management</h1>
                    <p className="text-gray-400 mt-1">Create, track, and manage employment offers.</p>
                </div>
                <button
                    onClick={() => { setSelectedOffer(null); setFormData(initialForm); setIsModalOpen(true); }}
                    className="bg-neon-magenta text-black px-4 py-2 rounded-lg font-bold hover:bg-neon-magenta/80 transition flex items-center space-x-2 shadow-lg shadow-neon-magenta/20"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Create New Offer</span>
                </button>
            </div>

            {/* Offers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar pb-4">
                {offers.map(offer => (
                    <motion.div
                        key={offer._id}
                        whileHover={{ y: -5 }}
                        className="glass-panel p-6 border border-white/5 hover:border-neon-magenta/30 transition group relative overflow-hidden flex flex-col justify-between min-h-[220px]"
                    >
                        {/* Status Badge */}
                        <div className="absolute top-4 right-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${getStatusColor(offer.status)}`}>
                                {offer.status}
                            </span>
                        </div>

                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg text-neon-magenta">
                                    <DocumentCheckIcon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">{offer.candidateId?.name || 'Unknown Candidate'}</h3>
                                    <p className="text-gray-400 text-sm">{offer.role}</p>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-gray-300">
                                <div className="flex items-center gap-2">
                                    <CurrencyDollarIcon className="w-4 h-4 text-green-400" />
                                    <span>${offer.salary?.toLocaleString()} <span className="text-gray-500">/ yr</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="w-4 h-4 text-blue-400" />
                                    <span>Joins: {offer.joiningDate ? new Date(offer.joiningDate).toLocaleDateString() : 'TBD'}</span>
                                </div>
                                {offer.expiryDate && (
                                    <div className="flex items-center gap-2">
                                        <ExclamationTriangleIcon className="w-4 h-4 text-orange-400" />
                                        <span>Expires: {new Date(offer.expiryDate).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-white/10 pt-4 mt-4 flex justify-between items-center">
                            <button onClick={() => { setSelectedOffer(offer); setIsViewModalOpen(true); }} className="text-sm text-gray-400 hover:text-white flex items-center gap-1 hover:underline">
                                View Details
                            </button>
                            <div className="flex gap-2">
                                {(offer.status === 'Draft') && (
                                    <button onClick={() => handleSendOffer(offer)} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition" title="Send Offer">
                                        <PaperAirplaneIcon className="w-4 h-4" />
                                    </button>
                                )}
                                <button onClick={() => openEdit(offer)} className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition" title="Edit">
                                    <PencilIcon className="w-4 h-4" />
                                </button>
                                <button onClick={() => setDeleteConfirmId(offer._id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition" title="Delete">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {offers.length === 0 && !loading && (
                    <div className="col-span-full py-20 text-center text-gray-500">
                        <GiftIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="text-lg">No offers generated yet.</p>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#1a1a2e] border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <h2 className="text-xl font-bold text-white">{selectedOffer ? 'Edit Offer' : 'Generate New Offer'}</h2>
                                <button onClick={() => setIsModalOpen(false)}><XMarkIcon className="w-6 h-6 text-gray-400 hover:text-white" /></button>
                            </div>

                            <form onSubmit={handleSave} className="p-6 space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase text-gray-500 mb-1 font-bold">Candidate</label>
                                        <select required value={formData.candidateId} onChange={e => setFormData({ ...formData, candidateId: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-neon-magenta outline-none">
                                            <option value="">Select Candidate</option>
                                            {candidates.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase text-gray-500 mb-1 font-bold">Status</label>
                                        <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-neon-magenta outline-none">
                                            <option value="Draft">Draft</option>
                                            <option value="Sent">Sent</option>
                                            <option value="Accepted">Accepted</option>
                                            <option value="Rejected">Rejected</option>
                                            <option value="Withdrawn">Withdrawn</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase text-gray-500 mb-1 font-bold">Role Title</label>
                                        <input required value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-neon-magenta outline-none" placeholder="e.g. Senior Developer" />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase text-gray-500 mb-1 font-bold">Department</label>
                                        <input value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-neon-magenta outline-none" placeholder="e.g. Engineering" />
                                    </div>
                                </div>

                                {/* Compensation */}
                                <div className="border-t border-white/5 pt-4">
                                    <h3 className="text-sm font-bold text-neon-magenta mb-4 uppercase flex items-center gap-2"><CurrencyDollarIcon className="w-4 h-4" /> Compensation</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Annual Salary</label>
                                            <input type="number" required value={formData.salary || ''} onChange={e => setFormData({ ...formData, salary: Number(e.target.value) })} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-neon-magenta outline-none" placeholder="0" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Sign-on Bonus</label>
                                            <input type="number" value={formData.bonus || ''} onChange={e => setFormData({ ...formData, bonus: Number(e.target.value) })} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-neon-magenta outline-none" placeholder="0" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Equity / Options</label>
                                            <input value={formData.equity} onChange={e => setFormData({ ...formData, equity: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-neon-magenta outline-none" placeholder="e.g. 0.1%" />
                                        </div>
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase text-gray-500 mb-1 font-bold">Joining Date</label>
                                        <input type="date" value={formData.joiningDate} onChange={e => setFormData({ ...formData, joiningDate: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-neon-magenta outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase text-gray-500 mb-1 font-bold">Offer Expiry</label>
                                        <input type="date" value={formData.expiryDate} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-neon-magenta outline-none" />
                                    </div>
                                </div>

                                {/* Benefits */}
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1 font-bold">Benefits & Perks</label>
                                    <div className="flex gap-2 mb-2">
                                        <input value={tempBenefit} onChange={e => setTempBenefit(e.target.value)} className="flex-1 bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-neon-magenta outline-none" placeholder="Add a benefit (e.g. Health Insurance)" onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (tempBenefit) { setFormData({ ...formData, benefits: [...formData.benefits, tempBenefit] }); setTempBenefit(''); }
                                            }
                                        }} />
                                        <button type="button" onClick={() => { if (tempBenefit) { setFormData({ ...formData, benefits: [...formData.benefits, tempBenefit] }); setTempBenefit(''); } }} className="px-4 bg-white/10 rounded-lg hover:bg-white/20 text-white"><PlusIcon className="w-5 h-5" /></button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.benefits.map((b, i) => (
                                            <span key={i} className="bg-neon-magenta/10 text-neon-magenta px-3 py-1 rounded-full text-sm border border-neon-magenta/20 flex items-center gap-2">
                                                {b} <button type="button" onClick={() => setFormData({ ...formData, benefits: formData.benefits.filter((_, idx) => idx !== i) })}><XMarkIcon className="w-3 h-3 hover:text-white" /></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-neon-magenta text-black font-bold py-3 rounded-lg hover:bg-neon-magenta/80 shadow-lg shadow-neon-magenta/20 transition text-lg mt-6">
                                    {selectedOffer ? 'Update Offer' : 'Generate Offer'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* View Offer Letter Modal */}
            <AnimatePresence>
                {isViewModalOpen && selectedOffer && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white text-black rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                            <button onClick={() => setIsViewModalOpen(false)} className="absolute top-4 right-4 bg-gray-200 p-2 rounded-full hover:bg-gray-300 print:hidden"><XMarkIcon className="w-6 h-6" /></button>

                            <div className="p-12 print:p-0">
                                {/* Letter Header */}
                                <div className="border-b-2 border-gray-100 pb-8 mb-8 flex justify-between items-start">
                                    <div>
                                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">EMPLOYMENT OFFER</h1>
                                        <p className="text-gray-500 mt-2">Private & Confidential</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-gray-900">PixelHR Inc.</div>
                                        <p className="text-gray-500 text-sm">123 Innovation Drive<br />Tech City, TC 90210</p>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="space-y-6 text-lg leading-relaxed text-gray-700">
                                    <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                                    <p><strong>To:</strong> {selectedOffer.candidateId?.name}</p>

                                    <p>Dear {selectedOffer.candidateId?.name.split(' ')[0]},</p>

                                    <p>We are pleased to offer you the position of <strong>{selectedOffer.role}</strong> at PixelHR Inc., reporting to the <strong>{selectedOffer.department || 'Engineering'}</strong> department.</p>

                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 my-8">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Compensation Package</h3>
                                        <div className="grid grid-cols-2 gap-y-4">
                                            <div><strong>Annual Salary:</strong></div> <div>${selectedOffer.salary?.toLocaleString()}</div>
                                            {selectedOffer.bonus > 0 && <><div><strong>Signing Bonus:</strong></div> <div>${selectedOffer.bonus?.toLocaleString()}</div></>}
                                            {selectedOffer.equity && <><div><strong>Equity:</strong></div> <div>{selectedOffer.equity}</div></>}
                                            <div><strong>Start Date:</strong></div> <div>{selectedOffer.joiningDate ? new Date(selectedOffer.joiningDate).toLocaleDateString() : 'TBD'}</div>
                                        </div>
                                    </div>

                                    {selectedOffer.benefits?.length > 0 && (
                                        <div>
                                            <p className="font-bold mb-2">Benefits:</p>
                                            <ul className="list-disc pl-5 space-y-1">
                                                {selectedOffer.benefits.map((b, i) => <li key={i}>{b}</li>)}
                                            </ul>
                                        </div>
                                    )}

                                    <p>This offer is valid until <strong>{selectedOffer.expiryDate ? new Date(selectedOffer.expiryDate).toLocaleDateString() : '3 days from today'}</strong>.</p>
                                    <p>We are excited about the possibility of you joining our team and believing that you will make a significant contribution to the growth and success of the company.</p>

                                    <br />
                                    <p>Sincerely,</p>
                                    <p className="font-bold font-signature text-2xl mt-4">Hiring Manager</p>
                                    <p>PixelHR Inc.</p>
                                </div>

                                {/* Footer Actions */}
                                <div className="mt-12 pt-8 border-t border-gray-100 flex justify-end gap-4 print:hidden">
                                    <button onClick={handlePrint} className="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 transition flex items-center gap-2">
                                        <PrinterIcon className="w-5 h-5" /> Print / Save PDF
                                    </button>
                                    <button onClick={() => { handleSendOffer(selectedOffer); setIsViewModalOpen(false); }} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2">
                                        <PaperAirplaneIcon className="w-5 h-5" /> Send to Candidate
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation */}
            <AnimatePresence>
                {deleteConfirmId && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#1a1a2e] border border-red-500/30 rounded-xl p-6 w-full max-w-md shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-2 text-red-400 flex items-center gap-2"><ExclamationTriangleIcon className="w-6 h-6" /> Revoke Offer?</h3>
                            <p className="text-gray-400 mb-6">Are you sure you want to delete this offer? This cannot be undone.</p>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-white/5 border border-white/5">Cancel</button>
                                <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold">Revoke Offer</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .offers-container, .offers-container * { visibility: visible; }
                    .print\\:hidden { display: none !important; }
                    .fixed { position: absolute; z-index: 9999; top: 0; left: 0; width: 100%; height: auto; background: white; }
                    .bg-black\\/90 { background: white !important; }
                    .text-white { color: black !important; }
                    .text-gray-400 { color: #666 !important; }
                    .glass-panel { border: none; box-shadow: none; color: black; }
                }
                .font-signature { font-family: 'Brush Script MT', cursive; }
            `}</style>
        </div>
    );
};

export default Offers;
