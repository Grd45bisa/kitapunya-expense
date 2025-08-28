// pages/Auth.tsx - Enhanced with Language Support and Better UX

import { useState, useEffect } from 'react';
import GoogleSignInButton from '../components/GoogleSignInButton';
import WelcomeSetup from '../components/WelcomeSetup';
import Notification from '../components/Notification';
import { getApiUrl, isDevelopment } from '../config';
import { useLanguage } from '../contexts/LanguageContext';
import { NotificationType } from '../types/expense.types';
import styles from './styles/Auth.module.css';

interface AuthProps {
  onAuthSuccess: (userData: any) => void;
}

interface NotificationState {
  show: boolean;
  message: string;
  type: NotificationType;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcomeSetup, setShowWelcomeSetup] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: '',
    type: 'info'
  });

  const showNotification = (message: string, type: NotificationType) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleGoogleSignIn = async (userData: any) => {
    console.log('🔒 Auth: Google sign-in successful', userData);
    
    try {
      // Register user (auto-creates spreadsheet if new)
      const registerUrl = getApiUrl('user/register');
      console.log('📤 Registering user at:', registerUrl);
      
      const registerResponse = await fetch(registerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: userData.uid,
          email: userData.email,
          name: userData.name,
          picture: userData.picture
        })
      });

      if (!registerResponse.ok) throw new Error('Failed to register user');

      const registerResult = await registerResponse.json();
      const completeUserData = { ...userData, ...registerResult.user, idToken: userData.idToken };
      localStorage.setItem('userData', JSON.stringify(completeUserData));

      // Handle new user with auto-spreadsheet creation
      if (registerResult.isNew && !registerResult.user.isSetupComplete) {
        if (registerResult.autoCreated) {
          showNotification(t.notifications.success.setupComplete, 'success');
        }
        setUserInfo(completeUserData);
        setShowWelcomeSetup(true);
      } else {
        // Existing user
        if (!registerResult.user.isSetupComplete && !registerResult.isNew) {
          const setupUrl = getApiUrl('user/setup');
          fetch(setupUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: completeUserData.email,
              nickname: completeUserData.nickname || completeUserData.name,
              purpose: completeUserData.purpose || '',
              monthlyBudget: completeUserData.monthlyBudget || '',
              categories: completeUserData.categories || [],
              isSetupComplete: true
            })
          }).catch(err => console.log('Background setup update failed:', err));
        }
        
        localStorage.setItem('hasCompletedSetup', 'true');
        showNotification(t.notifications.success.loginSuccess, 'success');
        setTimeout(() => onAuthSuccess(completeUserData), 1500);
      }

    } catch (error) {
      console.error('❌ User registration error:', error);
      
      // Fallback to local storage
      const existingUserData = localStorage.getItem('userData');
      if (existingUserData) {
        const savedUser = JSON.parse(existingUserData);
        if (savedUser.email === userData.email) {
          const mergedData = { ...userData, ...savedUser, idToken: userData.idToken };
          showNotification(t.notifications.success.loginSuccess, 'success');
          setTimeout(() => onAuthSuccess(mergedData), 1500);
          return;
        }
      }
      
      // Check known users
      const allUsersData = localStorage.getItem('knownUsers');
      const knownUsers = allUsersData ? JSON.parse(allUsersData) : [];
      
      if (knownUsers.includes(userData.email)) {
        const basicUserData = { ...userData, isSetupComplete: true, nickname: userData.name };
        localStorage.setItem('userData', JSON.stringify(basicUserData));
        localStorage.setItem('hasCompletedSetup', 'true');
        showNotification(t.notifications.success.loginSuccess, 'success');
        setTimeout(() => onAuthSuccess(basicUserData), 1500);
      } else {
        // New user offline mode
        knownUsers.push(userData.email);
        localStorage.setItem('knownUsers', JSON.stringify(knownUsers));
        showNotification(t.notifications.warning.offlineMode, 'warning');
        setUserInfo(userData);
        setShowWelcomeSetup(true);
      }
    }
  };

  const handleSetupComplete = async (setupData: any) => {
    try {
      const setupUrl = getApiUrl('user/setup');
      console.log('⚙️ Completing setup at:', setupUrl);
      
      const setupResponse = await fetch(setupUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userInfo.email,
          nickname: setupData.nickname,
          purpose: setupData.purpose,
          monthlyBudget: setupData.monthlyBudget,
          categories: setupData.categories
        })
      });

      if (setupResponse.ok) {
        const setupResult = await setupResponse.json();
        const completeUserData = { ...userInfo, ...setupResult.user, idToken: userInfo.idToken };
        localStorage.setItem('userData', JSON.stringify(completeUserData));
        localStorage.setItem('hasCompletedSetup', 'true');
        
        const allUsersData = localStorage.getItem('knownUsers');
        const knownUsers = allUsersData ? JSON.parse(allUsersData) : [];
        if (!knownUsers.includes(userInfo.email)) {
          knownUsers.push(userInfo.email);
          localStorage.setItem('knownUsers', JSON.stringify(knownUsers));
        }
        
        showNotification(t.notifications.success.setupComplete, 'success');
        setTimeout(() => onAuthSuccess(completeUserData), 1500);
        return;
      }
    } catch (error) {
      console.error('❌ Setup save error:', error);
    }
    
    // Offline mode
    const userData = { ...userInfo, ...setupData, isSetupComplete: true };
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('hasCompletedSetup', 'true');
    
    const allUsersData = localStorage.getItem('knownUsers');
    const knownUsers = allUsersData ? JSON.parse(allUsersData) : [];
    if (!knownUsers.includes(userInfo.email)) {
      knownUsers.push(userInfo.email);
      localStorage.setItem('knownUsers', JSON.stringify(knownUsers));
    }
    
    showNotification(t.notifications.warning.offlineMode, 'warning');
    setTimeout(() => onAuthSuccess(userData), 1500);
  };

  const handleSetupSkip = async () => {
    try {
      const setupUrl = getApiUrl('user/setup');
      console.log('⭐ Skipping setup at:', setupUrl);
      
      const setupResponse = await fetch(setupUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userInfo.email,
          nickname: userInfo.name,
          purpose: '',
          monthlyBudget: '',
          categories: [],
          isSetupComplete: true
        })
      });

      if (setupResponse.ok) {
        const setupResult = await setupResponse.json();
        const userData = { ...userInfo, ...setupResult.user, setupSkipped: true, idToken: userInfo.idToken };
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('hasCompletedSetup', 'true');
        showNotification(t.notifications.success.setupComplete, 'info');
        setTimeout(() => onAuthSuccess(userData), 1000);
        return;
      }
    } catch (error) {
      console.error('⚠️ Skip save error:', error);
    }
    
    // Offline mode
    const userData = { ...userInfo, isSetupComplete: true, setupSkipped: true };
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('hasCompletedSetup', 'true');
    showNotification(t.notifications.info.processing, 'info');
    setTimeout(() => onAuthSuccess(userData), 1000);
  };

  const handleSignInError = (error: string) => {
    console.error('❌ Auth: Sign-in error', error);
    setIsLoading(false);
    showNotification(t.notifications.error.loginFailed, 'error');
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('demo') === 'true') {
      console.log('🎭 Demo mode detected from URL');
    }
    
    // Debug config URLs in development
    if (isDevelopment()) {
      console.log('🔧 Auth API URLs:', {
        register: getApiUrl('user/register'),
        setup: getApiUrl('user/setup')
      });
    }
  }, []);

  if (showWelcomeSetup) {
    return (
      <WelcomeSetup
        userInfo={userInfo}
        onComplete={handleSetupComplete}
        onSkip={handleSetupSkip}
      />
    );
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.cardContent}>
          {/* Left Side - Brand & Features */}
          <div className={styles.leftSection}>
            <div className={styles.brandSection}>
              <div className={styles.logo}>
                <i className="fas fa-wallet"></i>
              </div>
              <h1 className={styles.brandTitle}>{t.auth.welcomeTitle}</h1>
              <p className={styles.brandSubtitle}>
                {t.auth.welcomeSubtitle}
              </p>
            </div>

            <div className={styles.featuresSection}>
              <div className={styles.featuresList}>
                <div className={styles.featureItem}>
                  <i className="fas fa-chart-pie"></i>
                  <span>{t.auth.features.realTimeAnalysis}</span>
                </div>
                <div className={styles.featureItem}>
                  <i className="fas fa-table"></i>
                  <span>{t.auth.features.autoSpreadsheet}</span>
                </div>
                <div className={styles.featureItem}>
                  <i className="fas fa-mobile-alt"></i>
                  <span>{t.auth.features.multiPlatform}</span>
                </div>
                <div className={styles.featureItem}>
                  <i className="fas fa-shield-alt"></i>
                  <span>{t.auth.features.secureData}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Sign In */}
          <div className={styles.rightSection}>
            <div className={styles.signInSection}>
              <h2>{t.auth.signInTitle}</h2>
              <GoogleSignInButton
                onSuccess={handleGoogleSignIn}
                onError={handleSignInError}
                loading={isLoading}
                setLoading={setIsLoading}
              />
              
              <div className={styles.securityNote}>
                <i className="fas fa-lock"></i>
                <span>{t.auth.securityNote}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className={styles.backgroundElements}>
        <div className={`${styles.floatingElement} ${styles.element1}`}></div>
        <div className={`${styles.floatingElement} ${styles.element2}`}></div>
        <div className={`${styles.floatingElement} ${styles.element3}`}></div>
      </div>

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

export default Auth;