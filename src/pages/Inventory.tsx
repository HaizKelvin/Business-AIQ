import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, InventoryItem } from '../types';
import { Search, Plus, Trash2, Package, Edit2, Check, X, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../lib/LanguageContext';

interface InventoryProps {
  onNavigate: (page: any) => void;
  profile: UserProfile | null;
}

export default function InventoryPage({ onNavigate, profile }: InventoryProps) {
  const { t } = useLanguage();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', quantity: 0, price: 0, minThreshold: 5 });

  useEffect(() => {
    if (!profile) return;

    const q = query(
      collection(db, 'users', profile.uid, 'inventory'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InventoryItem[];
      setItems(itemsList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${profile.uid}/inventory`);
    });

    return () => unsubscribe();
  }, [profile]);

  const handleAddItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      await addDoc(collection(db, 'users', profile.uid, 'inventory'), {
        userId: profile.uid,
        ...newItem,
        timestamp: serverTimestamp()
      });
      setNewItem({ name: '', quantity: 0, price: 0, minThreshold: 5 });
      setIsAdding(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${profile.uid}/inventory`);
    }
  };

  const handleUpdateStock = async (id: string, newQty: number) => {
    if (!profile) return;
    try {
      await updateDoc(doc(db, 'users', profile.uid, 'inventory', id), {
        quantity: newQty,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${profile.uid}/inventory/${id}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!profile) return;
    try {
      await deleteDoc(doc(db, 'users', profile.uid, 'inventory', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${profile.uid}/inventory/${id}`);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Stock Manager</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Track your products and inventory levels</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="btn-pro py-2.5 px-6 shadow-emerald-200/50 shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Grid of items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`card-premium flex flex-col justify-between ${item.quantity <= (item.minThreshold || 0) ? 'border-amber-200 bg-amber-50/10' : ''}`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.quantity <= (item.minThreshold || 0) ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    <Package className="w-5 h-5" />
                  </div>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-1">{item.name}</h3>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">KSh {item.price.toLocaleString()} / Unit</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Stock</span>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleUpdateStock(item.id, Math.max(0, item.quantity - 1))}
                        className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors shadow-sm"
                      >
                        -
                      </button>
                      <span className={`text-sm font-black ${item.quantity <= (item.minThreshold || 0) ? 'text-amber-600' : 'text-slate-900'}`}>
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => handleUpdateStock(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors shadow-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  {item.quantity <= (item.minThreshold || 0) && (
                    <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-100 rounded-lg text-amber-700">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Low Stock Alert</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {items.length === 0 && !loading && !isAdding && (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center">
            <Package className="w-12 h-12 text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No products tracked yet</p>
            <button onClick={() => setIsAdding(true)} className="text-blue-500 font-bold text-xs underline mt-2 uppercase tracking-widest">Add your first product</button>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
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
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">Add New Product</h2>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-2">Product Name</label>
                  <input 
                    required
                    autoFocus
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    placeholder="e.g. Cement (Bamburi)"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-2">Initial Qty</label>
                    <input 
                      required
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-2">Unit Price (KSh)</label>
                    <input 
                      required
                      type="number"
                      value={newItem.price}
                      onChange={(e) => setNewItem({...newItem, price: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-2">Low Stock Alert at</label>
                  <input 
                    required
                    type="number"
                    value={newItem.minThreshold}
                    onChange={(e) => setNewItem({...newItem, minThreshold: parseInt(e.target.value) || 0})}
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
                    Add Product
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
