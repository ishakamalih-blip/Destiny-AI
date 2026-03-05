import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Save, Fingerprint, Activity, Database, Trash2, AlertTriangle, Upload, Camera } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [palmData, setPalmData] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoBase64, setProfilePhotoBase64] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    // Load user data from localStorage or initial sync
    // Since we don't have a /users/me endpoint with auth, we rely on what we stored during login
    // However, the Login.jsx only stored 'user_name' and 'user_role'.
    // To get the email and palm_data, we should ideally fetch it.
    // But our backend is simple. Let's assume we can fetch by username via a new endpoint or just use what we have.
    // For now, let's just use what we have and maybe fetch if we add a 'get user' endpoint.
    // Wait, I updated /login to return email and palm_data. But that's only at login.
    // If the user refreshes, we lose it unless we put it in localStorage.
    
    // Let's rely on localStorage for now, assuming the user just logged in or we updated it.
    const storedUser = localStorage.getItem('user_name');
    const storedEmail = localStorage.getItem('user_email') || '';
    const storedPalmData = localStorage.getItem('latestAnalysis'); // We stored this in Analysis.jsx
    const storedProfilePhoto = localStorage.getItem('profilePhoto');

    setUsername(storedUser || '');
    setEmail(storedEmail);
    if (storedPalmData) {
        setPalmData(JSON.parse(storedPalmData));
    }
    if (storedProfilePhoto) {
        setProfilePhotoBase64(storedProfilePhoto);
    }
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // If we have palm data in localStorage (from Analysis page), we should sync it to backend too
      const currentPalmData = palmData || (localStorage.getItem('latestAnalysis') ? JSON.parse(localStorage.getItem('latestAnalysis')) : null);

      const payload = {
        username: username,
        email: email,
        password: password || undefined, // Only send if changed
        palm_data: currentPalmData,
        profile_photo: profilePhotoBase64 || undefined
      };

      await axios.put('/users/update', payload);
      
      // Update localStorage
      localStorage.setItem('user_email', email);
      if (currentPalmData) {
          localStorage.setItem('latestAnalysis', JSON.stringify(currentPalmData));
      }
      if (profilePhotoBase64) {
          localStorage.setItem('profilePhoto', profilePhotoBase64);
      }
      
      setMessage('Account profile updated successfully.');
      setPassword(''); // Clear password field
    } catch (error) {
      console.error("Update failed", error);
      setMessage('Failed to update account profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result;
        setProfilePhotoBase64(base64String);
        setProfilePhoto(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
        alert("Please enter your password to confirm deletion.");
        return;
    }
    
    setDeleteLoading(true);
    try {
        await axios.delete('/users/delete', {
            data: {
                username: username,
                password: deletePassword
            }
        });
        
        // Cleanup
        localStorage.clear();
        alert("Account deleted successfully.");
        navigate('/login');
    } catch (error) {
        console.error("Delete failed", error);
        alert(error.response?.data?.detail || "Failed to delete account. Incorrect password?");
    } finally {
        setDeleteLoading(false);
        setDeletePassword('');
    }
  };

  return (
    <div className="space-y-8 relative z-10">
       <div className="flex items-center space-x-4 border-b border-blue-500/20 pb-6">
          <div className="p-3 bg-blue-500/10 rounded-full border border-blue-500/50">
            <User className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white font-sci">
                MY PROFILE
            </h1>
            <p className="text-cyber-dim font-mono text-sm tracking-wider">Manage your account settings</p>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-8">
          {/* Profile Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-8 rounded-xl border border-blue-500/20"
          >
             <h2 className="text-xl font-sci text-cyber-text mb-6 flex items-center">
                <Database className="w-5 h-5 mr-2 text-blue-400" /> MY ACCOUNT
             </h2>

             {message && (
                <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm text-center rounded font-mono">
                    {message}
                </div>
             )}

             {/* Profile Photo Section */}
             <div className="mb-8 p-6 bg-cyber-black/50 border border-blue-500/20 rounded-lg">
                <label className="block text-cyber-dim text-xs font-mono uppercase mb-4 flex items-center">
                  <Camera className="w-4 h-4 mr-2 text-blue-400" /> Profile Photo
                </label>
                <div className="flex items-center gap-6">
                  {/* Photo Preview */}
                  <div className="w-24 h-24 rounded-lg border-2 border-blue-500/30 bg-cyber-dark/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {profilePhotoBase64 ? (
                      <img src={profilePhotoBase64} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-cyber-dim" />
                    )}
                  </div>
                  
                  {/* Upload Input */}
                  <div className="flex-1">
                    <input 
                      type="file" 
                      id="photoUpload"
                      accept="image/*" 
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <label htmlFor="photoUpload" className="block">
                      <div className="cursor-pointer p-4 border-2 border-dashed border-blue-500/40 rounded-lg hover:border-blue-500 transition-colors text-center">
                        <Upload className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                        <p className="text-cyber-dim text-xs font-mono">Click to upload image</p>
                        <p className="text-cyber-dim/50 text-[10px] mt-1">Max 5MB • JPG, PNG</p>
                      </div>
                    </label>
                    {profilePhoto && (
                      <p className="text-cyan-400 text-xs mt-2 font-mono">✓ {profilePhoto}</p>
                    )}
                  </div>
                </div>
             </div>

             <form onSubmit={handleUpdate} className="space-y-6">
                <div>
                    <label className="block text-cyber-dim text-xs font-mono uppercase mb-2">Account Username</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-cyber-dim" />
                        <input 
                            type="text" 
                            value={username} 
                            disabled 
                            className="w-full bg-cyber-black/50 border border-cyber-dim/20 text-cyber-dim pl-10 pr-4 py-2.5 rounded cursor-not-allowed font-tech"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-cyber-dim text-xs font-mono uppercase mb-2">Email Address</label>
                    <div className="relative group">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-blue-500/50 group-focus-within:text-blue-400" />
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-cyber-black/50 border border-cyber-dim/30 text-cyber-text pl-10 pr-4 py-2.5 rounded focus:border-blue-500 focus:outline-none transition-colors font-tech"
                            placeholder="Enter your email"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-cyber-dim text-xs font-mono uppercase mb-2">Update Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-blue-500/50 group-focus-within:text-blue-400" />
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-cyber-black/50 border border-cyber-dim/30 text-cyber-text pl-10 pr-4 py-2.5 rounded focus:border-blue-500 focus:outline-none transition-colors font-tech"
                            placeholder="Leave blank to keep current"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-3 bg-cyber-dark border border-blue-500 text-blue-400 font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all duration-300 rounded shadow-[0_0_10px_rgba(0,150,255,0.1)] flex items-center justify-center space-x-2 group"
                    >
                        {loading ? (
                            <span className="animate-pulse">Updating...</span>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </div>
             </form>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-8 rounded-xl border border-red-500/30 relative overflow-hidden group"
          >
             <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors"></div>
             <h2 className="text-xl font-sci text-red-500 mb-6 flex items-center relative z-10">
                <AlertTriangle className="w-5 h-5 mr-2" /> DANGER ZONE
             </h2>
             
             {!showDeleteConfirm ? (
                <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full py-3 border border-red-500/50 text-red-400 font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all duration-300 rounded flex items-center justify-center space-x-2 relative z-10"
                >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Account</span>
                </button>
             ) : (
                <div className="space-y-4 relative z-10 animate-fade-in">
                    <p className="text-red-300/80 text-sm font-mono">
                        This action is irreversible. All your analysis data will be permanently removed.
                    </p>
                    <input 
                        type="password" 
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="w-full bg-cyber-black/50 border border-red-500/30 text-red-100 pl-4 pr-4 py-2 rounded focus:border-red-500 focus:outline-none font-tech placeholder-red-500/30"
                        placeholder="Confirm Password"
                    />
                    <div className="flex space-x-3">
                        <button 
                            onClick={handleDeleteAccount}
                            disabled={deleteLoading}
                            className="flex-1 py-2 bg-red-600/20 border border-red-500 text-red-500 font-bold uppercase text-sm hover:bg-red-600 hover:text-white transition-all rounded"
                        >
                            {deleteLoading ? "Erasing..." : "Confirm Delete"}
                        </button>
                        <button 
                            onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }}
                            className="flex-1 py-2 bg-transparent border border-cyber-dim/30 text-cyber-dim font-bold uppercase text-sm hover:bg-cyber-dim/10 transition-all rounded"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
             )}
          </motion.div>
          </div>

          {/* Biometric Data Visualization */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-8 rounded-xl border border-blue-500/20"
          >
             <h2 className="text-xl font-sci text-cyber-text mb-6 flex items-center">
                <Fingerprint className="w-5 h-5 mr-2 text-blue-400" /> YOUR PALM REPORT
             </h2>

             {palmData ? (
                <div className="space-y-8">
                    <div className="flex justify-between items-end border-b border-cyber-dim/10 pb-4">
                        <div>
                            <span className="text-cyber-dim text-xs font-mono uppercase">Last Analysis</span>
                            <p className="text-white font-tech">PALM_SCAN_v1.0</p>
                        </div>
                        <Activity className="w-6 h-6 text-blue-400 animate-pulse" />
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-mono">
                                <span className="text-cyber-dim">PHYSICAL ENERGY</span>
                                <span className="text-blue-400">{palmData?.extracted_data?.vitality_index || 0}/10</span>
                            </div>
                            <div className="w-full bg-cyber-black h-1.5 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(palmData?.extracted_data?.vitality_index || 0) * 10}%` }}
                                    className="h-full bg-blue-500 shadow-[0_0_10px_rgba(0,150,255,0.5)]"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-mono">
                                <span className="text-cyber-dim">MENTAL STRENGTH</span>
                                <span className="text-cyan-400">{palmData?.extracted_data?.cognitive_index || 0}/10</span>
                            </div>
                            <div className="w-full bg-cyber-black h-1.5 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(palmData?.extracted_data?.cognitive_index || 0) * 10}%` }}
                                    className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-mono">
                                <span className="text-cyber-dim">EMOTIONAL NATURE</span>
                                <span className="text-purple-400">{palmData?.extracted_data?.emotional_index || 0}/10</span>
                            </div>
                            <div className="w-full bg-cyber-black h-1.5 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(palmData?.extracted_data?.emotional_index || 0) * 10}%` }}
                                    className="h-full bg-purple-500 shadow-[0_0_10px_rgba(157,80,187,0.5)]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="p-4 bg-cyber-dark/50 rounded border border-blue-500/20">
                            <span className="text-blue-400 text-[10px] font-mono uppercase block mb-1">Status</span>
                            <p className="text-white text-xs font-tech">ACTIVE</p>
                        </div>
                        <div className="p-4 bg-cyber-dark/50 rounded border border-cyan-500/20">
                            <span className="text-cyan-400 text-[10px] font-mono uppercase block mb-1">Consistency</span>
                            <p className="text-white text-xs font-tech">EXCELLENT</p>
                        </div>
                    </div>

                    {/* New Descriptive Profile Sections */}
                    <div className="space-y-4 pt-4">
                        <div className="p-3 bg-cyber-dark/40 rounded border-l-2 border-blue-500">
                            <span className="text-blue-400 text-[10px] font-mono uppercase block">Mind & Thinking</span>
                            <div className="flex justify-between mt-1">
                                <span className="text-white text-xs font-tech">{palmData?.cognitive_profile?.thinking_ability || 'N/A'}</span>
                                <span className="text-cyber-dim text-[10px] font-mono">IQ: {palmData?.cognitive_profile?.iq_type || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="p-3 bg-cyber-dark/40 rounded border-l-2 border-purple-500">
                            <span className="text-purple-400 text-[10px] font-mono uppercase block">Heart & Feelings</span>
                            <div className="flex justify-between mt-1">
                                <span className="text-white text-xs font-tech">{palmData?.emotional_profile?.relationship_dynamic || 'N/A'}</span>
                                <span className="text-cyber-dim text-[10px] font-mono">EQ: {palmData?.emotional_profile?.eq_level || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="p-3 bg-cyber-dark/40 rounded border-l-2 border-cyan-500">
                            <span className="text-cyan-400 text-[10px] font-mono uppercase block">Career & Nature</span>
                            <div className="flex justify-between mt-1">
                                <span className="text-white text-xs font-tech">{palmData?.behavioral_profile?.career_guidance || 'N/A'}</span>
                                <span className="text-cyber-dim text-[10px] font-mono">TYPE: {palmData?.behavioral_profile?.type || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
             ) : (
                <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-cyber-dark border border-cyber-dim/20 flex items-center justify-center opacity-30">
                        <Fingerprint className="w-8 h-8" />
                    </div>
                    <p className="text-cyber-dim text-sm font-tech px-6">No analysis data found. Start a scan to see your report.</p>
                    <button 
                        onClick={() => navigate('/analysis')}
                        className="text-blue-400 text-xs font-mono uppercase tracking-widest hover:text-white transition-colors"
                    >
                        Start New Analysis &rarr;
                    </button>
                </div>
             )}
          </motion.div>
       </div>
    </div>
  );
}