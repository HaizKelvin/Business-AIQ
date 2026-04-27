import { useState } from 'react';
import type { FormEvent } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { Rocket, Store, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface OnboardingProps {
  profile: UserProfile;
  onComplete: (updatedProfile: UserProfile) => void;
}

export default function Onboarding({ profile, onComplete }: OnboardingProps) {
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;

    setLoading(true);
    try {
      const profileRef = doc(db, 'users', profile.uid);
      await updateDoc(profileRef, {
        businessName: businessName.trim(),
        onboarded: true,
        updatedAt: serverTimestamp()
      });
      onComplete({
        ...profile,
        businessName: businessName.trim(),
        onboarded: true
      });
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl p-8 lg:p-12 shadow-xl shadow-slate-200/50 border border-slate-200"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Let's build your shop</h1>
          <p className="text-slate-500 font-medium italic text-sm">Tell us the name of your business to get started.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-4">Business Name</label>
            <input 
              required
              autoFocus
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Juma's Hardware"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <button 
            type="submit"
            disabled={loading || !businessName.trim()}
            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                CONTINUE TO DASHBOARD <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
