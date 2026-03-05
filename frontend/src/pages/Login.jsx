import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Fingerprint, Lock, Cpu, Scan } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? 'http://localhost:8080/login' : 'http://localhost:8080/register';
    
    try {
      const response = await axios.post(endpoint, { username, password }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      if (isLogin) {
        localStorage.setItem('user_role', response.data.role);
        localStorage.setItem('user_name', username);
        if (response.data.email) {
            localStorage.setItem('user_email', response.data.email);
        }
        if (response.data.palm_data) {
            localStorage.setItem('latestAnalysis', JSON.stringify(response.data.palm_data));
        }
        if (response.data.profile_photo) {
            localStorage.setItem('profilePhoto', response.data.profile_photo);
        }
        navigate('/dashboard');
      } else {
        alert('Account registered successfully! Please login to access the system.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication Failed');
    }
  };

  return (
    <div className="relative flex items-center justify-center h-screen bg-cyber-black overflow-hidden font-tech">
      {/* Background Animations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-cyber-black to-cyber-black"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] animate-pulse delay-700"></div>

      {/* Floating Instructions for User */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-10 right-10 z-20 max-w-xs p-4 glass-panel border-blue-500/20 hidden lg:block"
      >
        <h4 className="text-blue-400 text-xs font-sci mb-2 tracking-widest">SYSTEM MANUAL</h4>
        <p className="text-cyber-dim text-[10px] leading-relaxed uppercase">
          1. ENTER ANY USERNAME & ACCESS KEY<br/>
          2. CLICK "CREATE ACCOUNT" TO REGISTER<br/>
          3. LOGIN TO ACCESS BIOMETRIC DATA<br/>
          4. MULTIPLE USERS SUPPORTED
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-8 glass-panel rounded-2xl border border-blue-500/30 shadow-[0_0_50px_rgba(0,100,255,0.2)] backdrop-blur-xl"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-cyber-dark/80 border-2 border-blue-500 shadow-[0_0_20px_rgba(0,123,255,0.3)] relative">
            <div className="absolute inset-0 rounded-full border border-blue-500 animate-[spin_10s_linear_infinite] opacity-50"></div>
            <Scan className="w-12 h-12 text-blue-400 animate-pulse" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-blue-400 font-sci mb-2 drop-shadow-sm">
          {isLogin ? 'PALM READER AI' : 'USER REGISTRATION'}
        </h2>
        <p className="text-center text-cyber-dim mb-8 text-sm tracking-[0.2em] uppercase font-mono">
          {isLogin ? 'Intelligent Biometric Analysis' : 'Initialize System Access'}
        </p>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-4 p-3 bg-red-900/30 border border-red-500/50 text-red-200 text-sm text-center tracking-wide rounded"
          >
            ⚠️ {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <Fingerprint className="absolute left-3 top-3.5 w-5 h-5 text-blue-500/50 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text" 
              placeholder="USERNAME"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-cyber-black/50 border border-cyber-dim/30 text-cyber-text pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 focus:shadow-[0_0_15px_rgba(0,123,255,0.15)] transition-all placeholder-cyber-dim/50 tracking-wider font-tech"
              required
            />
          </div>
          
          <div className="relative group">
            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-blue-500/50 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="password" 
              placeholder="ACCESS KEY"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-cyber-black/50 border border-cyber-dim/30 text-cyber-text pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 focus:shadow-[0_0_15px_rgba(0,123,255,0.15)] transition-all placeholder-cyber-dim/50 tracking-wider font-tech"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3 bg-gradient-to-r from-blue-900/20 to-blue-800/20 border border-blue-500 text-blue-400 font-bold uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all duration-500 shadow-[0_0_15px_rgba(0,123,255,0.1)] hover:shadow-neon-blue rounded-lg relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLogin ? 'Access System' : 'Create Account'} 
              <Cpu className="w-4 h-4" />
            </span>
            <div className="absolute inset-0 bg-blue-500/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-cyber-dim hover:text-blue-400 tracking-widest uppercase transition-colors relative group"
          >
            <span className="relative z-10">{isLogin ? "[ Create New Account ]" : "[ Existing User Login ]"}</span>
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
