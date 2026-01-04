import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, CheckCircleIcon, ExclamationTriangleIcon, CubeTransparentIcon, CpuChipIcon, BuildingOffice2Icon, UsersIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import SplashCursor from '../components/SplashCursor';
import { getApiUrl } from '../config';

// === NEW: Laser Beams Component (Pure CSS, Low Cost) ===
const LaserBeams = () => (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden mix-blend-screen">
        <div className="absolute top-1/2 left-1/2 w-[200vw] h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent -translate-x-1/2 -translate-y-1/2 animate-[spin_12s_linear_infinite] opacity-40 shadow-[0_0_20px_#ef4444]"></div>
        <div className="absolute top-1/2 left-1/2 w-[200vw] h-[2px] bg-gradient-to-r from-transparent via-neon-cyan to-transparent -translate-x-1/2 -translate-y-1/2 animate-[spin_18s_linear_infinite_reverse] opacity-40 shadow-[0_0_20px_#22d3ee]"></div>
        <div className="absolute top-1/2 left-1/2 w-[200vw] h-[2px] bg-gradient-to-r from-transparent via-neon-magenta to-transparent -translate-x-1/2 -translate-y-1/2 animate-[spin_25s_linear_infinite] opacity-30 shadow-[0_0_20px_#d946ef]"></div>
    </div>
);




