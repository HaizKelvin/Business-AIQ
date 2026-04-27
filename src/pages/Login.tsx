import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { Rocket, Chrome } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoginProps {
  onNavigate: (page: any) => void;
}

export default function LoginPage({ onNavigate }: LoginProps) {
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // App.tsx handles redirecting once auth state changes
    } catch (error) {
      console.error("Login mapping error", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 transition-colors">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 lg:p-12 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 transition-colors"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <div 
            onClick={() => onNavigate('landing')}
            className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20 cursor-pointer group"
          >
            <Rocket className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Business Login</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium italic text-sm">Secure access to Biashara Smart AI</p>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-4 rounded-xl text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-emerald-200 dark:hover:border-emerald-900 transition-all mb-6"
        >
          <Chrome className="w-6 h-6 text-emerald-600" />
          Continue with Google
        </button>

        <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest px-4 leading-relaxed">
          Biashara Smart <span className="text-emerald-500">Secure</span> Cloud. Your data is encrypted and private.
        </p>

        <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            New here? <span onClick={() => onNavigate('landing')} className="text-emerald-600 font-black cursor-pointer hover:underline">Discover Biashara Smart</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
