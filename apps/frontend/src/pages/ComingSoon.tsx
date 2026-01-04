const ComingSoon = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <h1 className="text-4xl font-bold text-white neon-text-gradient">Coming Soon</h1>
            <p className="text-gray-400 max-w-md">
                This feature is part of the advanced suite and is currently under development.
                Stay tuned for updates!
            </p>
            <div className="animate-pulse flex space-x-2">
                <div className="w-3 h-3 bg-neon-cyan rounded-full"></div>
                <div className="w-3 h-3 bg-neon-magenta rounded-full"></div>
                <div className="w-3 h-3 bg-neon-purple rounded-full"></div>
            </div>
        </div>
    );
};

export default ComingSoon;
