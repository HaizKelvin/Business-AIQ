import { motion } from 'framer-motion';
import { Target, Megaphone, Share2, Users, Lightbulb, Zap } from 'lucide-react';
import { UserProfile } from '../types';
import { useLanguage } from '../lib/LanguageContext';

export default function MarketingPage({ profile }: { profile: UserProfile | null }) {
  const { t } = useLanguage();

  const strategies = [
    {
      title: 'WhatsApp Business',
      description: 'The #1 way to reach customers in Kenya. Use status updates to showcase new stock.',
      icon: <Share2 className="w-6 h-6 text-emerald-600" />,
      tips: ['Post clear photos', 'Include prices', 'Reply within 10 minutes']
    },
    {
      title: 'Local Referral Program',
      description: 'Give a KSh 50 discount to customers who bring a friend.',
      icon: <Users className="w-6 h-6 text-emerald-600" />,
      tips: ['Simple word of mouth', 'Loyalty cards', 'Community trust']
    },
    {
      title: 'Social Media Organic',
      description: 'Post your daily "duka life" on TikTok or Instagram Reels.',
      icon: <Megaphone className="w-6 h-6 text-emerald-600" />,
      tips: ['Use trending Kenyan music', 'Be authentic', 'Show the behind-the-scenes']
    }
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-12">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          {t('marketing')} strategies for {profile?.businessName || 'Success'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
          Grow your customer base using these local-first marketing techniques.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {strategies.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all h-full flex flex-col"
          >
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-6">
              {s.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{s.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-1 italic">{s.description}</p>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">Pro Tips</p>
              {s.tips.map((tip, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  {tip}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-emerald-600 rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
          <div className="lg:w-2/3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-6">
              <Lightbulb className="w-3 h-3" />
              AI Insight
            </div>
            <h2 className="text-3xl font-bold mb-4 tracking-tight">Need a professional logo or poster?</h2>
            <p className="text-emerald-100 text-lg leading-relaxed font-medium">
              Biashara Smart AI can help you generate ad copy for your next sale. Just ask the chatbot!
            </p>
          </div>
          <div className="lg:w-1/3 flex justify-center">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center border border-white/20 animate-pulse">
              <Target className="w-12 h-12 text-emerald-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
