// components/TransactionItem.tsx
import React, { useState } from 'react';
import { CATEGORIES } from '../utils/constants';
import TransactionDetailModal from './TransactionDetailModal';
import styles from './styles/TransactionItem.module.css';
import type { Expense } from '../types/expense.types';

interface TransactionItemProps {
  expense: Expense;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ expense }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      makanan: 'Makanan',
      transportasi: 'Transportasi',
      belanja: 'Belanja',
      hiburan: 'Hiburan',
      kesehatan: 'Kesehatan',
      pendidikan: 'Pendidikan',
      tagihan: 'Tagihan',
      lainnya: 'Lainnya'
    };
    return categoryMap[category] || category;
  };

  const categoryInfo = CATEGORIES[expense.kategori as keyof typeof CATEGORIES];
  const hasPhoto = expense.filename && expense.filename !== 'No';
  const displayFilename = expense.filename && expense.filename !== 'No' && expense.filename !== 'Yes' 
    ? expense.filename 
    : null;

  const handleClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className={styles.transactionItem} onClick={handleClick}>
        <div 
          className={styles.transactionIcon}
          style={{ backgroundColor: categoryInfo?.color || '#B0B0B0' }}
        >
          <i className={`fas ${categoryInfo?.icon || 'fa-receipt'}`}></i>
        </div>
        
        <div className={styles.transactionInfo}>
          <h4>
            {expense.toko}
            {hasPhoto && (
              <i className="fas fa-camera" style={{ color: '#00B8B8', marginLeft: '8px' }}></i>
            )}
            {expense.driveLink && (
              <a 
                href={expense.driveLink} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#00B8B8', marginLeft: '8px', textDecoration: 'none' }}
                title="Lihat di Google Drive"
                onClick={(e) => e.stopPropagation()} // Prevent modal from opening
              >
                <i className="fab fa-google-drive"></i>
              </a>
            )}
          </h4>
          <p>{getCategoryLabel(expense.kategori)} • {formatDate(expense.tanggal)}</p>
          
          {expense.alamat && (
            <div className={styles.address}>
              <i className="fas fa-map-marker-alt"></i> {expense.alamat}
            </div>
          )}
          
          {expense.catatan && (
            <div className={styles.note}>{expense.catatan}</div>
          )}

          {displayFilename && (
            <div className={styles.filename}>
              <i className="fas fa-file-image" style={{ color: '#00B8B8', marginRight: '6px' }}></i>
              <span title={displayFilename}>{displayFilename}</span>
            </div>
          )}
        </div>
        
        <div className={styles.transactionAmount}>
          Rp {formatCurrency(expense.total)}
        </div>
      </div>

      <TransactionDetailModal
        expense={expense}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default TransactionItem;