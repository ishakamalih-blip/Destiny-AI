import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, MessageSquare, User, Activity, Cpu, Shield, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Chat() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'SYSTEM INITIALIZED.\n> BIOMETRIC ANALYSIS MODULE ACTIVE.\n> How can I assist with your behavioral profile today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Simulate system processing delay
      await new Promise(r => setTimeout(r, 800));

      const savedAnalysis = localStorage.getItem('latestAnalysis');
      const analysisContext = savedAnalysis ? JSON.parse(savedAnalysis) : null;

      const response = await axios.post('/chat', { 
        message: userMsg.text,
        context: analysisContext
      });
      
      setMessages(prev => [...prev, { sender: 'ai', text: response.data.response }]);
    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, { sender: 'ai', text: 'SYSTEM ERROR: CONNECTION INTERRUPTED. PLEASE RE-INITIALIZE.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-4 relative z-10">
      {/* Header Status Bar */}
      <div className="glass-panel p-4 flex justify-between items-center border-b border-blue-500/30 bg-cyber-dark/50">
        <div className="flex items-center space-x-3">
          <Activity className="w-6 h-6 text-blue-400 animate-pulse" />
          <h2 className="text-xl font-sci tracking-wider text-blue-400 drop-shadow-sm">AI ANALYSIS CHAT</h2>
        </div>
        <div className="flex space-x-4 text-xs font-mono text-cyber-dim">
          <div className="flex items-center space-x-1">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span>CPU: OPTIMAL</span>
          </div>
          <div className="flex items-center space-x-1">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>MEMORY: STABLE</span>
          </div>
          <div className="flex items-center space-x-1">
            <Zap className="w-4 h-4 text-blue-500" />
            <span>UPLINK: SECURE</span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 glass-panel relative overflow-hidden flex flex-col border border-blue-500/20 shadow-neon-blue/20 rounded-xl">
        {/* Background Grid Animation */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,150,255,0.05)_0%,transparent_70%)]"></div>
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]"></div>
        
        <div 
          ref={scrollRef}
          className="flex-1 p-6 overflow-y-auto space-y-6 relative z-10 scrollbar-thin scrollbar-thumb-blue-500/50 scrollbar-track-transparent"
        >
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-4 rounded-xl border ${
                  msg.sender === 'user' 
                    ? 'bg-cyber-dark/60 border-blue-500/30 text-cyber-text rounded-tr-none shadow-[0_0_10px_rgba(0,150,255,0.05)]' 
                    : 'bg-blue-900/20 border-blue-500/50 text-cyber-text rounded-tl-none shadow-[0_0_10px_rgba(0,150,255,0.1)]'
                }`}>
                  <div className="flex items-center space-x-2 mb-2 opacity-80 text-xs font-mono uppercase tracking-widest">
                    {msg.sender === 'user' ? (
                      <>
                        <span className="text-blue-400">USER</span>
                        <User className="w-3 h-3 text-blue-400" />
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-3 h-3 text-cyan-400 animate-pulse" />
                        <span className="text-cyan-400">AI SYSTEM</span>
                      </>
                    )}
                  </div>
                  <p className="font-tech text-sm leading-relaxed whitespace-pre-wrap tracking-wide">
                    {msg.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-blue-900/10 border border-blue-500/50 p-4 rounded-xl rounded-tl-none flex items-center space-x-2">
                 <span className="text-blue-400 font-mono text-xs animate-pulse">PROCESSING...</span>
                 <div className="flex space-x-1">
                   <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 bg-blue-400 rounded-full shadow-neon-blue" />
                   <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }} className="w-1.5 h-1.5 bg-blue-400 rounded-full shadow-neon-blue" />
                   <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.6 }} className="w-1.5 h-1.5 bg-blue-400 rounded-full shadow-neon-blue" />
                 </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-blue-500/20 bg-cyber-black/80 backdrop-blur-md relative z-20">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg opacity-30 group-hover:opacity-70 transition duration-500 blur-sm"></div>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about your profile..."
                className="relative w-full bg-cyber-black border border-blue-500/30 text-blue-400 placeholder-cyber-dim/50 px-6 py-4 rounded-lg focus:outline-none focus:border-blue-500 font-tech tracking-wider shadow-inner"
              />
            </div>
            <button 
              onClick={handleSend}
              className="relative group p-4 bg-cyber-dark border border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white transition-all duration-300 rounded-lg overflow-hidden shadow-[0_0_10px_rgba(0,150,255,0.1)] flex items-center space-x-2"
            >
              <div className="absolute inset-0 bg-blue-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="hidden md:inline font-bold font-sci relative z-10">SEND</span>
              <Send className="w-5 h-5 relative z-10" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const Database = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
);