const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [orgName, setOrgName] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [generatedId, setGeneratedId] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    // Mouse trail logic moved to <MouseTrail /> component to fix freezing/re-renders

    useEffect(() => {
        // Cleanup title effect on unmount if needed
    }, []);
    const [loading, setLoading] = useState(false);

    // Typing effect for Title
    const [titleText, setTitleText] = useState('');
    const fullText = isLogin ? 'Organization Portal' : 'Register New Organization';

    useEffect(() => {
        setTitleText('');
        let i = 0;
        const interval = setInterval(() => {
            setTitleText(fullText.slice(0, i + 1));
            i++;
            if (i > fullText.length) clearInterval(interval);
        }, 50);
        return () => clearInterval(interval);
    }, [isLogin, fullText]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const endpoint = isLogin ? '/api/v1/auth/login' : '/api/v1/auth/register';
            const payload = isLogin
                ? { email: email.toLowerCase(), password, employeeId: employeeId.trim() }
                : { name, email: email.toLowerCase(), password, orgName };

            // Explicitly logging URL for debugging
            // Use the robust URL helper
            const fullUrl = getApiUrl(endpoint);

            console.log(`Attempting connection to: ${fullUrl}`);

            const { data } = await axios.post(fullUrl, payload);

            if (isLogin) {
                login(data.token, data);
                navigate('/');
            } else {
                // Registration Success - Show ID
                setGeneratedId(data.employeeId);
                setShowSuccessModal(true);
                // Don't auto-login yet, let them see the ID
            }
        } catch (err: any) {
            console.error('Login error:', err);
            const msg = err.response?.data?.message
                || err.message
                || 'Server unreachable. Please ensure the backend is active at port 4000.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = () => {
        setShowSuccessModal(false);
        setIsLogin(true); // Switch to login view
        setEmployeeId(generatedId); // Pre-fill the ID helper
    };

    // Reusable tiny radar component
    const RadarSpinner = ({ className = "w-6 h-6", color = "border-neon-cyan" }) => (
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className={`${className} rounded-full border border-dashed ${color} flex items-center justify-center`}
        >
            <div className={`w-1.5 h-1.5 ${color.replace('border-', 'bg-')} rounded-full animate-ping`}></div>
        </motion.div>
    );

    const TechChip = ({ text, colorClass = "text-neon-cyan", borderClass = "border-neon-cyan", delay = 0 }: any) => (
        <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay, type: "spring", stiffness: 120 }}
            className={`relative px-4 py-2 bg-black/40 backdrop-blur-md border ${borderClass} rounded-full flex items-center gap-3 shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform`}
        >
            <div className="absolute inset-0 rounded-full border border-white/5"></div>
            <RadarSpinner className="w-4 h-4" color={borderClass} />
            <span className={`text-xs lg:text-sm font-bold tracking-widest ${colorClass} uppercase`}>{text}</span>
        </motion.div>
    );

    const PowerLine = ({ vertical = false, className, colors = ["bg-red-500", "bg-yellow-400", "bg-neon-cyan"] }: any) => (
        <div className={`absolute ${className} overflow-hidden pointer-events-none z-10`}>
            <div className="absolute inset-0 bg-white/5 opacity-10"></div>
            {colors.map((color: string, i: number) => (
                <motion.div
                    key={i}
                    className={`absolute ${vertical ? 'w-full h-32' : 'h-full w-32'} ${color} blur-[3px] shadow-[0_0_15px_currentColor] opacity-80`}
                    initial={{ [vertical ? 'y' : 'x']: '-100%' }}
                    animate={{ [vertical ? 'y' : 'x']: '400%' }}
                    transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "linear",
                        delay: i * 0.4
                    }}
                />
            ))}
        </div>
    );

    const NanoParticles = ({ color = "bg-neon-cyan" }: any) => (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className={`absolute w-0.5 h-0.5 ${color} rounded-full shadow-[0_0_5px_currentColor]`}
                    initial={{ x: `${Math.random() * 100}%`, y: `${Math.random() * 100}%`, opacity: 0 }}
                    animate={{
                        y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                        x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                        opacity: [0, 1, 0],
                        scale: [0, 2, 0]
                    }}
                    transition={{
                        duration: Math.random() * 15 + 10,
                        repeat: Infinity,
                        ease: "linear",
                        delay: Math.random() * 5
                    }}
                />
            ))}
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050511] relative overflow-hidden font-mono bg-grid">

            <AnimatePresence>
                {showSuccessModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-[#0f111a] border border-neon-cyan p-8 rounded-2xl max-w-md w-full text-center shadow-[0_0_50px_rgba(6,182,212,0.3)] relative overflow-hidden"
                        >
                            <div className="absolute top-4 right-4"><RadarSpinner /></div>
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan via-white to-neon-magenta"></div>
                            <CheckCircleIcon className="w-20 h-20 text-green-400 mx-auto mb-6 animate-bounce" />
                            <h2 className="text-3xl font-black text-white mb-2">Registration Complete</h2>
                            <p className="text-gray-400 mb-6">Your Administrator Account has been created.</p>

                            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 relative group">
                                <div className="text-sm text-neon-cyan uppercase tracking-widest mb-2">Your Employee ID</div>
                                <div className="text-5xl font-black text-white tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                                    {generatedId}
                                </div>
                                <div className="absolute inset-0 border border-neon-cyan/30 rounded-xl animate-pulse"></div>
                            </div>

                            <p className="text-xs text-gray-500 mb-6 max-w-xs mx-auto">
                                *IMPORTANT: You must use this 4-character ID along with your email and password to log in.
                            </p>

                            <button
                                onClick={handleModalClose}
                                className="w-full bg-neon-cyan text-black font-bold py-3 rounded-lg hover:bg-white transition-colors uppercase tracking-widest"
                            >
                                Proceed to Login
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* === NEW: TOP CENTER LHCS BADGE (Unified Single Line with Moving Effect) === */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full flex justify-center px-4">
                {/* Connecting Line */}
                <div className="absolute -top-6 w-px h-6 bg-gradient-to-b from-transparent to-neon-cyan/50"></div>

                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 120 }}
                    className="relative bg-black/90 backdrop-blur-2xl border border-neon-cyan/40 rounded-full py-3 px-6 flex items-center justify-center shadow-[0_0_60px_rgba(6,182,212,0.5)] overflow-hidden group"
                >
                    {/* Magical Effects Layer */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent skew-x-12"
                        animate={{ x: ['-200%', '200%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                        className="absolute -inset-1 bg-gradient-to-r from-neon-cyan via-purple-500 to-neon-cyan opacity-20 blur-xl"
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Content Row */}
                    <div className="relative flex items-center gap-4 whitespace-nowrap z-10">
                        {/* START SPINNER */}
                        <div className="p-1 bg-white/5 rounded-full border border-white/10"><RadarSpinner className="w-5 h-5" color="border-neon-cyan" /></div>

                        <span className="text-white font-bold text-xs lg:text-sm tracking-wider">LOMASH HUMAN RESOURCES</span>

                        {/* CENTER BIG CHIP */}
                        <div className="relative px-5 py-1.5 bg-black/60 border border-neon-cyan/60 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.4)] flex items-center gap-3 group-hover:scale-105 transition-transform">
                            <RadarSpinner className="w-4 h-4" color="border-white" />
                            <span className="text-neon-cyan font-black tracking-widest text-xs lg:text-sm drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">CUSTOMER RELATIONSHIP</span>
                            <div className="absolute inset-0 border border-white/10 rounded-lg animate-pulse"></div>
                        </div>

                        <span className="text-white font-bold text-xs lg:text-sm tracking-wider">MANAGEMENT SYSTEM</span>

                        {/* END SPINNER */}
                        <div className="p-1 bg-white/5 rounded-full border border-white/10"><RadarSpinner className="w-5 h-5" color="border-neon-magenta" /></div>
                    </div>
                </motion.div>
            </div>

            {/* === NEW: BACKGROUND SIMULATION LINES & EFFECTS === */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                {/* 1. Horizontal High-Speed Data Packets */}
                {[10, 25, 45, 65, 85, 95].map((top, i) => (
                    <motion.div
                        key={`line-${i}`}
                        className="absolute h-[1px] w-full bg-white/5"
                        style={{ top: `${top}%` }}
                    >
                        <motion.div
                            className="h-[2px] w-[150px] bg-gradient-to-r from-transparent via-neon-cyan to-transparent shadow-[0_0_15px_rgba(34,211,238,1)]"
                            animate={{ x: [-200, window.innerWidth + 200] }}
                            transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, ease: "linear", delay: i * 0.3 }}
                        />
                    </motion.div>
                ))}

                {/* 2. Vertical Binary Rain Drops */}
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={`binary-${i}`}
                        className="absolute top-0 text-[10px] font-mono font-bold text-neon-cyan/20 writing-vertical-rl select-none"
                        style={{ left: `${i * 8 + 5}%` }}
                        initial={{ y: -200 }}
                        animate={{ y: '120vh' }}
                        transition={{
                            duration: Math.random() * 10 + 5,
                            repeat: Infinity,
                            ease: "linear",
                            delay: Math.random() * 5
                        }}
                    >
                        {Array.from({ length: 20 }).map(() => Math.random() > 0.5 ? '1' : '0').join(' ')}
                    </motion.div>
                ))}

                {/* 3. Expanding Sonar Rings (Radar Effect) */}
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neon-cyan/20"
                    initial={{ width: 0, height: 0, opacity: 1 }}
                    animate={{ width: '150vw', height: '150vw', opacity: 0 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neon-magenta/20"
                    initial={{ width: 0, height: 0, opacity: 1 }}
                    animate={{ width: '120vw', height: '120vw', opacity: 0 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 4 }}
                />

                {/* 4. Floating 'Debug' Data Blocks */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={`debug-${i}`}
                        className="absolute bg-black/40 border border-white/5 p-2 rounded text-[9px] text-green-400/60 font-mono shadow-lg backdrop-blur-sm"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: [0, 1, 1, 0],
                            y: [0, -50],
                        }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            delay: i * 2,
                            times: [0, 0.1, 0.9, 1]
                        }}
                        style={{
                            left: `${Math.random() * 80 + 10}%`,
                            top: `${Math.random() * 80 + 10}%`
                        }}
                    >
                        <div>&gt; PROCESS_ID: {4000 + i * 23}</div>
                        <div>&gt; MEM_ALLOC: 0x{Math.floor(Math.random() * 10000).toString(16).toUpperCase()}</div>
                    </motion.div>
                ))}

                {/* 5. Rotating Hexagon Mesh (Wireframe effect) */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200vw] opacity-[0.05] border-2 border-dashed border-white rounded-full pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }}
                />
            </div>

            {/* Tech Overlay Lines (Existing) */}
            <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
                <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-500 to-transparent"></div>
                <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-purple-500 to-transparent"></div>
                <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
            </div>

            {/* Moving Background Orbs (Existing) */}
            <div className="absolute inset-0 z-0">
                <motion.div
                    animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-neon-cyan/20 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{ x: [0, -50, 0], y: [0, -40, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-[20%] right-[20%] w-[600px] h-[600px] bg-neon-magenta/15 rounded-full blur-[120px]"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-7xl min-h-[85vh] grid grid-cols-1 lg:grid-cols-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden border border-white/10 bg-[#0f111a]/90 backdrop-blur-2xl relative z-10 mx-6 mt-16"
            >
                {/* Left Side - Visuals (7 Cols) */}
                <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-black/50 via-[#050511] to-[#0a0a1a]">
                    {/* Background Grid & Elements */}
                    <div className="absolute inset-0 z-0 opacity-30">
                        <div className="absolute inset-0 bg-grid"></div>
                    </div>

                    {/* TOP: Brand */}
                    <div className="relative z-10 space-y-4 w-full">
                        <motion.div
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            className="flex flex-wrap items-baseline gap-4"
                        >
                            <h1 className="text-6xl lg:text-7xl font-black tracking-tighter leading-none relative group">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-blue-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] animate-pulse">
                                    LOMASH
                                </span>
                                {/* Tech overlay for LOMASH */}
                                <span className="absolute inset-0 bg-white/20 blur-lg mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                            </h1>

                            <motion.h2
                                className="text-3xl lg:text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-neon-magenta via-purple-400 to-white"
                                animate={{
                                    opacity: [0.8, 1, 0.8],
                                    textShadow: ["0 0 0px #d946ef", "0 0 10px #d946ef", "0 0 0px #d946ef"]
                                }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                HR CRM SYSTEM
                            </motion.h2>
                        </motion.div>

                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                            className="h-1 bg-gradient-to-r from-neon-cyan via-white to-neon-magenta mt-2 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)]"
                        />
                        <p className="text-sm font-bold tracking-[0.4em] text-gray-400 uppercase pl-1">
                            Next Gen Intelligence
                        </p>
                    </div>

                    {/* MIDDLE: Stats Grid & Graph */}
                    <div className="relative z-10 grid grid-cols-2 gap-4 mt-8">
                        {/* Stat Cards */}
                        {[
                            { label: 'Candidates Parsed', value: '2.5M+', icon: <UsersIcon className="w-5 h-5 text-neon-cyan" />, delay: 0 },
                            { label: 'Organizations', value: '500+', icon: <BuildingOffice2Icon className="w-5 h-5 text-neon-magenta" />, delay: 0.1 },
                            { label: 'System Uptime', value: '99.9%', icon: <ChartBarIcon className="w-5 h-5 text-green-400" />, delay: 0.2 },
                            { label: 'AI Models Active', value: '12/12', icon: <CpuChipIcon className="w-5 h-5 text-neon-purple" />, delay: 0.3 }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1 + stat.delay }}
                                whileHover={{ scale: 1.05, borderColor: "rgba(255,255,255,0.4)" }}
                                className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md group cursor-default shadow-lg"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-2xl font-black text-white group-hover:text-neon-cyan transition-colors">{stat.value}</div>
                                    <div className="p-2 bg-white/5 rounded-lg text-white group-hover:animate-spin-slow-reverse">{stat.icon}</div>
                                </div>
                                <div className="text-xs font-mono text-gray-400 uppercase tracking-wider">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* BOTTOM: Live Terminal & Visuals */}
                    <div className="relative z-10 space-y-4">
                        {/* Fake Visualization Bar */}
                        <div className="bg-black/40 border border-white/10 rounded-lg p-4 flex items-end justify-between h-24 gap-1">
                            {[40, 70, 30, 85, 50, 65, 90, 45, 60, 80, 55, 75, 40, 95, 60].map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: '10%' }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ duration: 0.5, delay: i * 0.05, repeat: Infinity, repeatType: "reverse", repeatDelay: Math.random() }}
                                    className="w-full bg-gradient-to-t from-neon-cyan/20 to-neon-cyan rounded-t-sm"
                                />
                            ))}
                        </div>

                        {/* Terminal Log */}
                        <div className="bg-black/60 border border-white/10 rounded-lg p-3 font-mono text-xs h-24 overflow-hidden relative">
                            <div className="absolute top-0 right-0 px-2 py-1 bg-neon-cyan text-black font-bold text-[10px] uppercase flex items-center gap-2">
                                <RadarSpinner className="w-3 h-3" color="border-black" />
                                Live Stream
                            </div>
                            <div className="space-y-1 text-green-400/80">
                                <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
                                    &gt; SYSTEM_INIT... OK
                                </motion.div>
                                <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}>
                                    &gt; CONNECTING_TO_GLOBAL_NODE... 12ms
                                </motion.div>
                                <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}>
                                    &gt; ENCRYPTED_TUNNEL_ESTABLISHED
                                </motion.div>
                                <div className="text-neon-magenta">&gt; AI_ENGINE_READY // WAITING_FOR_INPUT_</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form (5 Cols) */}
                <div className="lg:col-span-5 bg-[#050511] flex flex-col justify-center relative border-l border-white/5 shadow-2xl">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

                    {/* === SCANNER BAR & PARTICLES === */}
                    <NanoParticles color="bg-neon-cyan" />
                    <NanoParticles color="bg-neon-magenta" />
                    <motion.div
                        className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/80 to-transparent z-20 pointer-events-none shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                        animate={{ top: ['0%', '100%'], opacity: [0, 1, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Corner Borders for Tech Look */}
                    {/* Connecting Power Lines (Form) */}
                    <PowerLine className="top-8 left-8 right-8 h-[2px]" />
                    <PowerLine className="bottom-8 left-8 right-8 h-[2px]" />
                    <PowerLine vertical className="top-8 bottom-8 left-8 w-[2px]" />
                    <PowerLine vertical className="top-8 bottom-8 right-8 w-[2px]" />

                    {/* Corner Rotating Chips (Second Window) */}
                    <div className="absolute top-4 left-4 z-20 pointer-events-none">
                        <div className="relative">
                            <RadarSpinner className="w-8 h-8" color="border-neon-cyan" />
                            <div className="absolute inset-0 bg-neon-cyan/30 blur-md rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <div className="absolute top-4 right-4 z-20 pointer-events-none">
                        <div className="relative">
                            <RadarSpinner className="w-8 h-8" color="border-neon-magenta" />
                            <div className="absolute inset-0 bg-neon-magenta/30 blur-md rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
                        <div className="relative">
                            <RadarSpinner className="w-8 h-8" color="border-neon-magenta" />
                            <div className="absolute inset-0 bg-neon-magenta/30 blur-md rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <div className="absolute bottom-4 right-4 z-20 pointer-events-none">
                        <div className="relative">
                            <RadarSpinner className="w-8 h-8" color="border-neon-cyan" />
                            <div className="absolute inset-0 bg-neon-cyan/30 blur-md rounded-full animate-pulse"></div>
                        </div>
                    </div>

                    <div className="p-10 lg:p-16 w-full relative z-10 flex flex-col h-full justify-center">
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="absolute top-6 w-full left-0 flex justify-center items-center pointer-events-none z-30"
                        >
                            <div className="bg-green-500/10 border border-green-500/30 px-6 py-2 rounded-full flex items-center gap-3 backdrop-blur-md shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                                <div className="relative">
                                    <RadarSpinner className="w-4 h-4" color="border-green-500" />
                                    <div className="absolute inset-0 bg-green-500/40 blur-sm rounded-full animate-pulse"></div>
                                </div>
                                <span className="text-xs font-mono text-green-500 uppercase tracking-[0.2em] font-bold">Secure Portal</span>
                            </div>
                        </motion.div>

                        <div className="space-y-2 mb-8">
                            <h2 className="text-4xl font-black text-white min-h-[40px] tracking-tight">
                                {titleText}<span className="animate-pulse text-neon-cyan">_</span>
                            </h2>
                            <p className="text-gray-400 text-sm font-light tracking-wide">
                                {isLogin ? 'Access your organization dashboard.' : 'Setup a new workspace for your team.'}
                            </p>
                        </div>

                        {/* Error Message */}
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-6 bg-red-500/10 border-l-4 border-red-500 p-4 rounded-lg flex items-center gap-3"
                                >
                                    <ExclamationTriangleIcon className="w-5 h-5 text-red-400 shrink-0" />
                                    <p className="text-sm text-red-200">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <AnimatePresence>
                                {!isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-4 overflow-hidden"
                                    >
                                        <div className="group">
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full bg-[#0a0a14] border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 focus:outline-none transition-all group-hover:border-white/20"
                                                placeholder="Administrator Name"
                                                required={!isLogin}
                                            />
                                        </div>
                                        <div className="group">
                                            <input
                                                type="text"
                                                value={orgName}
                                                onChange={(e) => setOrgName(e.target.value)}
                                                className="w-full bg-[#0a0a14] border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:border-neon-magenta focus:ring-1 focus:ring-neon-magenta/50 focus:outline-none transition-all group-hover:border-white/20"
                                                placeholder="Organization / Company Name"
                                                required={!isLogin}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Employee ID - Only for Login */}
                            <AnimatePresence>
                                {isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="group"
                                    >
                                        <input
                                            type="text"
                                            value={employeeId}
                                            onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                                            className="w-full bg-[#0a0a14] border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 focus:outline-none transition-all group-hover:border-white/20 font-mono tracking-widest uppercase"
                                            placeholder="EMPLOYEE ID (e.g. JDNE)"
                                            maxLength={4}
                                            required={isLogin}
                                            autoComplete="off"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="group">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#0a0a14] border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 focus:outline-none transition-all group-hover:border-white/20"
                                    placeholder="Work Email Address"
                                    required
                                />
                            </div>

                            <div className="group">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#0a0a14] border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:border-neon-purple focus:ring-1 focus:ring-neon-purple/50 focus:outline-none transition-all group-hover:border-white/20"
                                    placeholder="Access Key / Password"
                                    required
                                />
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-neon-cyan via-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2 relative z-10">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Connecting...
                                    </span>
                                ) : (
                                    <span className="relative z-10 uppercase tracking-widest text-sm">
                                        {isLogin ? 'Login to Workspace' : 'Create Organization Account'}
                                    </span>
                                )}
                            </motion.button>
                        </form>

                        <div className="text-center pt-6">
                            <button
                                type="button"
                                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                className="text-gray-400 hover:text-white text-sm transition-colors flex flex-col items-center justify-center gap-1 mx-auto hover:scale-105 duration-300"
                            >
                                <span className="text-xs uppercase tracking-wider">{isLogin ? 'Register your company' : 'Already have an account?'}</span>
                                <span className={`font-bold ${isLogin ? 'text-neon-cyan drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]' : 'text-neon-magenta drop-shadow-[0_0_5px_rgba(188,19,254,0.5)]'}`}>
                                    {isLogin ? 'Deploy New Environment' : 'Access Workspace'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
            {/* === MOUSE TRAIL (Optimized) === */}
            <SplashCursor />
            {/* === LASER BEAMS === */}
            <LaserBeams />


            {/* === CONNECTING POWER LINES (MAIN WINDOW) === */}
            <PowerLine className="fixed top-11 left-11 right-11 h-[3px] z-[55]" colors={["bg-red-600", "bg-neon-magenta", "bg-orange-500"]} />
            <PowerLine className="fixed bottom-11 left-11 right-11 h-[3px] z-[55]" colors={["bg-red-600", "bg-neon-magenta", "bg-orange-500"]} />
            <PowerLine vertical className="fixed top-11 bottom-11 left-11 w-[3px] z-[55]" colors={["bg-red-600", "bg-neon-magenta", "bg-orange-500"]} />
            <PowerLine vertical className="fixed top-11 bottom-11 right-11 w-[3px] z-[55]" colors={["bg-red-600", "bg-neon-magenta", "bg-orange-500"]} />

            {/* === CORNER DECORATIONS (BACK WINDOW - MAIN SCREEN) === */}
            <div className="fixed top-6 left-6 z-[60] pointer-events-none">
                <div className="relative">
                    <RadarSpinner className="w-10 h-10" color="border-neon-cyan" />
                    <div className="absolute inset-0 bg-neon-cyan/40 blur-lg rounded-full animate-pulse"></div>
                </div>
            </div>
            <div className="fixed top-6 right-6 z-[60] pointer-events-none">
                <div className="relative">
                    <RadarSpinner className="w-10 h-10" color="border-neon-magenta" />
                    <div className="absolute inset-0 bg-neon-magenta/40 blur-lg rounded-full animate-pulse"></div>
                </div>
            </div>
            <div className="fixed bottom-6 left-6 z-[60] pointer-events-none">
                <div className="relative">
                    <RadarSpinner className="w-10 h-10" color="border-neon-magenta" />
                    <div className="absolute inset-0 bg-neon-magenta/40 blur-lg rounded-full animate-pulse"></div>
                </div>
            </div>
            <div className="fixed bottom-6 right-6 z-[60] pointer-events-none">
                <div className="relative">
                    <RadarSpinner className="w-10 h-10" color="border-neon-cyan" />
                    <div className="absolute inset-0 bg-neon-cyan/40 blur-lg rounded-full animate-pulse"></div>
                </div>
            </div>
        </div>
    );
};

export default Login;
