import { motion } from 'framer-motion';
import { ArrowRight, BrainCircuit, BarChart3, ShieldCheck, Zap, Star, Package, Wallet, MessageSquare, ListCheck, Smartphone, Target, Globe, Languages, Sun, Moon } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';
import { useTheme } from '../lib/ThemeContext';

interface LandingProps {
  onNavigate: (page: any) => void;
}

export default function Landing({ onNavigate }: LandingProps) {
  const { t, language, setLanguage } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div className="bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-emerald-600 fill-emerald-600" />
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Biashara Smart</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleDarkMode}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => setLanguage(language === 'en' ? 'sw' : 'en')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-xs font-bold"
            >
              <Languages className="w-3 h-3" />
              {language === 'en' ? 'Kiswahili' : 'English'}
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="bg-emerald-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-200"
            >
              {t('getStarted')}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl text-center mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                <Zap className="w-3 h-3 fill-emerald-700" />
                No. 1 AI Business App in Kenya
              </span>
              <h1 className="text-5xl lg:text-8xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1] mb-8">
                {t('heroTitle')} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                  {t('heroSubtitle')}
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-3xl mx-auto font-medium">
                {t('heroDescription')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => onNavigate('login')}
                  className="bg-emerald-600 text-white px-10 py-5 rounded-2xl text-lg font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-200/50"
                >
                  {t('getStarted')} <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onNavigate('pricing')}
                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 px-10 py-5 rounded-2xl text-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-center"
                >
                  {t('pricing')}
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-100 dark:bg-emerald-950 rounded-full blur-[120px] opacity-20 -z-0 pointer-events-none" />
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-100 dark:bg-indigo-950 rounded-full blur-[120px] opacity-20 -z-0 pointer-events-none" />
      </section>

      {/* How it Works */}
      <section className="py-24 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">How it Works</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">Three simple steps to transform your business operations.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <StepCard 
              number="01" 
              title="Connect & Onboard" 
              desc="Sign in with Google and tell us your business name. No complicated setup." 
              icon={<Smartphone className="w-6 h-6" />}
            />
            <StepCard 
              number="02" 
              title="Record Transactions" 
              desc='Talk to the AI. Say "Sold 2 milk at 60 each" or paste an M-Pesa SMS.' 
              icon={<MessageSquare className="w-6 h-6" />}
            />
            <StepCard 
              number="03" 
              title="Get AI Advice" 
              desc="View profit reports and let Biashara Smart predict your next big sale." 
              icon={<BrainCircuit className="w-6 h-6" />}
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<BrainCircuit className="w-6 h-6" />}
              title="Kenyan AI Logic"
              description="Understands Swahili, Sheng, and English mixed inputs perfectly."
            />
            <FeatureCard 
              icon={<Smartphone className="w-6 h-6" />}
              title="Mobile First"
              description="Designed to work fast on any smartphone, even with slow networks."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6" />}
              title="M-Pesa Ready"
              description="Copy-paste M-Pesa messages directly to log sales automatically."
            />
            <FeatureCard 
              icon={<ListCheck className="w-6 h-6" />}
              title="Inventory Tracking"
              description="Never run out of unga. Get alerts when stock levels go below your limit."
            />
            <FeatureCard 
              icon={<Wallet className="w-6 h-6" />}
              title="Debt Recovery"
              description="Keep track of credits so you never lose a cent from 'madeni'."
            />
            <FeatureCard 
              icon={<Globe className="w-6 h-6" />}
              title="Offline Capable"
              description="View your business stats even when your data bundle runs out."
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white dark:bg-slate-900 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-center mb-16 text-slate-900 dark:text-white">Common Questions</h2>
          <div className="space-y-6">
            <FAQCard 
              q="Is my data safe?" 
              a="Yes. We use Google Cloud encryption. Only you can see your business records." 
            />
            <FAQCard 
              q="Can I use it for free?" 
              a="Yes! The basic tracking is free forever. AI insights and advanced predictions require a Premium subscription with a 7-day free trial." 
            />
            <FAQCard 
              q="What if I have multiple shops?" 
              a="Currently, Biashara Smart supports one business per account. We are working on multi-shop support soon!" 
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-8">
            <Zap className="w-8 h-8 text-emerald-600 fill-emerald-600" />
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Biashara Smart</span>
          </div>
          <div className="flex justify-center gap-8 mb-12 text-sm font-bold text-slate-400 uppercase tracking-widest">
            <span className="hover:text-emerald-600 cursor-pointer">About</span>
            <span className="hover:text-emerald-600 cursor-pointer">Privacy</span>
            <span className="hover:text-emerald-600 cursor-pointer">Terms</span>
            <span className="hover:text-emerald-600 cursor-pointer" onClick={() => onNavigate('pricing')}>Pricing</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">© 2026 Biashara Smart Kenya. Built for the modern entrepreneur.</p>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ number, title, desc, icon }: { number: string, title: string, desc: string, icon: any }) {
  return (
    <div className="relative p-10 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800">
      <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center font-black text-emerald-600 shadow-sm border border-slate-50 dark:border-slate-700">
        {number}
      </div>
      <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-emerald-100 dark:hover:border-emerald-900 hover:shadow-xl hover:shadow-emerald-500/5 transition-all group">
      <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-800 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic text-sm">{description}</p>
    </div>
  );
}

function FAQCard({ q, a }: { q: string, a: string }) {
  return (
    <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 transition-colors">
      <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Target className="w-4 h-4 text-emerald-500" />
        {q}
      </h4>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">{a}</p>
    </div>
  );
}
