import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, AlertTriangle, Database, Activity, Cpu, Trash2, Lock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('user_role');
    if (role !== 'admin') {
      alert("SYSTEM ANOMALY DETECTED: ACCESS DENIED");
      navigate('/dashboard');
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await axios.get('/admin/users');
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users", error);
        // Fallback data for demonstration if backend is not reachable or empty
        setUsers(prev => prev.length === 0 ? [
            { username: 'admin', role: 'admin', email: 'admin@biometric-ai.io' },
            { username: 'user_001', role: 'user', email: 'user@example.com' },
            { username: 'alpha_tester', role: 'user', email: 'test@lab.io' }
        ] : prev);
      }
    };
    fetchUsers();
  }, [navigate]);

  const handleDeleteUser = async () => {
    if (!adminPassword) return;
    
    setDeleteLoading(true);
    try {
        const adminUsername = localStorage.getItem('user_name');
        
        await axios.delete('/admin/users/delete', {
            data: {
                admin_username: adminUsername,
                admin_password: adminPassword,
                target_username: deleteTarget.username
            }
        });
        
        // Remove user from local state
        setUsers(prev => prev.filter(u => u.username !== deleteTarget.username));
        setDeleteTarget(null);
        setAdminPassword('');
        alert(`User ${deleteTarget.username} has been removed.`);
    } catch (error) {
        console.error("Delete failed", error);
        alert(error.response?.data?.detail || "Failed to delete user. Check admin credentials.");
    } finally {
        setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-8 relative z-10">
      <div className="flex items-center space-x-4 mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-cyber-primary blur-lg opacity-50 animate-pulse"></div>
          <Shield className="w-12 h-12 text-cyber-primary relative z-10" />
        </div>
        <h1 className="text-4xl font-sci text-transparent bg-clip-text bg-gradient-to-r from-cyber-primary to-cyber-secondary drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          SYSTEM ADMINISTRATOR
        </h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 border-l-4 border-cyber-primary group hover:bg-cyber-primary/5 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div>
                <p className="text-cyber-dim text-sm uppercase tracking-widest font-mono">Total Users</p>
                <h3 className="text-3xl font-bold text-cyber-primary mt-2 font-sci">{users.length}</h3>
            </div>
            <Users className="w-8 h-8 text-cyber-primary/50 group-hover:text-cyber-primary transition-colors" />
          </div>
        </motion.div>
        
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="glass-panel p-6 border-l-4 border-cyber-secondary group hover:bg-cyber-secondary/5 transition-colors"
        >
          <div className="flex justify-between items-start">
             <div>
                <p className="text-cyber-dim text-sm uppercase tracking-widest font-mono">System Stability</p>
                <h3 className="text-3xl font-bold text-cyber-secondary mt-2 font-sci">STABLE</h3>
             </div>
             <Activity className="w-8 h-8 text-cyber-secondary/50 group-hover:text-cyber-secondary transition-colors animate-pulse" />
          </div>
        </motion.div>

        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="glass-panel p-6 border-l-4 border-cyber-primary group hover:bg-cyber-primary/5 transition-colors"
        >
          <div className="flex justify-between items-start">
             <div>
                <p className="text-cyber-dim text-sm uppercase tracking-widest font-mono">Database Link</p>
                <h3 className="text-3xl font-bold text-cyber-primary mt-2 font-sci">ACTIVE</h3>
             </div>
             <Database className="w-8 h-8 text-cyber-primary/50 group-hover:text-cyber-primary transition-colors" />
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-panel overflow-hidden border border-cyber-primary/20 shadow-neon-blue/10"
      >
        <div className="px-6 py-4 border-b border-cyber-primary/20 bg-cyber-primary/5 flex justify-between items-center">
          <h2 className="text-xl font-sci text-cyber-primary tracking-wider flex items-center gap-2">
            <Cpu className="w-5 h-5" /> USER REGISTRY
          </h2>
        </div>
        <div className="p-0">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-cyber-primary/10 text-cyber-dim uppercase text-xs tracking-widest font-mono">
                        <th className="px-6 py-4">Username</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-cyber-primary/10">
                    {users.map((user, idx) => (
                        <motion.tr 
                            key={idx} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + (idx * 0.1) }}
                            className="hover:bg-cyber-primary/5 transition-colors cursor-pointer group"
                            whileHover={{ backgroundColor: "rgba(0, 210, 255, 0.08)" }}
                        >
                            <td className="px-6 py-4 font-bold text-cyber-text font-tech group-hover:text-cyber-primary transition-colors">{user.username}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs uppercase tracking-wide font-bold ${
                                    user.role === 'admin' 
                                    ? 'bg-cyber-primary/20 text-cyber-primary border border-cyber-primary/50' 
                                    : 'bg-cyber-secondary/20 text-cyber-secondary border border-cyber-secondary/50'
                                }`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-cyber-dim font-mono text-sm">{user.email}</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.5)] animate-pulse"></div>
                                    <span className="text-green-400 text-xs font-bold">ACTIVE</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                {user.role !== 'admin' && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(user); }}
                                        className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                        title="Delete User"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-cyber-black border border-red-500/50 rounded-xl p-6 max-w-md w-full shadow-[0_0_30px_rgba(239,68,68,0.2)]"
                >
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-xl font-sci text-red-500 flex items-center">
                            <AlertTriangle className="w-6 h-6 mr-2" /> CONFIRM DELETION
                        </h3>
                        <button onClick={() => setDeleteTarget(null)} className="text-cyber-dim hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <p className="text-cyber-text mb-6">
                        Are you sure you want to permanently delete the user record of <span className="text-cyber-primary font-bold">{deleteTarget.username}</span>?
                        This action cannot be undone.
                    </p>
                    
                    <div className="mb-6">
                        <label className="block text-xs uppercase tracking-widest text-cyber-dim mb-2">Admin Authorization</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-4 h-4 text-cyber-dim" />
                            <input 
                                type="password" 
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                className="w-full bg-black/50 border border-cyber-dim/30 rounded py-2 pl-10 pr-4 text-cyber-text focus:border-red-500 focus:outline-none transition-colors"
                                placeholder="Enter Admin Password"
                            />
                        </div>
                    </div>
                    
                    <div className="flex space-x-4">
                        <button 
                            onClick={() => setDeleteTarget(null)}
                            className="flex-1 py-3 border border-cyber-dim/30 text-cyber-dim rounded hover:bg-cyber-dim/10 transition-colors uppercase font-bold text-sm"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleDeleteUser}
                            disabled={!adminPassword || deleteLoading}
                            className="flex-1 py-3 bg-red-600/20 border border-red-500 text-red-500 rounded hover:bg-red-600 hover:text-white transition-all uppercase font-bold text-sm flex justify-center items-center"
                        >
                            {deleteLoading ? <span className="animate-pulse">Deleting...</span> : "Confirm Deletion"}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
