import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Activity, MessageSquare, Shield, LogOut, Cpu, Database, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    navigate('/');
  };

  const userRole = localStorage.getItem('user_role');

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/analysis', icon: Activity, label: 'Analyze' },
    { path: '/chat', icon: MessageSquare, label: 'AI Assistant' },
    { path: '/history', icon: Database, label: 'History' },
    { path: '/profile', icon: User, label: 'My Profile' },
    ...(userRole === 'admin' ? [{ path: '/admin', icon: Shield, label: 'Admin' }] : []),
  ];

  return (
    <div className="flex h-screen bg-cyber-black text-cyber-text font-tech relative overflow-hidden">
      {/* Global Grid Effect */}
      <div className="grid-bg"></div>
      
      {/* Sidebar */}
      <aside className="relative z-20 w-64 glass-panel border-r border-cyber-primary/20 flex flex-col backdrop-blur-xl bg-cyber-dark/60">
        <div className="p-6 flex items-center space-x-3 border-b border-cyber-primary/20">
          <Cpu className="w-8 h-8 text-cyber-primary animate-pulse" />
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyber-primary to-white font-sci tracking-widest drop-shadow-sm">
            DESTINY AI
          </h1>
        </div>
        
        <nav className="mt-8 flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`relative flex items-center px-4 py-3 rounded-lg transition-all duration-300 group overflow-hidden ${isActive ? 'text-cyber-black font-bold' : 'text-cyber-dim hover:text-cyber-primary'}`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeNav"
                    className="absolute inset-0 bg-gradient-to-r from-cyber-primary to-blue-500 shadow-[0_0_15px_rgba(0,210,255,0.4)]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center">
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-cyber-black' : 'group-hover:text-cyber-primary group-hover:scale-110 transition-transform'}`} />
                  <span className="tracking-wider">{item.label}</span>
                </span>
                
                {/* Hover Effect for non-active items */}
                {!isActive && (
                  <div className="absolute inset-0 bg-cyber-primary/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-cyber-primary/20">
          <button 
            onClick={handleLogout} 
            className="flex items-center w-full px-4 py-2 text-cyber-dim hover:text-red-400 hover:bg-red-900/10 rounded transition-colors group"
          >
            <LogOut className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
            <span className="tracking-widest uppercase">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative z-10">
        <div className="max-w-7xl mx-auto">
           <AnimatePresence mode="wait">
             <motion.div
               key={location.pathname}
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 1.02 }}
               transition={{ duration: 0.4, ease: "easeOut" }}
             >
               <Outlet />
             </motion.div>
           </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
