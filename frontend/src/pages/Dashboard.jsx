import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Activity, Cpu, MessageSquare, Database, Shield, Zap, FileText } from 'lucide-react';

const Card = ({ title, desc, icon: Icon, delay, onClick }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(0, 150, 255, 0.4)" }}
    onClick={onClick}
    className="relative p-6 glass-panel rounded-lg overflow-hidden group cursor-pointer border-t border-blue-500/20"
  >
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
      <Icon className="w-24 h-24 text-blue-500" />
    </div>
    
    <div className="relative z-10">
      <div className="p-3 w-fit rounded-full bg-cyber-dark/50 border border-blue-500/30 mb-4 group-hover:border-blue-500 group-hover:bg-blue-500/10 transition-colors shadow-[0_0_15px_rgba(0,150,255,0.1)]">
        <Icon className="w-8 h-8 text-blue-500" />
      </div>
      <h3 className="text-xl font-bold text-cyber-text font-sci tracking-wider mb-2 drop-shadow-md">{title}</h3>
      <p className="text-cyber-dim text-sm font-tech">{desc}</p>
    </div>

    {/* Decorative corners */}
    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-blue-500 opacity-50"></div>
    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-blue-500 opacity-50"></div>
    
    {/* Tech Glow */}
    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-xl"></div>
  </motion.div>
);

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 relative z-10">
      <header className="flex items-center justify-between border-b border-blue-500/20 pb-6 bg-gradient-to-r from-transparent via-cyber-dark/30 to-transparent">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white font-sci drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            MY DASHBOARD
          </h1>
          <p className="text-cyber-dim mt-2 tracking-widest uppercase text-sm font-mono">
            System Status: <span className="text-blue-400 animate-pulse">ONLINE</span> | Data: SECURE
          </p>
        </div>
        <div className="hidden md:block">
           <Zap className="w-16 h-16 text-blue-400 animate-pulse opacity-80 shadow-neon-blue rounded-full" />
        </div>
      </header>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card 
          title="Palm Analysis" 
          desc="Analyze your palm to discover your personality."
          icon={Activity}
          delay={0.1}
          onClick={() => navigate('/analysis')}
        />
        <Card 
          title="AI Assistant" 
          desc="Talk to AI for personal advice and insights."
          icon={MessageSquare}
          delay={0.2}
          onClick={() => navigate('/chat')}
        />
        <Card 
          title="My History" 
          desc="View and review your past palm reports."
          icon={Database}
          delay={0.3}
          onClick={() => navigate('/history')}
        />
      </div>

      <div className="mt-12 glass-panel p-6 rounded-lg border-blue-500/20 relative overflow-hidden">
        {/* Tech background for the list */}
        <div className="absolute inset-0 bg-blue-500/5 blur-3xl"></div>
        
        <h3 className="text-xl font-sci text-blue-400 mb-4 border-b border-blue-500/20 pb-2 flex items-center gap-2 relative z-10">
          <Activity className="w-5 h-5" /> Recent Activity
        </h3>
        <div className="space-y-4 relative z-10">
            {[1, 2, 3].map((i) => (
                <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (i * 0.1) }}
                    className="flex items-center justify-between p-3 bg-cyber-dark/40 rounded border border-blue-500/10 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all duration-300 group"
                >
                    <span className="text-cyber-dim font-mono text-xs group-hover:text-blue-400/80 transition-colors">2026-02-10 10:4{i}:00</span>
                    <span className="text-white font-tech tracking-wide">Palm analysis complete.</span>
                    <span className="text-white text-xs px-2 py-1 bg-blue-600 rounded font-bold shadow-[0_0_10px_rgba(0,150,255,0.3)]">REPORT</span>
                </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
}
