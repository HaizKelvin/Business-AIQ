import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, Transaction } from '../types';
import { Search, Plus, Trash2, ArrowUpRight, ArrowDownRight, BrainCircuit, Loader2, Calendar, FileDown, X } from 'lucide-react';
import { parseSalesInput, parseMpesaSms } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../lib/LanguageContext';

interface TransactionsPageProps {
  onNavigate: (page: any) => void;
  profile: UserProfile | null;
}

export default function TransactionsPage({ onNavigate, profile }: TransactionsPageProps) {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInput, setAiInput] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState("");
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [mpesaSms, setMpesaSms] = useState("");

  useEffect(() => {
    if (!profile) return;

    const q = query(
      collection(db, 'users', profile.uid, 'transactions'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${profile.uid}/transactions`);
    });

    return () => unsubscribe();
  }, [profile]);

  const handleAiLogging = async (e: FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || !profile) return;

    setIsParsing(true);
    setError("");
    try {
      const parsed = await parseSalesInput(aiInput);
      if (parsed && parsed.transactions && parsed.transactions.length > 0) {
        for (const t of parsed.transactions) {
          await addDoc(collection(db, 'users', profile.uid, 'transactions'), {
            type: t.type,
            description: t.item,
            amount: t.total || (t.quantity * t.unit_price),
            quantity: t.quantity,
            userId: profile.uid,
            timestamp: serverTimestamp(),
            rawInput: aiInput
          });
        }
        setAiInput("");
      } else {
        setError("AI couldn't understand that. Try being more specific.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleMpesaParse = async () => {
    if (!mpesaSms.trim() || !profile) return;
    setIsParsing(true);
    try {
      const parsed = await parseMpesaSms(mpesaSms);
      if (parsed && parsed.isMpesa) {
        await addDoc(collection(db, 'users', profile.uid, 'transactions'), {
          type: parsed.type === 'income' ? 'sale' : 'expense',
          description: `M-Pesa: ${parsed.party} (${parsed.code})`,
          amount: parsed.amount,
          userId: profile.uid,
          timestamp: serverTimestamp(),
          rawInput: mpesaSms
        });
        setMpesaSms("");
        setShowMpesaModal(false);
      } else {
        setError("This doesn't look like a valid M-Pesa business message.");
      }
    } catch (err) {
      console.error(err);
      setError("Error parsing M-Pesa SMS.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!profile) return;
    try {
      await deleteDoc(doc(db, 'users', profile.uid, 'transactions', id));
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (ts: any) => {
    const date = ts?.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Description', 'Amount', 'Category', 'Quantity'];
    const rows = transactions.map(t => [
      formatDate(t.timestamp),
      t.type,
      t.description,
      t.amount,
      t.category || '',
      t.quantity || ''
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `biashara_smart_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto dark:text-white">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Activity Log</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Manage and review your daily business entries</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowMpesaModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
          >
            <BrainCircuit className="w-4 h-4" />
            Paste M-Pesa SMS
          </button>
          {profile?.isPremium && (
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <FileDown className="w-4 h-4" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* M-Pesa Modal */}
      <AnimatePresence>
        {showMpesaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-6 bg-emerald-600 text-white flex justify-between items-center">
                <h3 className="font-bold">M-Pesa SMS Parser</h3>
                <button onClick={() => setShowMpesaModal(false)}><X className="w-6 h-6" /></button>
              </div>
              <div className="p-6">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium uppercase tracking-wider">Paste your M-Pesa message below to auto-log</p>
                <textarea 
                  value={mpesaSms}
                  onChange={(e) => setMpesaSms(e.target.value)}
                  className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 mb-4 dark:text-white"
                  placeholder="E.g. RK9823JJ Confirmed. You have received KSh2,000.00 from..."
                />
                <button 
                  onClick={handleMpesaParse}
                  disabled={isParsing || !mpesaSms.trim()}
                  className="w-full btn-pro py-4 bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-2"
                >
                  {isParsing && <Loader2 className="w-4 h-4 animate-spin" />}
                  PARSE & LOG INCOME/EXPENSE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Search/Input Bar */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border-2 border-blue-100 dark:border-blue-900/30 shadow-sm transition-all">
        <label className="text-[10px] font-black text-blue-600 dark:text-blue-400 mb-2 block uppercase tracking-widest">Quick AI Entry</label>
        <form onSubmit={handleAiLogging} className="flex gap-4 sm:flex-row flex-col">
          <div className="flex-1 relative">
            <input 
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              disabled={isParsing}
              type="text" 
              placeholder="Example: 'Sold 5 bags of cement at 850 each'" 
              className="input-pro dark:bg-slate-900 dark:border-slate-700 dark:text-white"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600">
              {isParsing ? <Loader2 className="w-5 h-5 animate-spin text-blue-500" /> : <BrainCircuit className="w-5 h-5" />}
            </div>
          </div>
          <button 
            type="submit"
            disabled={isParsing || !aiInput.trim()}
            className="btn-pro px-6 shadow-md shadow-blue-200/50 dark:shadow-none"
          >
            ADD RECORD
          </button>
        </form>
        {error && <p className="mt-2 text-[10px] text-red-500 font-bold uppercase tracking-wide px-1">{error}</p>}
        <p className="mt-3 text-[10px] text-slate-400 dark:text-slate-500 font-medium italic">Biashara Smart AI handles currency conversion and categorization automatically.</p>
      </div>

      {/* List */}
      <div className="card-premium p-0 overflow-hidden dark:border-slate-800">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm italic">Recent Transactions</h3>
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{transactions.length} Total</span>
        </div>
        
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <AnimatePresence initial={false}>
            {transactions.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group flex items-center justify-between p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    t.type === 'sale' ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  }`}>
                    {t.type === 'sale' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{t.description}</h4>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-500 font-medium">
                      <span>{formatDate(t.timestamp)}</span>
                      {t.category && <span className="text-blue-500 dark:text-blue-400 underline font-black uppercase tracking-tighter">#{t.category}</span>}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className={`font-black text-sm tracking-tight ${t.type === 'sale' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'sale' ? '+' : '-'} {t.amount.toLocaleString()} <span className="text-[10px]">KES</span>
                    </p>
                    {t.quantity && <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Qty: {t.quantity}</p>}
                  </div>
                  <button 
                    onClick={() => handleDelete(t.id)}
                    className="p-2 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {transactions.length === 0 && !loading && (
            <div className="p-20 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                <Search className="w-8 h-8" />
              </div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest italic">No activity detected yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
