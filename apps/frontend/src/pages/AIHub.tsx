import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, DocumentTextIcon, UserGroupIcon, BeakerIcon } from '@heroicons/react/24/outline';

const AIHub = () => {
    const [activeTab, setActiveTab] = useState<'jd' | 'match'>('jd');

    // JD Generator State
    const [jdForm, setJdForm] = useState({ title: '', skills: '' });
    const [generatedJd, setGeneratedJd] = useState<any>(null);
    const [loadingJd, setLoadingJd] = useState(false);

    // Matcher State
    const [matchForm, setMatchForm] = useState({ resume_text: '', job_description: '' });
    const [matchResult, setMatchResult] = useState<any>(null);
    const [loadingMatch, setLoadingMatch] = useState(false);

    const generateJD = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingJd(true);
        try {
            // Direct call to ML service for demo purposes
            const { data } = await axios.post('http://localhost:8000/generate-jd/', jdForm);
            setGeneratedJd(data);
        } catch (error) {
            console.error(error);
            alert('Failed to generate JD');
        } finally {
            setLoadingJd(false);
        }
    };

    const analyzeMatch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingMatch(true);
        try {
            const { data } = await axios.post('http://localhost:8000/analyze-match/', matchForm);
            setMatchResult(data);
        } catch (error) {
            console.error(error);
            alert('Failed to analyze match');
        } finally {
            setLoadingMatch(false);
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent flex items-center gap-3">
                        <SparklesIcon className="w-10 h-10 text-neon-purple" />
                        AI Recruitment Hub
                    </h1>
                    <p className="text-gray-400 mt-2">Leverage advanced AI agents to automate your hiring workflow.</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-4 border-b border-white/10 pb-1">
                <button
                    onClick={() => setActiveTab('jd')}
                    className={`pb-3 px-2 flex items-center gap-2 transition-all ${activeTab === 'jd'
                            ? 'border-b-2 border-neon-cyan text-neon-cyan font-bold'
                            : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <DocumentTextIcon className="w-5 h-5" />
                    JD Generator
                </button>
                <button
                    onClick={() => setActiveTab('match')}
                    className={`pb-3 px-2 flex items-center gap-2 transition-all ${activeTab === 'match'
                            ? 'border-b-2 border-neon-pink text-neon-pink font-bold'
                            : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <BeakerIcon className="w-5 h-5" />
                    Smart Resume Matcher
                </button>
            </div>

            <div className="min-h-[500px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'jd' ? (
                        <motion.div
                            key="jd"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                        >
                            {/* Input Panel */}
                            <div className="glass-panel p-6 space-y-6 h-fit">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-neon-cyan/20 flex items-center justify-center text-neon-cyan text-sm">1</span>
                                    Job Details
                                </h2>
                                <form onSubmit={generateJD} className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Job Title</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-neon-cyan focus:outline-none transition"
                                            placeholder="e.g. Senior React Developer"
                                            value={jdForm.title}
                                            onChange={e => setJdForm({ ...jdForm, title: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Required Skills (Comma separated)</label>
                                        <textarea
                                            required
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white h-32 focus:border-neon-cyan focus:outline-none transition"
                                            placeholder="e.g. React, Node.js, TypeScript, AWS, Docker"
                                            value={jdForm.skills}
                                            onChange={e => setJdForm({ ...jdForm, skills: e.target.value })}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loadingJd}
                                        className="w-full bg-gradient-to-r from-neon-cyan to-blue-600 text-black font-bold py-3 rounded-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition disabled:opacity-50"
                                    >
                                        {loadingJd ? 'Generating Magic...' : 'Generate Job Description'}
                                    </button>
                                </form>
                            </div>

                            {/* Output Panel */}
                            <div className="glass-panel p-6 min-h-[400px] border border-neon-cyan/20">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-neon-purple/20 flex items-center justify-center text-neon-purple text-sm">2</span>
                                    AI Output
                                </h2>
                                {generatedJd ? (
                                    <div className="space-y-6 animate-fade-in">
                                        <div>
                                            <h3 className="text-neon-cyan font-bold mb-2">Overview</h3>
                                            <p className="text-gray-300 leading-relaxed">{generatedJd.overview}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-neon-pink font-bold mb-2">Key Responsibilities</h3>
                                            <ul className="list-disc pl-5 text-gray-300 space-y-1">
                                                {generatedJd.responsibilities.map((res: string, i: number) => (
                                                    <li key={i}>{res}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="text-neon-purple font-bold mb-2">Requirements</h3>
                                            <ul className="list-disc pl-5 text-gray-300 space-y-1">
                                                {generatedJd.requirements.map((req: string, i: number) => (
                                                    <li key={i}>{req}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-lg flex items-center justify-between">
                                            <span className="text-gray-400">Estimated Salary Range</span>
                                            <span className="text-green-400 font-mono font-bold">{generatedJd.salary_range}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                        <DocumentTextIcon className="w-16 h-16 mb-4 opacity-20" />
                                        <p>Fill out the details to generate a professional JD.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="match"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                        >
                            {/* Input Panel */}
                            <div className="glass-panel p-6 space-y-6">
                                <h2 className="text-xl font-bold text-white">Analysis Inputs</h2>
                                <form onSubmit={analyzeMatch} className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Paste Resume Text</label>
                                        <textarea
                                            required
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white h-48 focus:border-neon-pink focus:outline-none transition custom-scrollbar"
                                            placeholder="Paste the candidate's full resume content here..."
                                            value={matchForm.resume_text}
                                            onChange={e => setMatchForm({ ...matchForm, resume_text: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Job Context / Requirements</label>
                                        <textarea
                                            required
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white h-32 focus:border-neon-pink focus:outline-none transition custom-scrollbar"
                                            placeholder="Briefly describe what you are looking for..."
                                            value={matchForm.job_description}
                                            onChange={e => setMatchForm({ ...matchForm, job_description: e.target.value })}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loadingMatch}
                                        className="w-full bg-gradient-to-r from-neon-pink to-purple-600 text-white font-bold py-3 rounded-lg hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition disabled:opacity-50"
                                    >
                                        {loadingMatch ? 'Analyzing Fit...' : 'Analyze Match Score'}
                                    </button>
                                </form>
                            </div>

                            {/* Result Panel */}
                            <div className="glass-panel p-6 border border-neon-pink/20">
                                <h2 className="text-xl font-bold text-white mb-6">Match Analysis</h2>
                                {matchResult ? (
                                    <div className="space-y-8 animate-fade-in">
                                        <div className="flex items-center justify-center py-6">
                                            <div className="relative w-40 h-40 flex items-center justify-center">
                                                <svg className="w-full h-full transform -rotate-90">
                                                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-800" />
                                                    <circle
                                                        cx="80" cy="80" r="70"
                                                        stroke="currentColor" strokeWidth="10"
                                                        fill="transparent"
                                                        className={`${matchResult.score > 80 ? 'text-green-500' : matchResult.score > 60 ? 'text-yellow-500' : 'text-red-500'}`}
                                                        strokeDasharray={440}
                                                        strokeDashoffset={440 - (440 * matchResult.score) / 100}
                                                    />
                                                </svg>
                                                <span className="absolute text-4xl font-bold text-white">{matchResult.score}%</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                                                <h4 className="text-green-400 font-bold mb-2">Keywords Found</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {matchResult.keywords_found?.map((k: string) => (
                                                        <span key={k} className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">{k}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                                                <h4 className="text-red-400 font-bold mb-2">Missing Skills</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {matchResult.missing_keywords?.map((k: string) => (
                                                        <span key={k} className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">{k}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="text-white font-bold">AI Feedback</h4>
                                            {matchResult.analysis?.map((line: string, i: number) => (
                                                <div key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-neon-purple flex-shrink-0"></span>
                                                    <p>{line}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                        <BeakerIcon className="w-16 h-16 mb-4 opacity-20" />
                                        <p>Run the analysis to see the match score.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AIHub;
