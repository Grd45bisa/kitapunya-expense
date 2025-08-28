// pages/Settings.tsx - Updated with Language Switcher

import { useState } from 'react';
import ExportExcel from '../components/ExportExcel';
import { getApiUrl } from '../config';
import { useExpenses } from '../hooks/useExpenses';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './styles/Settings.module.css';

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
  metadata?: {
    creationTime: string;
    lastSignInTime: string;
  };
}

interface SettingsProps {
  user: User | null;
  onLogout: () => void;
  onUserUpdate: (user: User) => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  user, 
  onLogout, 
  onUserUpdate,
  darkMode,
  setDarkMode 
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'data'>('profile');
  const [settings, setSettings] = useState({
    userName: user?.nickname || user?.name || 'User',
    monthlyBudget: user?.monthlyBudget ? parseInt(user.monthlyBudget) : 5000000,
    currency: 'IDR',
    notifications: true,
    autoBackup: true
  });

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Get expenses data for export
  const { expenses, monthlyTotal, categoryTotals } = useExpenses(
    user?.email,
    user?.nickname || user?.name
  );

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const profileUrl = getApiUrl('user/profile');
      
      const response = await fetch(profileUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.idToken}`
        },
        body: JSON.stringify({
          email: user.email,
          nickname: settings.userName,
          monthlyBudget: settings.monthlyBudget
        })
      });

      const result = await response.json();

      if (result.success) {
        const updatedUser: User = {
          ...user,
          nickname: settings.userName,
          monthlyBudget: settings.monthlyBudget.toString()
        };
        
        onUserUpdate(updatedUser);
        localStorage.setItem('appSettings', JSON.stringify(settings));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        throw new Error(result.error || t.notifications.error.updateFailed);
      }
    } catch (error) {
      // Save locally even if backend fails
      const updatedUser: User = {
        ...user,
        nickname: settings.userName,
        monthlyBudget: settings.monthlyBudget.toString()
      };
      onUserUpdate(updatedUser);
      localStorage.setItem('appSettings', JSON.stringify(settings));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    if (confirm(t.notifications.warning.confirmLogout)) {
      onLogout();
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    const confirmText = language === 'id' ? 'HAPUS AKUN SAYA' : 'DELETE MY ACCOUNT';
    if (deleteConfirmation !== confirmText) {
      alert(`${t.settings.typeToConfirm.replace(':', '')}: "${confirmText}"`);
      return;
    }

    setIsDeleting(true);

    try {
      const deleteUrl = getApiUrl('user/delete-account');
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.idToken || ''}`
        },
        body: JSON.stringify({
          email: user.email
        })
      });

      if (!response.ok) {
        throw new Error(t.notifications.error.deleteFailed);
      }

      const result = await response.json();

      if (result.success) {
        const message = language === 'id' 
          ? 'Akun dan spreadsheet Anda telah dihapus!\n\nAnda akan dialihkan ke halaman login.'
          : 'Your account and spreadsheet have been deleted!\n\nYou will be redirected to the login page.';
        
        alert(message);
        
        localStorage.clear();
        sessionStorage.clear();
        
        onLogout();
        
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      alert(t.notifications.error.deleteFailed);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteConfirmation('');
    }
  };

  const tabs = [
    { id: 'profile' as const, label: t.settings.profile, icon: 'fas fa-user' },
    { id: 'preferences' as const, label: t.settings.preferences, icon: 'fas fa-sliders-h' },
    { id: 'data' as const, label: t.settings.dataSecurity, icon: 'fas fa-shield-alt' }
  ];

  return (
    <div className={styles.settings}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTitle}>
            <h1>{t.settings.title}</h1>
            <p>{t.settings.subtitle}</p>
          </div>
          {saveSuccess && (
            <div className={styles.saveIndicator}>
              <i className="fas fa-check-circle"></i>
              <span>{t.settings.saved}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={tab.icon}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Settings Content */}
      <div className={styles.settingsContent}>
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className={styles.tabContent}>
            <div className={styles.profileSection}>
              {/* User Avatar Section */}
              <div className={styles.avatarSection}>
                <div className={styles.avatarContainer}>
                  {user?.picture ? (
                    <img src={user.picture} alt="Profile" className={styles.avatar} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      <i className="fas fa-user"></i>
                    </div>
                  )}
                  <div className={styles.avatarOverlay}>
                    <i className="fas fa-camera"></i>
                  </div>
                </div>
                <button className={styles.changePhotoBtn}>
                  {t.settings.changePhoto}
                </button>
              </div>

              {/* User Info Form */}
              <div className={styles.formSection}>
                <div className={styles.formGroup}>
                  <label htmlFor="userName">
                    <i className="fas fa-user"></i>
                    {t.settings.username}
                  </label>
                  <input
                    id="userName"
                    type="text"
                    value={settings.userName}
                    onChange={(e) => handleChange('userName', e.target.value)}
                    className={styles.input}
                    placeholder={language === 'id' ? 'Masukkan nama Anda' : 'Enter your name'}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email">
                    <i className="fas fa-envelope"></i>
                    {t.settings.email}
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className={styles.inputDisabled}
                  />
                  <span className={styles.inputHelp}>
                    {language === 'id' ? 'Email tidak dapat diubah' : 'Email cannot be changed'}
                  </span>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="monthlyBudget">
                    <i className="fas fa-wallet"></i>
                    {t.settings.monthlyBudget}
                  </label>
                  <div className={styles.budgetInputWrapper}>
                    <span className={styles.currencySymbol}>Rp</span>
                    <input
                      id="monthlyBudget"
                      type="number"
                      value={settings.monthlyBudget}
                      onChange={(e) => handleChange('monthlyBudget', parseInt(e.target.value))}
                      className={styles.budgetInput}
                      placeholder="0"
                    />
                  </div>
                  <span className={styles.inputHelp}>
                    {language === 'id' ? 'Target pengeluaran bulanan Anda' : 'Your monthly expense target'}
                  </span>
                </div>

                <button 
                  onClick={handleSave} 
                  className={styles.primaryButton}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>{t.settings.saving}</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      <span>{t.settings.saveChanges}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className={styles.tabContent}>
            <div className={styles.preferencesSection}>
              <h2 className={styles.sectionTitle}>
                <i className="fas fa-cog"></i>
                {language === 'id' ? 'Pengaturan Aplikasi' : 'App Settings'}
              </h2>

              <div className={styles.preferencesList}>
                {/* Language Switcher - DROPDOWN VERSION */}
                <div className={styles.preferenceItem}>
                  <div className={styles.preferenceInfo}>
                    <h3>
                      <i className="fas fa-language"></i>
                      {t.settings.language}
                    </h3>
                    <p>{t.settings.languageDesc}</p>
                  </div>
                  <select
                    className={styles.languageDropdown}
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'id' | 'en')}
                  >
                    <option value="id">Indonesia</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div className={styles.preferenceItem}>
                  <div className={styles.preferenceInfo}>
                    <h3>
                      <i className="fas fa-bell"></i>
                      {t.settings.notifications}
                    </h3>
                    <p>{t.settings.notificationsDesc}</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={(e) => handleChange('notifications', e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.preferenceItem}>
                  <div className={styles.preferenceInfo}>
                    <h3>
                      <i className="fas fa-moon"></i>
                      {t.settings.darkMode}
                    </h3>
                    <p>{t.settings.darkModeDesc}</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={darkMode}
                      onChange={(e) => setDarkMode(e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.preferenceItem}>
                  <div className={styles.preferenceInfo}>
                    <h3>
                      <i className="fas fa-cloud"></i>
                      {t.settings.autoBackup}
                    </h3>
                    <p>{t.settings.autoBackupDesc}</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={settings.autoBackup}
                      onChange={(e) => handleChange('autoBackup', e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data & Security Tab */}
        {activeTab === 'data' && (
          <div className={styles.tabContent}>
            <div className={styles.dataSection}>
              <h2 className={styles.sectionTitle}>
                <i className="fas fa-database"></i>
                {t.settings.manageData}
              </h2>

              <div className={styles.dataActions}>
                <ExportExcel 
                  expenses={expenses}
                  userName={user?.nickname || user?.name}
                  monthlyTotal={monthlyTotal}
                  categoryTotals={categoryTotals}
                />
              </div>

              <div className={styles.dangerZone}>
                <h2 className={styles.dangerTitle}>
                  <i className="fas fa-exclamation-triangle"></i>
                  {t.settings.dangerZone}
                </h2>
                
                <div className={styles.dangerCard}>
                  <div className={styles.dangerInfo}>
                    <h3>{t.settings.logout}</h3>
                    <p>{t.settings.logoutDesc}</p>
                  </div>
                  <button onClick={handleLogout} className={styles.logoutButton}>
                    <i className="fas fa-sign-out-alt"></i>
                    {t.navigation.logout}
                  </button>
                </div>

                <div className={styles.dangerCard}>
                  <div className={styles.dangerInfo}>
                    <h3>{t.settings.deleteAccount}</h3>
                    <p>{t.settings.deleteAccountDesc}</p>
                  </div>
                  <button 
                    onClick={() => setShowDeleteModal(true)} 
                    className={styles.deleteButton}
                  >
                    <i className="fas fa-trash-alt"></i>
                    {t.settings.deleteAccount}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>
                <i className="fas fa-exclamation-triangle"></i>
                {t.settings.deleteConfirmation}
              </h3>
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                }}
                className={styles.modalClose}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.warningBox}>
                <p><strong>{t.settings.warning}</strong> {t.settings.cannotBeUndone}</p>
                <ul>
                  <li>{t.settings.deleteWarnings.profile}</li>
                  <li>{t.settings.deleteWarnings.history}</li>
                </ul>
              </div>

              <div className={styles.confirmationInput}>
                <label>
                  {t.settings.typeToConfirm}
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder={language === 'id' ? 'Ketik di sini...' : 'Type here...'}
                  className={styles.input}
                />
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                }}
                className={styles.cancelButton}
              >
                {t.common.cancel}
              </button>
              <button 
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmation !== (language === 'id' ? 'HAPUS AKUN SAYA' : 'DELETE MY ACCOUNT')}
                className={styles.confirmDeleteButton}
              >
                {isDeleting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    {t.settings.deleting}
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash-alt"></i>
                    {t.settings.permanentDelete}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;