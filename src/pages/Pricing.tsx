import { useState } from 'react';
import type { FormEvent } from 'react';
import { User } from 'firebase/auth';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../types';
import { Check, Loader2, Rocket, Zap, Crown, Smartphone, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../lib/LanguageContext';

interface PricingProps {
  onNavigate: (page: any) => void;
  user: User | null;
  profile: UserProfile | null;
}

export default function Pricing({ onNavigate, user, profile }: PricingProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState<string | null>(null);
  const [showMpesa, setShowMpesa] = useState(false);
  const [phone, setPhone] = useState("");
  const [payStep, setPayStep] = useState<'input' | 'processing' | 'success'>('input');

  const handleMpesaPay = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setPayStep('processing');
    try {
      // Simulate STK Push
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      await setDoc(doc(db, 'users', user.uid), {
        isPremium: true,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      await addDoc(collection(db, 'users', user.uid, 'payments'), {
        amount: 499,
        phoneNumber: phone,
        status: 'completed',
        timestamp: serverTimestamp()
      });
      
      setPayStep('success');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/payments`);
      setPayStep('input');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 dark:text-white">
      <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">{t('pricing')}</h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed italic">
            "Biashara ni asubuhi." Invest in your business growth today.
          </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Free Tier */}
        <div className="card-premium h-full flex flex-col items-center text-center p-8 bg-white dark:bg-slate-800 transition-colors">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-6">
            <Zap className="w-8 h-8 text-slate-400 dark:text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 font-sans">Starter</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 font-medium">Perfect for small kiosks</p>
          <div className="mb-8">
            <span className="text-4xl font-black text-slate-900 dark:text-white">FREE</span>
          </div>
          <ul className="space-y-4 mb-10 text-left w-full">
            <li className="flex items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <Check className="w-4 h-4 text-green-500" /> 10 Records Per Day
            </li>
            <li className="flex items-center gap-3 text-sm font-semibold opacity-30 dark:text-slate-500">
              <Check className="w-4 h-4" /> AI Growth Reports
            </li>
          </ul>
          <button 
            disabled 
            className="mt-auto w-full py-4 bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest"
          >
            CURRENT PLAN
          </button>
        </div>

        {/* Premium Tier */}
        <div className="card-premium h-full flex flex-col items-center text-center p-8 border-2 border-emerald-500 shadow-xl shadow-emerald-100 dark:shadow-none relative">
          <div className="absolute -top-4 bg-emerald-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Most Popular</div>
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-200 group-hover:scale-105 transition-transform">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Biashara Pro</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 font-medium">For serious entrepreneurs</p>
          <div className="mb-8">
            <span className="text-4xl font-black text-slate-900 dark:text-white border-b-4 border-emerald-500">KSh 500</span>
            <span className="text-slate-400 text-xs font-bold ml-1 uppercase">/mo</span>
          </div>
          <div className="mb-8 p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl border border-emerald-100 dark:border-emerald-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">7-Day Free Trial Included</span>
          </div>
          <ul className="space-y-4 mb-10 text-left w-full">
             <li className="flex items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <Check className="w-4 h-4 text-emerald-500" /> Biashara Smart AI Assistant
            </li>
            <li className="flex items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <Check className="w-4 h-4 text-emerald-500" /> Auto M-Pesa SMS Parser
            </li>
            <li className="flex items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <Check className="w-4 h-4 text-emerald-500" /> 7-Day Sales Forecasts
            </li>
          </ul>
          <button 
            onClick={() => user ? setShowMpesa(true) : onNavigate('login')}
            disabled={profile?.isPremium}
            className="mt-auto w-full py-4 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95"
          >
            {profile?.isPremium ? 'PRO ACTIVE' : t('pricing')} VIA M-PESA
          </button>
        </div>

         {/* Enterprise Tier */}
         <div className="card-premium h-full flex flex-col items-center text-center p-8 bg-white dark:bg-slate-800 transition-colors">
          <div className="w-16 h-16 bg-slate-900 dark:bg-slate-950 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-slate-200 dark:shadow-none">
            <Crown className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Business Plus</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 font-medium">Custom solutions</p>
          <div className="mb-8">
             <span className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Contact Us</span>
          </div>
          <ul className="space-y-4 mb-10 text-left w-full">
            <li className="flex items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <Check className="w-4 h-4 text-slate-900 dark:text-slate-400" /> Multi-Shop Sync
            </li>
            <li className="flex items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <Check className="w-4 h-4 text-slate-900 dark:text-slate-400" /> API Access
            </li>
          </ul>
          <button 
            className="mt-auto w-full py-4 border-2 border-slate-900 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
          >
            TALK TO SALES
          </button>
        </div>
      </div>

      {/* M-Pesa Modal */}
      <AnimatePresence>
        {showMpesa && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMpesa(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl overflow-hidden"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 p-4 bg-green-50 rounded-2xl shadow-inner">
                  <Smartphone className="w-10 h-10 text-green-600" />
                </div>
                
                {payStep === 'input' && (
                  <>
                    <h2 className="text-2xl font-extrabold text-slate-900 mb-2">M-Pesa Checkout</h2>
                    <p className="text-slate-500 text-sm mb-8 px-4 font-medium italic">Enter your number to receive an STK Push on your phone.</p>
                    
                    <form onSubmit={handleMpesaPay} className="w-full">
                      <div className="mb-8">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest text-left mb-2 pl-4">Your Phone Number</label>
                        <input 
                          required
                          placeholder="0712 345 678"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-center text-xl font-black outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-inner"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                      <button className="w-full bg-green-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100">
                        Pay KES 500
                      </button>
                    </form>
                  </>
                )}

                {payStep === 'processing' && (
                  <div className="py-12">
                    <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-6" />
                    <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Waiting for PIN...</h2>
                    <p className="text-slate-500 font-medium italic text-sm">Check your phone to enter your M-Pesa PIN.</p>
                  </div>
                )}

                {payStep === 'success' && (
                  <div className="py-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Welcome to Premium!</h2>
                    <p className="text-slate-500 mb-8 font-medium">Your account has been upgraded successfully.</p>
                    <button 
                      onClick={() => onNavigate('dashboard')}
                      className="btn-pro w-full py-4 uppercase tracking-widest text-xs font-black shadow-lg shadow-blue-100"
                    >
                      GO TO DASHBOARD
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
