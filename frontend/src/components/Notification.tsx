import { useEffect, useState } from 'react';
import type { NotificationType } from '../types/expense.types';
import { NOTIFICATION_COLORS } from '../utils/constants';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './styles/Notification.module.css';

interface NotificationProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 4000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match with exit animation duration
  };

  // Icon mapping based on notification type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };

  // Get aria-label based on language
  const getAriaLabel = () => {
    return language === 'id' ? 'Tutup notifikasi' : 'Close notification';
  };

  return (
    <div 
      className={`${styles.notification} ${isExiting ? styles.exiting : ''}`}
      style={{ backgroundColor: NOTIFICATION_COLORS[type] }}
      data-type={type}
      role="alert"
      aria-live="polite"
    >
      <span className={styles.notificationIcon} aria-hidden="true">
        {getIcon()}
      </span>
      <span className={styles.message}>{message}</span>
      <button 
        className={styles.closeButton} 
        onClick={handleClose}
        aria-label={getAriaLabel()}
        type="button"
      >
        ✕
      </button>
    </div>
  );
};

export default Notification;