// components/Sidebar.tsx - Complete with Language Support
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './styles/Sidebar.module.css';

type Page = 'dashboard' | 'statistics' | 'tools' | 'settings';
type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

interface User {
  uid: string;
  email: string;
  name: string;
  picture?: string;
  nickname?: string;
  purpose?: string;
}

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  connectionStatus: ConnectionStatus;
  user?: User | null;
  onLogout?: () => void;
  isOpen?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentPage, 
  onPageChange, 
  connectionStatus,
  user,
  onLogout,
  isOpen = false
}) => {
  const { t, language } = useLanguage();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const menuItems: Array<{
    id: Page;
    label: string;
    icon: string;
    description: string;
    badge?: string;
  }> = [
    {
      id: 'dashboard' as Page,
      label: t.navigation.dashboard,
      icon: 'fas fa-home',
      description: language === 'id' ? 'Ringkasan pengeluaran' : 'Expense summary'
    },
    {
      id: 'statistics' as Page,
      label: t.navigation.statistics,
      icon: 'fas fa-chart-bar',
      description: language === 'id' ? 'Analisis dan laporan' : 'Analysis and reports'
    },
    {
      id: 'tools' as Page,
      label: t.navigation.tools,
      icon: 'fas fa-toolbox',
      description: language === 'id' ? 'Fitur tambahan' : 'Additional features'
    },
    {
      id: 'settings' as Page,
      label: t.navigation.settings,
      icon: 'fas fa-cog',
      description: language === 'id' ? 'Konfigurasi aplikasi' : 'App configuration'
    }
  ];

  const getConnectionStatusInfo = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          text: t.status.online,
          color: '#4CAF50',
          description: language === 'id' ? 'Data tersinkronisasi' : 'Data synced'
        };
      case 'connecting':
        return {
          text: t.status.connecting,
          color: '#FF9800',
          description: language === 'id' ? 'Menyinkronkan' : 'Syncing'
        };
      case 'disconnected':
        return {
          text: t.status.offline,
          color: '#F44336',
          description: language === 'id' ? 'Mode offline' : 'Offline mode'
        };
      default:
        return {
          text: 'Unknown',
          color: '#9E9E9E',
          description: language === 'id' ? 'Status tidak diketahui' : 'Unknown status'
        };
    }
  };

  const handleLogout = () => {
    const confirmMessage = language === 'id' 
      ? 'Yakin ingin keluar?' 
      : 'Are you sure you want to sign out?';
    
    if (window.confirm(confirmMessage)) {
      if (onLogout) {
        onLogout();
      }
      setShowUserMenu(false);
    }
  };

  const statusInfo = getConnectionStatusInfo();

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.brandIcon}>
          <i className="fas fa-wallet"></i>
        </div>
        <div className={styles.brandText}>
          <h1>{language === 'id' ? 'Kita Punya' : 'Kita Punya'}</h1>
          <span>{language === 'id' ? 'Pengeluaran' : 'Expense'}</span>
        </div>
      </div>

      {/* User Profile */}
      {user && (
        <div className={styles.userSection}>
          <div 
            className={styles.userProfile}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className={styles.userAvatar}>
              {user.picture ? (
                <img src={user.picture} alt={user.name} />
              ) : (
                <i className="fas fa-user"></i>
              )}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>
                {user.nickname || user.name || 'User'}
              </span>
              <span className={styles.userEmail}>{user.email}</span>
            </div>
            <i className={`fas fa-chevron-${showUserMenu ? 'up' : 'down'} ${styles.chevron}`}></i>
          </div>

          {showUserMenu && (
            <div className={styles.userMenu}>
              <button 
                className={styles.userMenuItem}
                onClick={() => {
                  onPageChange('settings');
                  setShowUserMenu(false);
                }}
              >
                <i className="fas fa-user-cog"></i>
                <span>{language === 'id' ? 'Profil & Pengaturan' : 'Profile & Settings'}</span>
              </button>
              <button 
                className={styles.userMenuItem}
                onClick={handleLogout}
              >
                <i className="fas fa-sign-out-alt"></i>
                <span>{t.navigation.logout}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className={styles.navigation}>
        <ul className={styles.menuList}>
          {menuItems.map((item) => (
            <li key={item.id} className={styles.menuItem}>
              <button
                className={`${styles.menuButton} ${
                  currentPage === item.id ? styles.active : ''
                }`}
                onClick={() => onPageChange(item.id)}
              >
                <i className={`${item.icon} ${styles.menuIcon}`}></i>
                <div className={styles.menuContent}>
                  <span className={styles.menuLabel}>
                    {item.label}
                    {item.badge && (
                      <span className={styles.badge}>{item.badge}</span>
                    )}
                  </span>
                  <span className={styles.menuDescription}>{item.description}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Connection Status */}
      <div className={styles.statusSection}>
        <div className={styles.connectionStatus}>
          <div className={styles.statusHeader}>
            <span 
              className={styles.statusDot}
              style={{ backgroundColor: statusInfo.color }}
            ></span>
            <span className={styles.statusText}>{statusInfo.text}</span>
          </div>
          <span className={styles.statusDescription}>
            {statusInfo.description}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <p className={styles.version}>v2.3.0</p>
        <p className={styles.copyright}>
          © 2024 {language === 'id' ? 'Kita Punya Catatan' : 'Expense Tracker'}
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;