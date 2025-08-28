import React from 'react';
import styles from './styles/BottomNavigation.module.css';

type Page = 'dashboard' | 'statistics' | 'tools' | 'settings';

interface BottomNavigationProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  onAddExpense?: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  currentPage, 
  onPageChange,
  onAddExpense
}) => {
  const menuItems = [
    {
      id: 'dashboard' as Page,
      label: 'Beranda',
      icon: 'fas fa-home'
    },
    {
      id: 'statistics' as Page,
      label: 'Statistik',
      icon: 'fas fa-chart-bar'
    },
    {
      id: 'add' as any,
      label: 'Tambah',
      icon: 'fas fa-plus',
      isSpecial: true
    },
    {
      id: 'tools' as Page,
      label: 'Tools',
      icon: 'fas fa-toolbox',
      badge: true
    },
    {
      id: 'settings' as Page,
      label: 'Pengaturan',
      icon: 'fas fa-cog'
    }
  ];

  const handleItemClick = (item: any) => {
    if (item.id === 'add') {
      if (onAddExpense) {
        onAddExpense();
      }
    } else {
      onPageChange(item.id);
    }
  };

  return (
    <>
      <nav className={styles.bottomNav}>
        <div className={styles.navContainer}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.navItem} ${
                item.isSpecial ? styles.specialItem : ''
              } ${
                currentPage === item.id && !item.isSpecial ? styles.active : ''
              }`}
              onClick={() => handleItemClick(item)}
            >
              {item.isSpecial ? (
                <div className={styles.addButton}>
                  <i className={item.icon}></i>
                </div>
              ) : (
                <>
                  <div className={styles.iconWrapper}>
                    <i className={item.icon}></i>
                    {item.badge && <span className={styles.navBadge}></span>}
                  </div>
                  <span className={styles.label}>{item.label}</span>
                </>
              )}
            </button>
          ))}
        </div>
      </nav>
      <div className={styles.safeAreaSpacer}></div>
    </>
  );
};

export default BottomNavigation;