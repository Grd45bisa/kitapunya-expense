// components/CategoryCard.tsx
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { CATEGORIES } from '../utils/constants';
import styles from './styles/CategoryCard.module.css';

interface CategoryCardProps {
  category: string;
  amount: number;
  totalAmount: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, amount, totalAmount }) => {
  const { language, formatCurrency } = useLanguage();
  
  const getCategoryLabel = (category: string) => {
    const categoryMap: { [key: string]: { id: string; en: string } } = {
      makanan: { id: 'Makanan', en: 'Food' },
      transportasi: { id: 'Transportasi', en: 'Transport' },
      belanja: { id: 'Belanja', en: 'Shopping' },
      hiburan: { id: 'Hiburan', en: 'Entertainment' },
      kesehatan: { id: 'Kesehatan', en: 'Health' },
      pendidikan: { id: 'Pendidikan', en: 'Education' },
      tagihan: { id: 'Tagihan', en: 'Bills' },
      lainnya: { id: 'Lainnya', en: 'Others' }
    };
    
    const labels = categoryMap[category] || { id: category, en: category };
    return language === 'id' ? labels.id : labels.en;
  };

  const categoryInfo = CATEGORIES[category as keyof typeof CATEGORIES];
  
  // Dynamic budget calculation
  const maxBudget = Math.max(totalAmount * 0.4, 500000); // 40% of total or min 500k
  const budgetPercentage = Math.min((amount / maxBudget) * 100, 100);
  
  const getProgressColor = () => {
    if (budgetPercentage > 80) return '#FF6F61';
    if (budgetPercentage > 60) return '#FFA726';
    return '#00B8B8';
  };

  return (
    <div className={styles.categoryCard}>
      <div 
        className={styles.categoryIcon}
        style={{ backgroundColor: categoryInfo?.color || '#B0B0B0' }}
      >
        <i className={`fas ${categoryInfo?.icon || 'fa-receipt'}`}></i>
      </div>
      <h3>{getCategoryLabel(category)}</h3>
      <div className={styles.progressBar}>
        <div 
          className={styles.progress}
          style={{ 
            width: `${budgetPercentage}%`,
            backgroundColor: getProgressColor()
          }}
        />
      </div>
      <p className={styles.amount}>
        Rp {formatCurrency(amount)}
      </p>
    </div>
  );
};

export default CategoryCard;