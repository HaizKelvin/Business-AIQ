import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  email: string;
  businessName?: string;
  createdAt: Timestamp | Date;
  isPremium: boolean;
  onboarded?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'sale' | 'expense';
  description: string;
  amount: number;
  category?: string;
  quantity?: number;
  timestamp: Timestamp | Date;
  rawInput?: string;
}

export interface Debt {
  id: string;
  userId: string;
  customerName: string;
  amount: number;
  type: 'to_me' | 'i_owe';
  status: 'pending' | 'cleared';
  dueDate?: Timestamp | Date;
  timestamp: Timestamp | Date;
}

export interface InventoryItem {
  id: string;
  userId: string;
  name: string;
  sku?: string;
  quantity: number;
  price: number;
  category?: string;
  minThreshold?: number;
  timestamp: Timestamp | Date;
}

export interface Insight {
  id: string;
  content: string;
  type: 'trend' | 'warning' | 'advice';
  createdAt: Timestamp | Date;
}

export interface PaymentRecord {
  id: string;
  checkoutRequestID: string;
  amount: number;
  phoneNumber: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Timestamp | Date;
}
