import React from 'react';
import { LayoutDashboard, Bell, Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from '../lib/ThemeContext';
import { motion } from 'framer-motion';

interface HeaderProps {
  onNavigate: (page: any) => void;
  toggleSidebar: () => void;
  title: string;
}

export default function Header({ onNavigate, toggleSidebar, title }: HeaderProps) {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [showNotifications, setShowNotifications] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => onNavigate('dashboard')}
        >
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
             <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{title}</h2>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all relative group"
          >
            <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>
          
          {showNotifications && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 p-4 z-50 text-slate-900 dark:text-white"
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50 dark:border-slate-700">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Notifications</span>
                <span className="text-[10px] text-emerald-600 font-bold">Clear All</span>
              </div>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                  <p className="text-xs font-medium leading-relaxed">Pesa imepokelewa! KSh 450 from M-Pesa parsing helper.</p>
                </div>
                <div className="flex gap-3 grayscale opacity-50">
                  <div className="w-2 h-2 bg-slate-300 rounded-full mt-1.5 flex-shrink-0" />
                  <p className="text-xs font-medium leading-relaxed">Welcome to Biashara Smart! Your dashboard is ready.</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <button 
          onClick={toggleDarkMode}
          className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="h-6 w-px bg-slate-200 dark:border-slate-800 mx-2 hidden sm:block"></div>

        <button 
          onClick={() => onNavigate('settings')}
          className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs ring-2 ring-transparent hover:ring-emerald-500 transition-all"
        >
          US
        </button>
      </div>
    </header>
  );
}
