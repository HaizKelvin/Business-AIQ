import { LayoutDashboard, ReceiptText, CreditCard, LogOut, Rocket, Sparkles, Wallet, Package, Megaphone, Users, PiggyBank, Languages, Settings as SettingsIcon, X } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { UserProfile } from '../types';
import { useLanguage } from '../lib/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  onNavigate: (page: any) => void;
  activePage: string;
  profile: UserProfile | null;
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ onNavigate, activePage, profile, isOpen, toggleSidebar }: SidebarProps) {
  const { t, language, setLanguage } = useLanguage();

  const handleSignOut = async () => {
    await signOut(auth);
    onNavigate('landing');
  };

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'transactions', label: t('transactions'), icon: ReceiptText },
    { id: 'debts', label: t('debts'), icon: Wallet },
    { id: 'inventory', label: t('inventory'), icon: Package },
    { id: 'marketing', label: t('marketing'), icon: Megaphone },
    { id: 'suppliers', label: t('suppliers'), icon: Users },
    { id: 'savings', label: t('savings'), icon: PiggyBank },
    { id: 'settings', label: t('settings'), icon: SettingsIcon },
    { id: 'pricing', label: t('pricing'), icon: CreditCard },
  ];

  const handleNavClick = (id: string) => {
    if (id === activePage) {
      toggleSidebar();
    } else {
      onNavigate(id as any);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-colors"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      <motion.aside 
        initial={false}
        animate={{ 
          translateX: isOpen ? '0%' : '-100%',
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 80 }}
        className="w-64 bg-[#1e293b] flex flex-col border-r border-slate-800 h-screen fixed left-0 top-0 z-50 overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8 lg:block">
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => onNavigate('dashboard')}
            >
              <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">Biashara <span className="text-emerald-400">Smart</span></h1>
            </div>
            <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`sidebar-link w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activePage === item.id ? 'sidebar-link-active' : 'sidebar-link-inactive'
                }`}
              >
                <item.icon className={`w-5 h-5 ${activePage === item.id ? 'text-emerald-400' : ''}`} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-4">
          {/* Language Toggle */}
          <button 
            onClick={() => setLanguage(language === 'en' ? 'sw' : 'en')}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all text-xs font-bold"
          >
            <Languages className="w-4 h-4 text-emerald-400" />
            {t('switchLanguage')}
          </button>

          {!profile?.isPremium && (
            <div className="bg-emerald-600 rounded-xl p-4 shadow-lg shadow-emerald-900/20">
              <p className="text-[10px] text-emerald-100 font-black mb-1 uppercase tracking-widest">Upgrade App</p>
              <p className="text-sm text-white font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-200" />
                AI Insights
              </p>
              <button 
                onClick={() => onNavigate('pricing')}
                className="mt-3 w-full bg-white text-emerald-600 text-xs font-black py-2.5 rounded-lg shadow-sm hover:bg-emerald-50 transition-colors uppercase tracking-wider"
              >
                {t('pricing')}
              </button>
            </div>
          )}
          
          <button
            onClick={handleSignOut}
            className="sidebar-link w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">{t('logout')}</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
