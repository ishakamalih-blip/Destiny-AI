import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Calendar, Activity, Brain, Heart, Clock, Search, ChevronRight, RotateCcw } from 'lucide-react';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('user_name');
    setUsername(user);
    
    if (user) {
      fetchHistory(user);
    } else {
      setLoading(false);
      setError('No user logged in');
    }
  }, []);

  const fetchHistory = async (user) => {
    try {
      console.log('Fetching history for user:', user);
      const response = await axios.get(`/users/${user}/history`);
      console.log('History response:', response.data);
      setHistory(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch history", err);
      setError(err.response?.data?.detail || err.message || 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown Date';
    // If timestamp is just a date string like "2026-01-29", return it
    if (timestamp.length <= 10) return timestamp;
    return new Date(timestamp).toLocaleDateString() + ' ' + new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="space-y-8 relative z-10">
      <header className="flex items-center justify-between border-b border-blue-500/20 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white font-sci">
            MY ANALYSIS HISTORY
          </h1>
          <p className="text-cyber-dim mt-2 font-mono text-sm tracking-wider">
            Archive of your biometric scans and reports
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setLoading(true); setError(null); if (username) fetchHistory(username); }}
            className="p-3 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/30 rounded-full transition-all duration-300"
            title="Refresh history"
          >
            <RotateCcw className="w-5 h-5 text-blue-400 hover:rotate-180 transition-transform duration-500" />
          </button>
          <div className="p-3 bg-blue-500/10 rounded-full border border-blue-500/30">
            <Clock className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-12">
           <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
           <p className="text-cyber-dim font-mono animate-pulse">Retrieving encrypted archives...</p>
        </div>
      ) : error ? (
        <div className="glass-panel p-12 rounded-xl border border-red-500/30 bg-red-500/5">
           <div className="w-20 h-20 bg-cyber-dark/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
             <span className="text-red-400 text-3xl">!</span>
           </div>
           <h3 className="text-xl text-red-400 font-sci mb-2">Error Loading History</h3>
           <p className="text-red-300 max-w-md mx-auto mb-4">
             {error}
           </p>
           <button onClick={() => { setLoading(true); setError(null); if (username) fetchHistory(username); }} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded uppercase tracking-widest transition-colors text-sm">
             Retry
           </button>
        </div>
      ) : history.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-xl border border-blue-500/20">
           <div className="w-20 h-20 bg-cyber-dark/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyber-dim/20">
             <Search className="w-10 h-10 text-cyber-dim" />
           </div>
           <h3 className="text-xl text-white font-sci mb-2">No History Found</h3>
           <p className="text-cyber-dim max-w-md mx-auto mb-8">
             You haven't performed any palm analyses yet. Start your first scan to build your biometric profile.
           </p>
           <a href="/analysis" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded uppercase tracking-widest transition-colors text-sm">
             Start Analysis
           </a>
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-panel p-6 rounded-lg border border-blue-500/10 hover:border-blue-500/40 transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-cyber-dark rounded border border-blue-500/20 group-hover:border-blue-500/50 transition-colors">
                    <Calendar className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xs text-cyber-dim font-mono mb-1 uppercase flex items-center gap-2">
                      <span>👤 {item.username}</span>
                      <span className="text-blue-400">•</span>
                      <span>Scan ID: #{item._id.slice(-6)}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white font-tech">
                      {formatDate(item.timestamp)}
                    </h3>
                    <p className="text-sm text-cyber-dim mt-1">
                      File: {item.filename || 'Unknown Image'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 flex-1 max-w-lg">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-blue-400 mb-1">
                      <Activity className="w-3 h-3" />
                      <span className="text-[10px] font-mono uppercase">Energy</span>
                    </div>
                    <div className="text-xl font-bold text-white">
                      {item.features?.vitality_index || item.predictions?.vitality_score || 0}/10
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-cyan-400 mb-1">
                      <Brain className="w-3 h-3" />
                      <span className="text-[10px] font-mono uppercase">Mind</span>
                    </div>
                    <div className="text-xl font-bold text-white">
                      {item.features?.cognitive_index || item.predictions?.cognitive_score || 0}/10
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-purple-400 mb-1">
                      <Heart className="w-3 h-3" />
                      <span className="text-[10px] font-mono uppercase">Heart</span>
                    </div>
                    <div className="text-xl font-bold text-white">
                      {item.features?.emotional_index || item.predictions?.emotional_score || 0}/10
                    </div>
                  </div>
                </div>

                <div className="hidden md:block">
                  <div className="p-2 rounded-full bg-cyber-dim/10 group-hover:bg-blue-500/20 transition-colors">
                    <ChevronRight className="w-5 h-5 text-cyber-dim group-hover:text-blue-400" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
