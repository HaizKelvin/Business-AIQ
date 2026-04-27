import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'sw';

interface Translations {
  [key: string]: {
    en: string;
    sw: string;
  };
}

export const translations: Translations = {
  dashboard: { en: 'Dashboard', sw: 'Dashibodi' },
  transactions: { en: 'Transactions', sw: 'Miamala' },
  inventory: { en: 'Inventory', sw: 'Stoko' },
  debts: { en: 'Debts', sw: 'Madeni' },
  marketing: { en: 'Marketing', sw: 'Masoko' },
  suppliers: { en: 'Suppliers', sw: 'Wasambazaji' },
  savings: { en: 'Savings & Sacco', sw: 'Akiba na Sacco' },
  pricing: { en: 'Pricing', sw: 'Bei' },
  logout: { en: 'Logout', sw: 'Ondoka' },
  settings: { en: 'Settings', sw: 'Mipangilio' },
  search: { en: 'Search...', sw: 'Tafuta...' },
  addRecord: { en: 'Add Record', sw: 'Weka Rekodi' },
  netProfit: { en: 'Net Profit', sw: 'Faida Halisi' },
  totalSales: { en: 'Total Sales', sw: 'Mauzo Jumla' },
  totalExpenses: { en: 'Total Expenses', sw: 'Gharama Jumla' },
  aiAdvisor: { en: 'AI Business Advisor', sw: 'Mshauri wa Biashara wa AI' },
  onboardingTitle: { en: "Let's build your shop", sw: 'Hebu tujenge duka lako' },
  businessNameLabel: { en: 'Business Name', sw: 'Jina la Biashara' },
  getStarted: { en: 'Get Started', sw: 'Anza Sasa' },
  welcome: { en: 'Welcome back', sw: 'Karibu tena' },
  heroTitle: { en: 'Grow Your Biashara', sw: 'Kuza Biashara Yako' },
  heroSubtitle: { en: 'Track your business in seconds with AI.', sw: 'Fuatilia biashara yako kwa sekunde ukitumia AI.' },
  heroDescription: { 
    en: 'The modern sales and expense tracker for Kenyan SMEs. Talk to our AI assistant in English or Swahili to log sales, parse M-Pesa SMS, and get smart insights.',
    sw: 'Kifuatiliaji cha kisasa cha mauzo na gharama kwa biashara ndogo za Kenya. Ongea na msaidizi wetu wa AI kwa Kiingereza au Kiswahili ili kurekodi mauzo, kusoma SMS za M-Pesa, na kupata ushauri bora.'
  },
  aiInputPlaceholder: { en: 'e.g. Sold 2 milk at 60 each...', sw: 'mfano. Nimeuza maziwa 2 kwa 60 kila moja...' },
  logSale: { en: 'Log Sale', sw: 'Rekodi Mauzo' },
  logExpense: { en: 'Log Expense', sw: 'Rekodi Gharama' },
  switchLanguage: { en: 'Switch to Kiswahili', sw: 'Badilisha kwa Kiingereza' }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string) => {
    if (!translations[key]) return key;
    return translations[key][language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
