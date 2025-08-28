// App.tsx - Updated with Language Support

import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import Tools from './pages/Tools';
import Auth from './pages/Auth';
import Sidebar from './components/Sidebar';
import BottomNavigation from './components/BottomNavigation';
import ExpenseModal from './components/ExpenseModal';
import Notification from './components/Notification';
import { useExpenses } from './hooks/useExpenses';
import { getApiUrl, isDevelopment, debugConfig } from './config';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

type Page = 'dashboard' | 'statistics' | 'tools' | 'settings';
type NotificationType = 'success' | 'error' | 'warning' | 'info';

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
  setupSkipped?: boolean;
  idToken?: string;
  metadata?: {
    creationTime: string;
    lastSignInTime: string;
  };
}

interface NotificationState {
  show: boolean;
  message: string;
  type: NotificationType;
}

// Main App Content Component
function AppContent() {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: '',
    type: 'info'
  });
  
  // Dark Mode State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  const expensesData = useExpenses(
    user?.email,
    user?.nickname || user?.name
  );

  // Apply dark mode
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Check if mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isDevelopment()) {
      console.log('🎯 App started - Debug info:');
      debugConfig();
    }
    
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    try {
      const savedUserData = localStorage.getItem('userData');
      const hasCompletedSetup = localStorage.getItem('hasCompletedSetup');
      
      if (savedUserData) {
        const userData = JSON.parse(savedUserData);
        console.log('📱 Found saved user data:', userData.email);
        
        if (userData.email) {
          if (hasCompletedSetup === 'true' || userData.isSetupComplete || userData.setupSkipped) {
            console.log('✅ User has completed setup, restoring session');
            
            // Try to get fresh data from backend
            try {
              const profileUrl = getApiUrl(`user/profile/${encodeURIComponent(userData.email)}`);
              
              const profileResponse = await fetch(profileUrl, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                }
              });

              if (profileResponse.ok) {
                const profileResult = await profileResponse.json();
                
                if (profileResult.success && profileResult.user) {
                  const mergedUser = {
                    ...userData,
                    ...profileResult.user,
                    idToken: userData.idToken
                  };
                  
                  setUser(mergedUser);
                  setIsAuthenticated(true);
                  localStorage.setItem('userData', JSON.stringify(mergedUser));
                } else {
                  setUser(userData);
                  setIsAuthenticated(true);
                }
              } else {
                setUser(userData);
                setIsAuthenticated(true);
              }
            } catch (error) {
              setUser(userData);
              setIsAuthenticated(true);
            }
          } else {
            localStorage.removeItem('userData');
            localStorage.removeItem('authToken');
          }
        } else {
          localStorage.removeItem('userData');
          localStorage.removeItem('authToken');
        }
      }
    } catch (error) {
      console.error('Auto-login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = (userData: User) => {
    if (userData.idToken) {
      localStorage.setItem('authToken', userData.idToken);
    }
    
    localStorage.setItem('userData', JSON.stringify(userData));
    
    if (userData.isSetupComplete || userData.setupSkipped) {
      localStorage.setItem('hasCompletedSetup', 'true');
    }
    
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('hasCompletedSetup');
    
    sessionStorage.clear();
    
    setUser(null);
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
  };

  const handleUserUpdate = async (updatedUser: User) => {
    try {
      const updateUrl = getApiUrl('user/profile');
      
      const updateResponse = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: updatedUser.email,
          nickname: updatedUser.nickname,
          monthlyBudget: updatedUser.monthlyBudget,
          purpose: updatedUser.purpose,
          categories: updatedUser.categories
        })
      });

      if (updateResponse.ok) {
        const updateResult = await updateResponse.json();
        
        const mergedUser = {
          ...updatedUser,
          ...updateResult.user,
          idToken: updatedUser.idToken
        };
        
        setUser(mergedUser);
        localStorage.setItem('userData', JSON.stringify(mergedUser));
      } else {
        setUser(updatedUser);
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      }
    } catch (error) {
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
    }
    
    if (updatedUser.isSetupComplete) {
      localStorage.setItem('hasCompletedSetup', 'true');
    }
  };

  const handleAddExpense = async (expense: any) => {
    const result = await expensesData.addExpense(expense);
    
    if (result.success) {
      setShowExpenseModal(false);
      showNotification(t.notifications.success.saved, 'success');
      setTimeout(() => {
        expensesData.refresh();
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

  const handleToolNavigate = (toolId: string) => {
    console.log('Navigating to tool:', toolId);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard {...expensesData} user={user} />;
      case 'statistics':
        return <Statistics {...expensesData} user={user} />;
      case 'tools':
        return <Tools user={user} expenses={expensesData.expenses} onNavigate={handleToolNavigate} />;
      case 'settings':
        return (
          <Settings 
            user={user}
            onLogout={handleLogout}
            onUserUpdate={handleUserUpdate}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        );
      default:
        return <Dashboard {...expensesData} user={user} />;
    }
  };

  // Show loading screen
  if (isLoading) {
    return (
      <div className={`loading-container ${darkMode ? 'dark' : ''}`}>
        <div className="loading-content">
          <div className="loading-logo">
            <i className="fas fa-wallet"></i>
          </div>
          <h2>{t.auth.welcomeTitle}</h2>
          <div className="loading-spinner"></div>
          <p>{t.common.loading}...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  // Show main app
  return (
    <div className="app-container">
      {/* Desktop Sidebar - Hidden on Mobile */}
      {!isMobile && (
        <div className="sidebar-wrapper">
          <Sidebar 
            currentPage={currentPage} 
            onPageChange={setCurrentPage}
            connectionStatus={expensesData.connectionStatus}
            user={user}
            onLogout={handleLogout}
          />
        </div>
      )}

      {/* Main Content */}
      <main className={`main-content ${isMobile ? 'mobile' : ''}`}>
        {renderPage()}
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <BottomNavigation 
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onAddExpense={() => setShowExpenseModal(true)}
        />
      )}

      {/* Expense Modal (for mobile add button) */}
      {showExpenseModal && (
        <ExpenseModal
          isOpen={showExpenseModal}
          onClose={() => setShowExpenseModal(false)}
          onSubmit={handleAddExpense}
          onAnalyzeReceipt={expensesData.analyzeReceipt}
          isBackendConnected={expensesData.connectionStatus === 'connected'}
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
}

// Main App Component with Language Provider
function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;