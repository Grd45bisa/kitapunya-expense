// pages/Dashboard.tsx - Complete with Language Support
import React, { useState } from 'react';
import Header from '../components/Header';
import CategoryGrid from '../components/CategoryGrid';
import TransactionList from '../components/TransactionList';
import ExpenseModal from '../components/ExpenseModal';
import FloatingActionButton from '../components/FloatingActionButton';
import Notification from '../components/Notification';
import { useLanguage } from '../contexts/LanguageContext';
import { Expense, CategoryTotal, ConnectionStatus, NotificationType } from '../types/expense.types';
import styles from './styles/Dashboard.module.css';

interface User {
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
}

interface DashboardProps {
  user: User | null;
  expenses: Expense[];
  categoryTotals: CategoryTotal;
  monthlyTotal: number;
  connectionStatus: ConnectionStatus;
  loading: boolean;
  addExpense: (expense: Omit<Expense, 'id' | 'timestamp'>) => Promise<{ success: boolean; expense?: Expense; error?: Error }>;
  analyzeReceipt: (photo: File) => Promise<any>;
  refresh: () => void;
}

interface NotificationState {
  show: boolean;
  message: string;
  type: NotificationType;
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  expenses,
  categoryTotals,
  monthlyTotal,
  connectionStatus,
  loading,
  addExpense,
  analyzeReceipt,
  refresh
}) => {
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: '',
    type: 'info'
  });

  const handleAddExpense = async (expense: Omit<Expense, 'id' | 'timestamp'>) => {
    const result = await addExpense(expense);
    
    if (result.success) {
      setShowModal(false);
      showNotification(t.notifications.success.saved, 'success');
      setTimeout(() => {
        refresh();
      }, 500);
    } else {
      showNotification(t.notifications.error.saveFailed, 'error');
    }
  };

  const showNotification = (message: string, type: NotificationType) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Calculate quick stats
  const todayExpenses = expenses.filter(exp => {
    const today = new Date().toDateString();
    return new Date(exp.tanggal).toDateString() === today;
  });

  const todayTotal = todayExpenses.reduce((sum, exp) => sum + exp.total, 0);
  const remainingBudget = user?.monthlyBudget 
    ? parseInt(user.monthlyBudget) - monthlyTotal 
    : 0;

  // Get recent transactions (last 10)
  const recentTransactions = [...expenses]
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
    .slice(0, 10);

  return (
    <div className={styles.dashboard}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <Header 
          monthlyTotal={monthlyTotal}
          userName={user?.nickname || user?.name || 'User'}
          userPicture={user?.picture}
          todayTotal={todayTotal}
          remainingBudget={remainingBudget}
          monthlyBudget={user?.monthlyBudget ? parseInt(user.monthlyBudget) : 0}
        />
      </div>
      

      
      {/* Categories Section */}
      <section className={styles.categoriesSection}>
        <div className={styles.sectionHeader}>
          <h2>
            <i className="fas fa-layer-group"></i>
            {t.dashboard.categories}
          </h2>
          <span className={styles.sectionSubtitle}>
            {t.dashboard.categoryBreakdown}
          </span>
        </div>
        <CategoryGrid categoryTotals={categoryTotals} />
      </section>
      
      {/* Transactions Section */}
      <section className={styles.transactionsSection}>
        <div className={styles.sectionHeader}>
          <h2>
            <i className="fas fa-history"></i>
            {t.dashboard.recentTransactions}
          </h2>
          <button 
            className={styles.refreshButton}
            onClick={refresh}
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span>{t.common.loading}...</span>
              </>
            ) : (
              <>
                <i className="fas fa-sync-alt"></i>
                <span>{t.common.refresh}</span>
              </>
            )}
          </button>
        </div>
        
        <TransactionList 
          expenses={recentTransactions}
          loading={loading}
        />
        
        {expenses.length > 10 && (
          <div className={styles.viewAllContainer}>
            <button className={styles.viewAllButton}>
              {t.dashboard.viewAllTransactions}
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        )}
      </section>
      
      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => setShowModal(true)} />
      
      {/* Expense Modal */}
      {showModal && (
        <ExpenseModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleAddExpense}
          onAnalyzeReceipt={analyzeReceipt}
          isBackendConnected={connectionStatus === 'connected'}
        />
      )}
      
      {/* Notification */}
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        />
      )}
    </div>
  );
};

export default Dashboard;