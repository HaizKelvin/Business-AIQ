import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Shield, CreditCard, User, Globe, ChevronRight } from 'lucide-react';
import { UserProfile } from '../types';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useLanguage } from '../lib/LanguageContext';

export default function SettingsPage({ profile }: { profile: UserProfile | null }) {
  const { t, language, setLanguage } = useLanguage();
  const [isUpdating, setIsUpdating] = useState(false);
  const [businessName, setBusinessName] = useState(profile?.businessName || '');

  const handleUpdateProfile = async () => {
    if (!profile) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        businessName,
        updatedAt: serverTimestamp()
      });
      alert('Mipangilio imehifadhiwa!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const sections = [
    {
      title: 'Account',
      icon: <User className="w-5 h-5" />,
      items: [
        { label: 'Email', value: profile?.email, locked: true },
        { label: 'Business Type', value: 'Retail / Service', locked: true }
      ]
    },
    {
      title: 'Preferences',
      icon: <Globe className="w-5 h-5" />,
      items: [
        { 
          label: 'Display Language', 
          value: language === 'en' ? 'English' : 'Kiswahili', 
          action: () => setLanguage(language === 'en' ? 'sw' : 'en') 
        }
      ]
    },
    {
       title: 'Notifications',
       icon: <Bell className="w-5 h-5" />,
       items: [
         { label: 'WhatsApp Alerts', value: 'Enabled', locked: false },
         { label: 'Stock Warnings', value: 'Enabled', locked: false }
       ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-12">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-slate-400" />
          {t('settings')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your business profile and preferences.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Business Info Card */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Business Information</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('businessNameLabel')}</label>
                <input 
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all dark:text-white"
                />
              </div>
              <button 
                onClick={handleUpdateProfile}
                disabled={isUpdating}
                className="btn-pro py-3 px-8 text-xs disabled:opacity-50"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Settings Sections */}
          {sections.map((section, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
              <div className="px-8 py-5 border-b border-slate-50 dark:border-slate-700 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
                <div className="text-slate-400 dark:text-slate-500">{section.icon}</div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{section.title}</h3>
              </div>
              <div className="divide-y divide-slate-50 dark:divide-slate-700">
                {section.items.map((item, i) => (
                  <div 
                    key={i} 
                    onClick={item.action}
                    className={`px-8 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${item.action ? 'cursor-pointer' : ''}`}
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-500">{item.label}</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{item.value}</p>
                    </div>
                    {item.locked ? (
                      <Shield className="w-4 h-4 text-slate-300 dark:text-slate-700" />
                    ) : item.action ? (
                      <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <aside className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-8 text-white">
            <h4 className="text-lg font-bold mb-4">Subscription</h4>
            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <span className="font-bold">{profile?.isPremium ? 'Premium Plan' : 'Free Plan'}</span>
            </div>
            {!profile?.isPremium && (
              <button className="w-full bg-emerald-600 hover:bg-emerald-700 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-900">
                Upgrade Now
              </button>
            )}
          </div>
          
          <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-100">
            <h4 className="text-sm font-black text-emerald-800 uppercase tracking-widest mb-4">Support</h4>
            <p className="text-sm text-emerald-700 font-medium mb-4">Need help? Chat with our team in Nairobi.</p>
            <button className="text-sm font-bold text-emerald-600 flex items-center gap-2 hover:underline">
              Contact WhatsApp Support <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
