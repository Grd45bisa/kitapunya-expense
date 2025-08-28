// hooks/useExpenses.ts - Custom hook untuk expense management

import { useState, useEffect, useCallback } from 'react';
import { Expense, CategoryTotal, ConnectionStatus } from '../types/expense.types';
import apiService from '../services/api.service';
import { isDevelopment } from '../config';

export const useExpenses = (userEmail?: string, userName?: string) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal>({});
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [loading, setLoading] = useState(true);

  const calculateTotals = useCallback((expenseList: Expense[]) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyExpenses = expenseList.filter(expense => {
      const expenseDate = new Date(expense.tanggal);
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    });

    const total = monthlyExpenses.reduce((sum, expense) => sum + expense.total, 0);
    
    const categories: CategoryTotal = {};
    monthlyExpenses.forEach(expense => {
      categories[expense.kategori] = (categories[expense.kategori] || 0) + expense.total;
    });

    setMonthlyTotal(total);
    setCategoryTotals(categories);
    
    if (isDevelopment()) {
      console.log('📊 Calculated totals:', { total, categories, expenseCount: monthlyExpenses.length });
    }
  }, []);

  const loadData = useCallback(async () => {
    if (!userEmail) {
      console.log('⚠️ No user email provided, setting disconnected status');
      setConnectionStatus('disconnected');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setConnectionStatus('connecting');

      if (isDevelopment()) {
        console.log('🔄 Loading data for user:', userEmail);
      }

      // Test connection first
      const isHealthy = await apiService.checkHealth();
      if (!isHealthy) {
        throw new Error('Backend not available');
      }

      // Load expenses
      const expenseData = await apiService.getExpenses(userEmail, userName);
      setExpenses(expenseData);
      calculateTotals(expenseData);
      
      setConnectionStatus('connected');
      
      // Cache to localStorage for offline access
      localStorage.setItem(`expenses_${userEmail}`, JSON.stringify(expenseData));
      
      if (isDevelopment()) {
        console.log('✅ Data loaded successfully:', expenseData.length, 'expenses');
      }
      
    } catch (error) {
      console.error('❌ Failed to load data:', error);
      setConnectionStatus('disconnected');
      
      // Try to load from localStorage as fallback
      const cachedExpenses = localStorage.getItem(`expenses_${userEmail}`);
      if (cachedExpenses) {
        try {
          const parsedExpenses = JSON.parse(cachedExpenses);
          setExpenses(parsedExpenses);
          calculateTotals(parsedExpenses);
          console.log('📱 Using cached data:', parsedExpenses.length, 'expenses');
        } catch (parseError) {
          console.error('Failed to parse cached expenses:', parseError);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [userEmail, userName, calculateTotals]);

  const addExpense = useCallback(async (expense: Omit<Expense, 'id' | 'timestamp'>) => {
    try {
      if (!userEmail) {
        throw new Error('User email required');
      }

      if (isDevelopment()) {
        console.log('💾 Adding expense:', expense);
      }

      const expenseWithUser = {
        ...expense,
        userEmail,
        userName
      };

      const savedExpense = await apiService.saveExpense(expenseWithUser);
      
      // Update local state
      setExpenses(prev => {
        const updated = [savedExpense, ...prev];
        calculateTotals(updated);
        
        // Cache to localStorage
        localStorage.setItem(`expenses_${userEmail}`, JSON.stringify(updated));
        
        return updated;
      });

      if (isDevelopment()) {
        console.log('✅ Expense added successfully:', savedExpense.id);
      }

      return { success: true, expense: savedExpense };
    } catch (error) {
      console.error('❌ Failed to add expense:', error);
      return { success: false, error: error as Error };
    }
  }, [userEmail, userName, calculateTotals]);

  const analyzeReceipt = useCallback(async (photo: File) => {
    try {
      if (isDevelopment()) {
        console.log('🔍 Analyzing receipt:', photo.name);
      }
      
      const result = await apiService.analyzeReceipt(photo);
      
      if (isDevelopment()) {
        console.log('✅ Receipt analyzed:', result);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Failed to analyze receipt:', error);
      throw error;
    }
  }, []);

  const refresh = useCallback(() => {
    if (isDevelopment()) {
      console.log('🔄 Refreshing data...');
    }
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Debug info
  if (isDevelopment()) {
    console.log('🪝 useExpenses hook state:', {
      userEmail,
      expenseCount: expenses.length,
      monthlyTotal,
      connectionStatus,
      loading
    });
  }

  return {
    expenses,
    categoryTotals,
    monthlyTotal,
    connectionStatus,
    loading,
    addExpense,
    analyzeReceipt,
    refresh
  };
};