import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    PlusIcon, XMarkIcon, MagnifyingGlassIcon, UserGroupIcon, BriefcaseIcon, ClockIcon,
    CheckCircleIcon, TrashIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, EllipsisHorizontalIcon,
    ExclamationTriangleIcon, PencilIcon, EyeIcon
} from '@heroicons/react/24/outline';

interface Employee {
    _id: string;
    name: string;
    role: string;
    department: string;
    email: string;
    status: string;
    checkInTime?: string;
    joinDate?: string;
    performance?: number;
    workMode?: string;
    skills?: string[];
    emergencyContact?: string;
    salary?: number;
    phone?: string;
    address?: string;
}

const Employees = () => {
    const { token } = useAuth();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    // Advanced Select/Filters
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [deptFilter, setDeptFilter] = useState('All');
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form Data
    const [formData, setFormData] = useState<Partial<Employee>>({
        name: '', role: '', department: '', email: '', status: 'Absent', workMode: 'Onsite', performance: 0
    });

    useEffect(() => {
        if (token) fetchEmployees();
        const handleClickOutside = () => setActiveMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [token]);

    useEffect(() => {
        let result = employees;
        if (searchTerm) {
            const lowerInfo = searchTerm.toLowerCase();
            result = result.filter(e => e.name.toLowerCase().includes(lowerInfo) || e.email.toLowerCase().includes(lowerInfo));
        }
        if (statusFilter !== 'All') result = result.filter(e => e.status === statusFilter);
        if (deptFilter !== 'All') result = result.filter(e => e.department === deptFilter);
        setFilteredEmployees(result);
    }, [employees, searchTerm, statusFilter, deptFilter]);

    const fetchEmployees = async () => {
        try {
            const { data } = await axios.get('http://localhost:4000/api/v1/employees', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmployees(data);
        } catch (error) {
            console.error('Failed to fetch', error);
        } finally {
            setLoading(false);
        }
    };

    // --- CRUD Operations ---

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (formData._id) {
                await axios.put(`http://localhost:4000/api/v1/employees/${formData._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('http://localhost:4000/api/v1/employees', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setIsAddModalOpen(false);
            setFormData({});
            fetchEmployees();
        } catch (error: any) {
            alert(`Error: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            await axios.delete(`http://localhost:4000/api/v1/employees/${deleteConfirmId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmployees(prev => prev.filter(e => e._id !== deleteConfirmId));
            setDeleteConfirmId(null);
        } catch (error: any) {
            alert(`Delete failed: ${error.message}`);
        }
    };

    const handleBulkDelete = async () => {
        try {
            const promises = selectedIds.map(id => axios.delete(`http://localhost:4000/api/v1/employees/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            }));
            await Promise.all(promises);
            setEmployees(prev => prev.filter(e => !selectedIds.includes(e._id)));
            setSelectedIds([]);
            setBulkDeleteConfirm(false);
        } catch (error) {
            console.error('Bulk delete failed', error);
            alert('Failed to delete some employees');
        }
    };

    // --- Import / Export ---

    const handleExport = () => {
        const headers = ['Name', 'Email', 'Role', 'Department', 'Status', 'Join Date', 'Salary', 'Phone'];
        const rows = filteredEmployees.map(e => [
            e.name, e.email, e.role, e.department, e.status,
            e.joinDate ? new Date(e.joinDate).toLocaleDateString() : '',
            e.salary || '', e.phone || ''
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "employees_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportClick = () => fileInputRef.current?.click();

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const text = evt.target?.result as string;
            // Simple CSV Parser
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

            const newEmployees = [];
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                const values = lines[i].split(',');
                const emp: any = { status: 'Absent' }; // defaults

                headers.forEach((h, index) => {
                    const val = values[index]?.trim();
                    if (h.includes('name')) emp.name = val;
                    else if (h.includes('email')) emp.email = val;
                    else if (h.includes('role')) emp.role = val;
                    else if (h.includes('department') || h.includes('dept')) emp.department = val;
                    else if (h.includes('status')) emp.status = val;
                    else if (h.includes('salary')) emp.salary = Number(val);
                });

                if (emp.name && emp.email) newEmployees.push(emp);
            }

            if (newEmployees.length > 0) {
                try {
                    await axios.post('http://localhost:4000/api/v1/employees/bulk-upload', newEmployees, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    alert(`Successfully imported ${newEmployees.length} employees!`);
                    fetchEmployees();
                } catch (err: any) {
                    alert('Import failed: ' + (err.response?.data?.message || err.message));
                }
            } else {
                alert('No valid employees found in CSV. Ensure headers are: Name, Email, Role, Department');
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset
    };

    const toggleMenu = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setActiveMenuId(activeMenuId === id ? null : id);
    };

    // Stats
    const stats = {
        total: employees.length,
        present: employees.filter(e => e.status === 'Present').length,
        wfh: employees.filter(e => e.workMode === 'Remote' || e.status === 'Remote').length,
        leave: employees.filter(e => e.status === 'On Leave').length
    };

    return (
        <div className="flex flex-col space-y-6 h-full relative pb-4">

            {/* Header Area */}
            <div className="flex flex-col space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Workforce Management</h1>
                        <p className="text-gray-400 mt-1">Manage staff, attendance, and performance.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {selectedIds.length > 0 && (
                            <button onClick={() => setBulkDeleteConfirm(true)} className="bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg hover:bg-red-500/30 transition text-sm font-bold flex items-center gap-2">
                                <TrashIcon className="w-4 h-4" /> Delete ({selectedIds.length})
                            </button>
                        )}

                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
                        <button onClick={handleImportClick} className="bg-white/5 text-gray-300 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/10 transition text-sm font-bold flex items-center gap-2">
                            <ArrowUpTrayIcon className="w-4 h-4" /> Import CSV
                        </button>
                        <button onClick={handleExport} className="bg-white/5 text-gray-300 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/10 transition text-sm font-bold flex items-center gap-2">
                            <ArrowDownTrayIcon className="w-4 h-4" /> Export
                        </button>
                        <button onClick={() => { setFormData({}); setIsAddModalOpen(true); }} className="bg-neon-cyan text-black px-4 py-2 rounded-lg font-bold hover:bg-neon-cyan/80 shadow-neon-cyan transition flex items-center gap-2">
                            <PlusIcon className="w-5 h-5" /> Add Employee
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="glass-panel p-4 flex items-center gap-4 border-l-4 border-l-blue-500">
                        <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400"><UserGroupIcon className="w-6 h-6" /></div>
                        <div><p className="text-gray-400 text-xs font-bold uppercase">Total Staff</p><p className="text-2xl font-bold text-white">{stats.total}</p></div>
                    </div>
                    <div className="glass-panel p-4 flex items-center gap-4 border-l-4 border-l-green-500">
                        <div className="p-3 bg-green-500/20 rounded-lg text-green-400"><CheckCircleIcon className="w-6 h-6" /></div>
                        <div><p className="text-gray-400 text-xs font-bold uppercase">Present</p><p className="text-2xl font-bold text-white">{stats.present}</p></div>
                    </div>
                    <div className="glass-panel p-4 flex items-center gap-4 border-l-4 border-l-purple-500">
                        <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400"><BriefcaseIcon className="w-6 h-6" /></div>
                        <div><p className="text-gray-400 text-xs font-bold uppercase">Remote/WFH</p><p className="text-2xl font-bold text-white">{stats.wfh}</p></div>
                    </div>
                    <div className="glass-panel p-4 flex items-center gap-4 border-l-4 border-l-yellow-500">
                        <div className="p-3 bg-yellow-500/20 rounded-lg text-yellow-400"><ClockIcon className="w-6 h-6" /></div>
                        <div><p className="text-gray-400 text-xs font-bold uppercase">On Leave</p><p className="text-2xl font-bold text-white">{stats.leave}</p></div>
                    </div>
                </div>

                {/* Filters */}
                <div className="glass-panel p-3 flex flex-wrap gap-4 items-center bg-[#1a1a2e]/50 border border-white/5 rounded-xl">
                    <div className="relative flex-1 min-w-[200px]">
                        <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
                        <input type="text" placeholder="Search employees..." className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-neon-cyan focus:outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <select className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none text-sm" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                        <option value="All">All Departments</option>
                        {Array.from(new Set(employees.map(e => e.department).filter(Boolean))).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="All">All Statuses</option>
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="On Leave">On Leave</option>
                    </select>
                </div>
            </div>

            {/* Main Content Table */}
            <div className="glass-panel overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#1a1a2e] text-gray-400 uppercase text-xs sticky top-0 z-10 font-bold tracking-wider">
                            <tr>
                                <th className="p-4 w-10 border-b border-white/5"><input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? filteredEmployees.map(x => x._id) : [])} checked={selectedIds.length === filteredEmployees.length && filteredEmployees.length > 0} className="rounded border-gray-600 bg-black/20 focus:ring-neon-cyan text-neon-cyan" /></th>
                                <th className="p-4 border-b border-white/5">Employee</th>
                                <th className="p-4 border-b border-white/5">Department</th>
                                <th className="p-4 border-b border-white/5">Status</th>
                                <th className="p-4 border-b border-white/5">Mode</th>
                                <th className="p-4 border-b border-white/5">Performance</th>
                                <th className="p-4 border-b border-white/5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {filteredEmployees.map(emp => (
                                <tr key={emp._id} className="hover:bg-white/5 transition group">
                                    <td className="p-4"><input type="checkbox" checked={selectedIds.includes(emp._id)} onChange={() => setSelectedIds(prev => prev.includes(emp._id) ? prev.filter(x => x !== emp._id) : [...prev, emp._id])} className="rounded border-gray-600 bg-black/20 focus:ring-neon-cyan text-neon-cyan" /></td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setSelectedEmployee(emp); setIsViewModalOpen(true); }}>
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs">{emp.name.charAt(0)}</div>
                                            <div>
                                                <div className="font-bold text-white group-hover:text-neon-cyan transition">{emp.name}</div>
                                                <div className="text-xs text-gray-500">{emp.role}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-300">{emp.department}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide
                                            ${emp.status === 'Present' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                emp.status === 'Absent' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-400">{emp.workMode || 'Onsite'}</td>
                                    <td className="p-4">
                                        <div className="flex text-yellow-500 text-xs">
                                            {[...Array(5)].map((_, i) => <span key={i} className={i < (emp.performance || 0) ? '' : 'text-gray-700'}>★</span>)}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right relative">
                                        <button onClick={(e) => toggleMenu(e, emp._id)} className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"><EllipsisHorizontalIcon className="w-5 h-5" /></button>
                                        <AnimatePresence>
                                            {activeMenuId === emp._id && (
                                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 top-8 w-40 bg-[#0f111a] border border-white/10 rounded-lg shadow-2xl z-50 text-left overflow-hidden">
                                                    <button onClick={() => { setSelectedEmployee(emp); setIsViewModalOpen(true); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-white/5 flex items-center gap-2"><EyeIcon className="w-3 h-3" /> View Details</button>
                                                    <button onClick={() => { setFormData(emp); setIsAddModalOpen(true); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-white/5 flex items-center gap-2"><PencilIcon className="w-3 h-3" /> Edit</button>
                                                    <div className="border-t border-white/5 my-1"></div>
                                                    <button onClick={() => { setDeleteConfirmId(emp._id); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2"><TrashIcon className="w-3 h-3" /> Delete</button>
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
                {isViewModalOpen && selectedEmployee && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} onClick={e => e.stopPropagation()} className="bg-[#1a1a2e] border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
                            <div className="p-6 border-b border-white/10 flex justify-between items-start bg-gradient-to-r from-blue-900/20 to-purple-900/20">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white border-4 border-[#1a1a2e] shadow-lg">
                                        {selectedEmployee.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{selectedEmployee.name}</h2>
                                        <p className="text-neon-cyan font-medium">{selectedEmployee.role}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsViewModalOpen(false)} className="bg-black/20 hover:bg-white/10 p-2 rounded-full text-gray-400 hover:text-white transition"><XMarkIcon className="w-6 h-6" /></button>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-sm uppercase text-gray-500 font-bold mb-4 tracking-wider">Professional Details</h3>
                                    <div className="space-y-4">
                                        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                            <p className="text-xs text-gray-400">Department</p>
                                            <p className="text-white font-medium">{selectedEmployee.department}</p>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                            <p className="text-xs text-gray-400">Email Address</p>
                                            <p className="text-white font-medium">{selectedEmployee.email}</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex-1">
                                                <p className="text-xs text-gray-400">Status</p>
                                                <span className="text-white font-bold inline-block mt-1">{selectedEmployee.status}</span>
                                            </div>
                                            <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex-1">
                                                <p className="text-xs text-gray-400">Work Mode</p>
                                                <span className="text-white font-bold inline-block mt-1">{selectedEmployee.workMode}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm uppercase text-gray-500 font-bold mb-4 tracking-wider">Additional Info</h3>
                                    <div className="space-y-4">
                                        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                            <p className="text-xs text-gray-400">Skills</p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {selectedEmployee.skills?.map((s, i) => <span key={i} className="text-xs bg-black/40 px-2 py-1 rounded text-cyan-400 border border-cyan-500/30">{s}</span>) || <span className="text-gray-500 italic">No skills listed</span>}
                                            </div>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                            <p className="text-xs text-gray-400">Salary</p>
                                            <p className="text-white font-medium font-mono">${selectedEmployee.salary?.toLocaleString() || 'N/A'}</p>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                            <p className="text-xs text-gray-400">Joined Date</p>
                                            <p className="text-white font-medium">{selectedEmployee.joinDate ? new Date(selectedEmployee.joinDate).toDateString() : 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-black/20">
                                <button onClick={() => { setIsViewModalOpen(false); setFormData(selectedEmployee); setIsAddModalOpen(true); }} className="px-4 py-2 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 rounded-lg font-bold hover:bg-neon-cyan/30 transition">Edit Full Profile</button>
                                <button onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition">Close</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#1a1a2e] border border-white/10 rounded-xl p-6 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
                            <h2 className="text-xl font-bold text-white mb-6">{formData._id ? 'Edit Employee' : 'New Employee'}</h2>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input required placeholder="Full Name" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-neon-cyan outline-none" />
                                    <input required placeholder="Email" type="email" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} className="bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-neon-cyan outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input required placeholder="Role / Title" value={formData.role || ''} onChange={e => setFormData({ ...formData, role: e.target.value })} className="bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-neon-cyan outline-none" />
                                    <input required placeholder="Department" value={formData.department || ''} onChange={e => setFormData({ ...formData, department: e.target.value })} className="bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-neon-cyan outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-neon-cyan outline-none">
                                        <option value="Present">Present</option>
                                        <option value="Absent">Absent</option>
                                        <option value="On Leave">On Leave</option>
                                    </select>
                                    <select value={formData.workMode} onChange={e => setFormData({ ...formData, workMode: e.target.value })} className="bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-neon-cyan outline-none">
                                        <option value="Onsite">Onsite</option>
                                        <option value="Remote">Remote</option>
                                        <option value="Hybrid">Hybrid</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="number" placeholder="Salary" value={formData.salary || ''} onChange={e => setFormData({ ...formData, salary: Number(e.target.value) })} className="bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-neon-cyan outline-none" />
                                    <input placeholder="Skills (comma sep)" value={formData.skills?.join(', ') || ''} onChange={e => setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()) })} className="bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-neon-cyan outline-none" />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                                    <button type="submit" className="px-6 py-2 bg-neon-cyan text-black font-bold rounded-lg hover:bg-neon-cyan/80 shadow-lg shadow-neon-cyan/20">Save Employee</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Custom Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirmId && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#1a1a2e] border border-red-500/30 rounded-xl p-6 w-full max-w-md shadow-2xl">
                            <div className="flex items-center gap-3 mb-4 text-red-400">
                                <ExclamationTriangleIcon className="w-8 h-8" />
                                <h3 className="text-xl font-bold text-white">Delete Employee?</h3>
                            </div>
                            <p className="text-gray-400 mb-6">Are you sure? This will permanently remove this employee record.</p>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-white/5 border border-white/5">Cancel</button>
                                <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/20">Delete Forever</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Bulk Delete Confirm */}
            <AnimatePresence>
                {bulkDeleteConfirm && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#1a1a2e] border border-red-500/30 rounded-xl p-6 w-full max-w-md shadow-2xl">
                            <div className="flex items-center gap-3 mb-4 text-red-400">
                                <ExclamationTriangleIcon className="w-8 h-8" />
                                <h3 className="text-xl font-bold text-white">Bulk Delete?</h3>
                            </div>
                            <p className="text-gray-400 mb-6">You are about to delete <span className="font-bold text-white">{selectedIds.length}</span> employees. This is irreversible.</p>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setBulkDeleteConfirm(false)} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-white/5 border border-white/5">Cancel</button>
                                <button onClick={handleBulkDelete} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/20">Delete {selectedIds.length} Employees</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default Employees;
