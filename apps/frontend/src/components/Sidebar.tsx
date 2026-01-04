import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    HomeIcon,
    BriefcaseIcon,
    UserGroupIcon,
    CalendarIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    DocumentTextIcon,
    ClipboardDocumentCheckIcon,
    UserPlusIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout, user } = useAuth();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: HomeIcon },
        { name: 'Jobs', path: '/jobs', icon: BriefcaseIcon },
        { name: 'Candidates', path: '/candidates', icon: UserGroupIcon },
        { name: 'Interviews', path: '/interviews', icon: CalendarIcon },
        { name: 'Employees', path: '/employees', icon: UserGroupIcon },

        // Advanced Features
        { name: 'AI Hub', path: '/ai-hub', icon: SparklesIcon },
        { name: 'Assessments', path: '/assessments', icon: ClipboardDocumentCheckIcon },
        { name: 'Talent Pool', path: '/talent-pool', icon: UserGroupIcon },
        { name: 'Offers', path: '/offers', icon: DocumentTextIcon },
        { name: 'Onboarding', path: '/onboarding', icon: UserPlusIcon },

        { name: 'Analytics', path: '/analytics', icon: ChartBarIcon },
        { name: 'Settings', path: '/settings', icon: Cog6ToothIcon },
    ];

    return (
        <div className="w-64 glass-panel m-4 flex flex-col h-[calc(100vh-2rem)] sticky top-4 overflow-hidden shadow-2xl bg-[#13131f]/50 backdrop-blur-xl border border-white/10 rounded-2xl">
            <div className="p-6 border-b border-white/5 relative overflow-hidden group">
                {/* Dynamic Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/10 via-neon-magenta/10 to-neon-violet/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700 blur-2xl animate-pulse-slow"></div>

                <div className="relative z-10 text-center">
                    <div className="relative inline-block">
                        <h1 className="text-3xl font-black tracking-tighter transform group-hover:scale-105 transition-transform duration-500">
                            <span className="bg-gradient-to-r from-cyan-400 via-white to-purple-500 bg-clip-text text-transparent animate-gradient-x drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
                                LOMASH
                            </span>
                        </h1>
                        <motion.div
                            className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-cyan to-transparent"
                            layoutId="underline"
                        />
                    </div>

                    <motion.div
                        initial={{ opacity: 0.5, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ repeat: Infinity, repeatType: "reverse", duration: 2 }}
                        className="text-[10px] uppercase font-bold tracking-[0.4em] text-neon-magenta mt-1 drop-shadow-[0_0_5px_rgba(188,19,254,0.8)]"
                    >
                        HR Intelligence
                    </motion.div>
                </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            clsx(
                                'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group',
                                isActive
                                    ? 'bg-neon-cyan/10 text-neon-cyan shadow-[0_0_15px_rgba(6,182,212,0.2)] border border-neon-cyan/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                            )
                        }
                    >
                        <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                        <span className="font-medium">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-white/5 bg-black/20">
                <div className="flex items-center space-x-3 mb-4 px-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neon-cyan to-neon-magenta flex items-center justify-center text-black font-bold text-lg shadow-lg">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-400 capitalize truncate">{user?.role || 'Recruiter'}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center space-x-2 p-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition text-sm font-medium"
                >
                    <Cog6ToothIcon className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
