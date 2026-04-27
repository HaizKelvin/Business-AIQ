import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, Transaction, Debt, InventoryItem } from '../types';
import { TrendingUp, TrendingDown, Wallet, BrainCircuit, Edit2, Check, X, Loader2, Sparkles, BarChart3, Package, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getBusinessAdvice, getSalesPredictions } from '../services/geminiService';
import { motion } from 'framer-motion';
import AIChatbot from '../components/AIChatbot';
import { useLanguage } from '../lib/LanguageContext';

interface DashboardProps {
  onNavigate: (page: any) => void;
  profile: UserProfile | null;
}

export default function Dashboard({ onNavigate, profile }: DashboardProps) {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<string>("");
  const [prediction, setPrediction] = useState<any>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(profile?.businessName || "");

  useEffect(() => {
    if (!profile) return;

    const q = query(
      collection(db, 'users', profile.uid, 'transactions'),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    const unsubscribeTransactions = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${profile.uid}/transactions`);
    });

    const unsubscribeDebts = onSnapshot(query(collection(db, 'users', profile.uid, 'debts')), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Debt));
      setDebts(data);
    });

    const unsubscribeInventory = onSnapshot(query(collection(db, 'users', profile.uid, 'inventory')), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
      setInventory(data);
    });

    return () => {
      unsubscribeTransactions();
      unsubscribeDebts();
      unsubscribeInventory();
    };
  }, [profile]);

  const handleUpdateBusinessName = async () => {
    if (!profile) return;
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        businessName: newName,
        updatedAt: serverTimestamp()
      });
      setEditingName(false);
    } catch (error) {
      console.error(error);
    }
  };

  const runInsights = async () => {
    if (!profile || transactions.length === 0) return;
    setIsGeneratingInsights(true);
    try {
      const result = await getBusinessAdvice({
        businessName: profile.businessName || "My Business",
        recentTransactions: transactions,
        inventory: inventory,
        debts: debts
      });
      setInsights(result);
      
      const pred = await getSalesPredictions(transactions);
      setPrediction(pred);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const stats = {
    sales: transactions.filter(t => t.type === 'sale').reduce((acc, t) => acc + t.amount, 0),
    expenses: transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0),
  };
  const profit = stats.sales - stats.expenses;

  // Chart data: Group by date (last 7 days)
  const chartData = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toLocaleDateString('en-KE', { weekday: 'short' });
    const dayTransactions = transactions.filter(t => {
      const d = (t.timestamp as any).toDate ? (t.timestamp as any).toDate() : new Date(t.timestamp as any);
      return d.toDateString() === date.toDateString();
    });
    return {
      name: dateStr,
      sales: dayTransactions.filter(t => t.type === 'sale').reduce((acc, t) => acc + t.amount, 0),
      expenses: dayTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0),
    };
  });

  const totalOwedToMe = debts.filter(d => d.type === 'to_me' && d.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);
  const lowStockItems = inventory.filter(i => i.quantity <= (i.minThreshold || 0)).length;

  return (
    <div className="flex flex-col gap-6">
      {/* AI Chatbot */}
      {profile && (
        <AIChatbot 
          profile={profile} 
          transactions={transactions} 
          inventory={inventory} 
          debts={debts} 
        />
      )}

      {/* Header Info */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-6 -mx-8 -mt-8 mb-4 flex items-center justify-between sticky top-0 z-30 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              {t('welcome')}, {profile?.businessName || "Boss"}
            </h2>
            {profile?.isPremium && (
              <div className="flex items-center gap-1.5 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black text-green-700 uppercase tracking-wider font-mono">Premium Active</span>
              </div>
            )}
          </div>
          <p className="text-sm text-slate-500 font-medium">{new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={() => onNavigate('transactions')}
            className="btn-pro py-2.5 px-6 shadow-emerald-200/50 shadow-md"
          >
            {t('addRecord')}
          </button>
        </div>
      </header>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-premium">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('totalSales')}</p>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">KSh {stats.sales.toLocaleString()}</p>
        </div>

        <div className="card-premium">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('netProfit')}</p>
            <Wallet className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">KSh {profit.toLocaleString()}</p>
        </div>

        <div className="card-premium">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Pending Dues</p>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">KSh {totalOwedToMe.toLocaleString()}</p>
        </div>

        <div className="card-premium">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Stock Alerts</p>
            <Package className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{lowStockItems} <span className="text-xs font-bold text-slate-400">Items Low</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Weekly Trend Chart */}
        <div className="lg:col-span-3 card-premium">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              Weekly Sales Trend
            </h3>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Last 7 Days</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold'}}
                  cursor={{stroke: '#10b981', strokeWidth: 1}}
                />
                <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights Sidebar */}
        <div className="lg:col-span-2 bg-[#f8fafc] dark:bg-slate-800/50 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 shadow-inner flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <BrainCircuit className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-black text-emerald-900 dark:text-emerald-400 uppercase text-[10px] tracking-widest">AI Business Advisor</h3>
          </div>

          {!profile?.isPremium ? (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <Sparkles className="w-10 h-10 text-emerald-200 dark:text-emerald-800 mb-4" />
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">Deep Insights Locked</h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-6">Upgrade to Premium to let Biashara Smart analyze your trends and suggest improvements.</p>
              <button 
                onClick={() => onNavigate('pricing')}
                className="btn-pro text-xs w-full py-3"
              >
                UNLOOCK NOW
              </button>
            </div>
          ) : (
            <div className="flex flex-col h-full gap-4">
              {insights ? (
                <div className="flex-1 overflow-y-auto space-y-4 max-h-[300px] pr-2 custom-scrollbar">
                  {insights.split('\n').filter(line => line.trim()).map((line, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 bg-white dark:bg-slate-800 rounded-xl border-l-4 border-emerald-500 shadow-sm"
                    >
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">{line}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center opacity-40 py-12">
                   <p className="text-xs font-semibold italic">No data analyzed yet. Click below.</p>
                </div>
              )}
              
              <button
                onClick={runInsights}
                disabled={isGeneratingInsights}
                className="w-full bg-emerald-50 text-emerald-600 border border-emerald-200 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider hover:bg-emerald-100 transition-colors disabled:opacity-50"
              >
                {isGeneratingInsights ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                {insights ? "Refine Analysis" : "Generate Report"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
