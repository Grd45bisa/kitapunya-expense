// types/component.types.ts - Updated interface definitions for components

import { Expense, CategoryTotal, ConnectionStatus } from './expense.types';

export interface User {
  uid: string;
  email: string;
  name: string;
  picture?: string;
  nickname?: string;
  purpose?: string;
  monthlyBudget?: string;
  categories?: string[];
  isSetupComplete?: boolean;
  idToken?: string;
  metadata?: {
    creationTime: string;
    lastSignInTime: string;
  };
}

export interface DashboardProps {
  user: User | null;
  expenses: Expense[];
  categoryTotals: CategoryTotal;
  monthlyTotal: number;
  connectionStatus: ConnectionStatus;
  loading: boolean;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  analyzeReceipt: (photo: File) => Promise<void>;
  refresh: () => void;
}

export interface StatisticsProps {
  user: User | null;
  expenses: Expense[];
  categoryTotals: CategoryTotal;
  monthlyTotal: number;
  connectionStatus: ConnectionStatus;
  loading: boolean;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  analyzeReceipt: (photo: File) => Promise<void>;
  refresh: () => void;
}

export interface SettingsProps {
  user: User | null;
  onLogout: () => void;
  onUserUpdate: (user: User) => void; // Changed from User | null to User
}

export interface GoogleSignInButtonProps {
  onSuccess: (userData: any) => void;
  onError: (error: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export interface WelcomeSetupProps {
  userInfo: any;
  onComplete: (setupData: any) => void;
  onSkip: () => void;
}