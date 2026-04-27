/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db, serverTimestamp } from './lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import TransactionsPage from './pages/Transactions';
import DebtsPage from './pages/Debts';
import InventoryPage from './pages/Inventory';
import Pricing from './pages/Pricing';
import LoginPage from './pages/Login';
import MarketingPage from './pages/Marketing';
import SuppliersPage from './pages/Suppliers';
import SavingsPage from './pages/Savings';
import SettingsPage from './pages/Settings';
import Onboarding from './components/Onboarding';
import Navigation from './components/Navigation';
import { UserProfile } from './types';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { LanguageProvider } from './lib/LanguageContext';
import { ThemeProvider } from './lib/ThemeContext';
import Header from './components/Header';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState<'landing' | 'dashboard' | 'transactions' | 'debts' | 'inventory' | 'pricing' | 'login' | 'marketing' | 'suppliers' | 'savings' | 'settings'>('landing');

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch or create profile
        const profileRef = doc(db, 'users', firebaseUser.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          setProfile(profileSnap.data() as UserProfile);
        } else {
          const newProfile: any = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            businessName: '',
            createdAt: serverTimestamp(),
            isPremium: false,
            onboarded: false
          };
          await setDoc(profileRef, newProfile);
          // For the local state, we'll use a local timestamp placeholder or just wait for the doc
          setProfile({
            ...newProfile,
            createdAt: new Date()
          });
        }
        
        if (currentPage === 'landing' || currentPage === 'login') {
          setCurrentPage('dashboard');
        }
      } else {
        setProfile(null);
        if (currentPage !== 'pricing') {
          setCurrentPage('landing');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  const navigate = (page: typeof currentPage) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
    // On mobile, close sidebar after navigation
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const Layout = ({ children, activePage, title }: { children: React.ReactNode, activePage: string, title: string }) => (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Navigation 
        onNavigate={navigate} 
        activePage={activePage} 
        profile={profile} 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar}
      />
      <motion.div 
        layout
        transition={{ type: 'spring', damping: 30, stiffness: 80 }}
        className={`flex-1 flex flex-col min-w-0 ${isSidebarOpen ? 'lg:ml-64' : 'ml-0'}`}
      >
        <Header onNavigate={navigate} toggleSidebar={toggleSidebar} title={title} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </motion.div>
    </div>
  );

  const renderPage = () => {
    if (user && profile && profile.onboarded === false) {
      return <Onboarding profile={profile} onComplete={setProfile} />;
    }

    switch (currentPage) {
      case 'landing':
        return <Landing onNavigate={navigate} />;
      case 'dashboard':
        return user ? (
          <Layout activePage="dashboard" title="Dashboard">
            <Dashboard onNavigate={navigate} profile={profile} />
          </Layout>
        ) : <Landing onNavigate={navigate} />;
      case 'transactions':
        return user ? (
          <Layout activePage="transactions" title="Transactions">
            <TransactionsPage onNavigate={navigate} profile={profile} />
          </Layout>
        ) : <LoginPage onNavigate={navigate} />;
      case 'debts':
        return user ? (
          <Layout activePage="debts" title="Debt Tracker">
            <DebtsPage onNavigate={navigate} profile={profile} />
          </Layout>
        ) : <LoginPage onNavigate={navigate} />;
      case 'inventory':
        return user ? (
          <Layout activePage="inventory" title="Inventory">
            <InventoryPage onNavigate={navigate} profile={profile} />
          </Layout>
        ) : <LoginPage onNavigate={navigate} />;
      case 'pricing':
        return user ? (
          <Layout activePage="pricing" title="Pricing & Upgrade">
            <Pricing onNavigate={navigate} user={user} profile={profile} />
          </Layout>
        ) : <Pricing onNavigate={navigate} user={user} profile={profile} />;
      case 'marketing':
        return user ? (
          <Layout activePage="marketing" title="Marketing">
            <MarketingPage profile={profile} />
          </Layout>
        ) : <LoginPage onNavigate={navigate} />;
      case 'suppliers':
        return user ? (
          <Layout activePage="suppliers" title="Suppliers">
            <SuppliersPage profile={profile} />
          </Layout>
        ) : <LoginPage onNavigate={navigate} />;
      case 'savings':
        return user ? (
          <Layout activePage="savings" title="Savings & SACCO">
            <SavingsPage profile={profile} />
          </Layout>
        ) : <LoginPage onNavigate={navigate} />;
      case 'settings':
        return user ? (
          <Layout activePage="settings" title="Settings">
            <SettingsPage profile={profile} />
          </Layout>
        ) : <LoginPage onNavigate={navigate} />;
      case 'login':
        return <LoginPage onNavigate={navigate} />;
      default:
        return <Landing onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen font-sans text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 selection:bg-emerald-100">
      {renderPage()}
    </div>
  );
}
