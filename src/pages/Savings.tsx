import { Landmark, PiggyBank, Briefcase, TrendingUp, ShieldCheck, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../lib/LanguageContext';

export default function SavingsPage({ profile }: { profile: any }) {
  const { t } = useLanguage();

  const saccos = [
    {
      name: 'Stima Sacco',
      focus: 'Housing & Education',
      interest: '10.5% p.a.',
      description: 'One of the largest in Kenya, great for long-term growth.'
    },
    {
      name: 'Sheria Sacco',
      focus: 'Legal & Civil Servants',
      interest: '9% p.a.',
      description: 'Focuses on legal empowerment and accessible credit.'
    },
    {
      name: 'Mwalimu National',
      focus: 'Education Professionals',
      interest: '11% p.a.',
      description: 'Exclusive to teachers but extremely powerful.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-12">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          {t('savings')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
          Financial growth strategies for the disciplined Kenyan entrepreneur.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Savings Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white dark:bg-slate-800 p-10 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <PiggyBank className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Why a Sacco is better than a Bank</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Borrow up to 3x</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Most Saccos allow you to borrow 3-4 times your savings.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Dividends</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Earn annual dividends (usually 7-15%) on your share capital.</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Lower Interest</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Loans are usually charged on a reducing balance basis.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Landmark className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Networking</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Connect with other serious business owners in your Sacco.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Tips */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900 p-8 rounded-3xl text-white flex flex-col justify-between"
        >
          <div>
            <HelpCircle className="w-10 h-10 text-emerald-400 mb-6" />
            <h3 className="text-xl font-bold mb-4">Start Small</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 italic">
              "Kuitupa tonge silo kuitupa shibe." 
              Saving even KSh 100 a day leads to massive growth over time.
            </p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 uppercase tracking-[0.2em] font-black text-[9px] text-center">
            Pesa ni Akiba
          </div>
        </motion.div>
      </div>

      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Popular Kenyan Saccos to consider</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {saccos.map((s, i) => (
          <div key={i} className="p-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-emerald-100 dark:hover:border-emerald-900 transition-colors">
            <h4 className="font-black text-slate-900 dark:text-white mb-1">{s.name}</h4>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mb-4">{s.focus} • {s.interest}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">{s.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
