// components/TransactionList.tsx
import React from 'react';
import TransactionItem from './TransactionItem';
import LoadingSpinner from './LoadingSpinner';
import { useLanguage } from '../contexts/LanguageContext';
import type { Expense } from '../types/expense.types';
import styles from './styles/TransactionList.module.css';

interface TransactionListProps {
  expenses: Expense[];
  loading?: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({ expenses, loading }) => {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner />
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className={styles.emptyState}>
        <i className="fas fa-receipt" style={{ display: 'block', margin: '0 auto', fontSize: '2rem', textAlign: 'center' }}></i>
        <h3>{t.dashboard.noTransactions}</h3>
        <p>{t.dashboard.addFirstExpense}</p>
      </div>
    );
  }

  return (
    <div className={styles.transactionList}>
      {expenses.map(expense => (
        <TransactionItem key={expense.id} expense={expense} />
      ))}
    </div>
  );
};

export default TransactionList;