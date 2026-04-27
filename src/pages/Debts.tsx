import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, Debt } from '../types';
import { Search, Plus, Trash2, Wallet, CheckCircle2, Circle, Clock, Loader2, User, ArrowRightLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../lib/LanguageContext';

interface DebtsProps {
  onNavigate: (page: any) => void;
  profile: UserProfile | null;
}

export default function DebtsPage({ onNavigate, profile }: DebtsProps) {
  const { t } = useLanguage();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newDebt, setNewDebt] = useState({ customerName: '', amount: 0, type: 'to_me' as 'to_me' | 'i_owe' });

  useEffect(() => {
    if (!profile) return;

    const q = query(
      collection(db, 'users', profile.uid, 'debts'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const debtsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Debt[];
      setDebts(debtsList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${profile.uid}/debts`);
    });

    return () => unsubscribe();
  }, [profile]);

  const handleAddDebt = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      await addDoc(collection(db, 'users', profile.uid, 'debts'), {
        userId: profile.uid,
        ...newDebt,
        status: 'pending',
        timestamp: serverTimestamp()
      });
      setNewDebt({ customerName: '', amount: 0, type: 'to_me' });
      setIsAdding(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${profile.uid}/debts`);
    }
  };

  const handleToggleStatus = async (debt: Debt) => {
    if (!profile) return;
    try {
      await updateDoc(doc(db, 'users', profile.uid, 'debts', debt.id), {
        status: debt.status === 'pending' ? 'cleared' : 'pending',
        timestamp: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${profile.uid}/debts/${debt.id}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!profile) return;
    try {
      await deleteDoc(doc(db, 'users', profile.uid, 'debts', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${profile.uid}/debts/${id}`);
    }
  };

  const totalOwedToMe = debts.filter(d => d.type === 'to_me' && d.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);
  const totalIOwe = debts.filter(d => d.type === 'i_owe' && d.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Debt Tracker</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Keep track of credits and pending payments</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="btn-pro py-2.5 px-6 shadow-emerald-200/50 shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Log New Debt
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-premium border-green-100 dark:border-green-900/30 bg-green-50/20 dark:bg-green-900/10 transition-colors">
          <p className="text-[10px] font-black text-green-600 dark:text-green-500 uppercase tracking-widest mb-1">Customers Owe You</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">KSh {totalOwedToMe.toLocaleString()}</p>
        </div>
        <div className="card-premium border-red-100 dark:border-red-900/30 bg-red-50/20 dark:bg-red-900/10 transition-colors">
          <p className="text-[10px] font-black text-red-600 dark:text-red-500 uppercase tracking-widest mb-1">You Owe Suppliers</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">KSh {totalIOwe.toLocaleString()}</p>
        </div>
      </div>

      {/* Debt List */}
      <div className="card-premium p-0 overflow-hidden dark:border-slate-800">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm italic">Pending & Cleared Debts</h3>
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{debts.length} Records</span>
        </div>
        
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <AnimatePresence>
            {debts.map((debt) => (
              <motion.div
                key={debt.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`group flex items-center justify-between p-5 transition-colors ${debt.status === 'cleared' ? 'bg-slate-50/40 dark:bg-slate-900/20 opacity-60' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
              >
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleToggleStatus(debt)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      debt.status === 'cleared' ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                    }`}
                  >
                    {debt.status === 'cleared' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </button>
                  <div>
                    <h4 className={`font-bold text-sm tracking-tight ${debt.status === 'cleared' ? 'line-through text-slate-400 dark:text-slate-600' : 'text-slate-800 dark:text-slate-200'}`}>
                      {debt.customerName}
                    </h4>
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
                      <span className={`px-2 py-0.5 rounded-full ${debt.type === 'to_me' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'}`}>
                        {debt.type === 'to_me' ? 'Receivable' : 'Payable'}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(debt.timestamp instanceof Date ? debt.timestamp : (debt.timestamp as any).toDate()).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className={`font-black text-sm tracking-tight ${debt.status === 'cleared' ? 'text-slate-400 dark:text-slate-600' : (debt.type === 'to_me' ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400')}`}>
                      KSh {debt.amount.toLocaleString()}
                    </p>
                    <p className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">{debt.status.toUpperCase()}</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(debt.id)}
                    className="p-2 text-slate-200 dark:text-slate-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {debts.length === 0 && !loading && !isAdding && (
            <div className="p-20 text-center flex flex-col items-center">
              <ArrowRightLeft className="w-16 h-16 text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest italic tracking-wider">No debt records found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Debt Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">Log New Debt</h2>
              <form onSubmit={handleAddDebt} className="space-y-4">
                <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl mb-4">
                  <button 
                    type="button" 
                    onClick={() => setNewDebt({...newDebt, type: 'to_me'})}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${newDebt.type === 'to_me' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm' : 'text-slate-400 dark:text-slate-600'}`}
                  >
                    Customer Owes Me
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setNewDebt({...newDebt, type: 'i_owe'})}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${newDebt.type === 'i_owe' ? 'bg-white dark:bg-slate-800 text-amber-600 shadow-sm' : 'text-slate-400 dark:text-slate-600'}`}
                  >
                    I Owe Supplier
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-2">Party Name</label>
                  <input 
                    required
                    autoFocus
                    value={newDebt.customerName}
                    onChange={(e) => setNewDebt({...newDebt, customerName: e.target.value})}
                    placeholder="e.g. John Doe or Supplier X"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-2">Amount (KSh)</label>
                  <input 
                    required
                    type="number"
                    value={newDebt.amount}
                    onChange={(e) => setNewDebt({...newDebt, amount: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all dark:text-white"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-3 border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                  >
                    Log Record
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
