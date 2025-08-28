// components/TransactionDetailModal.tsx - Updated for Base64 Photo Display
import React, { useState } from 'react';
import PhotoViewer from './PhotoViewer';
import { Expense } from '../types/expense.types';
import { CATEGORIES } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';
import styles from './styles/TransactionDetailModal.module.css';

interface TransactionDetailModalProps {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  expense,
  isOpen,
  onClose
}) => {
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  if (!isOpen || !expense) return null;

  const categoryInfo = CATEGORIES[expense.kategori as keyof typeof CATEGORIES];
  const hasPhoto = expense.base64 && expense.base64.length > 0;
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  return (
    <>
      <div className={styles.modal} onClick={onClose}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <div className={styles.headerInfo}>
              <div 
                className={styles.categoryIcon}
                style={{ backgroundColor: categoryInfo?.color || '#B0B0B0' }}
              >
                <i className={`fas ${categoryInfo?.icon || 'fa-receipt'}`}></i>
              </div>
              <div>
                <h2>{expense.toko}</h2>
                <p className={styles.categoryTag}>{getCategoryLabel(expense.kategori)}</p>
              </div>
            </div>
            <button className={styles.closeButton} onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className={styles.modalBody}>
            <div className={styles.modalLayout}>
              {/* Left Section - Photo */}
              <div className={styles.photoSection}>
                {hasPhoto ? (
                  <div className={styles.photoContainer}>
                    <PhotoViewer 
                      base64Data={expense.base64}
                      filename={expense.filename}
                      storeName={expense.toko}
                      enableZoom={true}
                      showControls={true}
                      onFullscreen={() => setShowPhotoModal(true)}
                    />
                  </div>
                ) : (
                  <div className={styles.noPhotoPlaceholder}>
                    <i className="fas fa-image"></i>
                    <span>Tidak ada foto struk</span>
                  </div>
                )}
              </div>

              {/* Right Section - Details */}
              <div className={styles.detailsSection}>
                <div className={styles.amountSection}>
                  <div className={styles.totalAmount}>
                    <span className={styles.currency}>Rp</span>
                    <span className={styles.amount}>{formatCurrency(expense.total)}</span>
                  </div>
                  <div className={styles.dateInfo}>
                    <i className="fas fa-calendar-alt"></i>
                    <span>{formatDate(expense.tanggal)}</span>
                  </div>
                </div>

                <div className={styles.detailsGrid}>
                  {expense.alamat && (
                    <div className={styles.detailItem}>
                      <div className={styles.detailLabel}>
                        <i className="fas fa-map-marker-alt"></i>
                        Alamat
                      </div>
                      <div className={styles.detailValue}>{expense.alamat}</div>
                    </div>
                  )}

                  {expense.catatan && (
                    <div className={styles.detailItem}>
                      <div className={styles.detailLabel}>
                        <i className="fas fa-sticky-note"></i>
                        Catatan
                      </div>
                      <div className={styles.detailValue}>{expense.catatan}</div>
                    </div>
                  )}

                  <div className={styles.detailItem}>
                    <div className={styles.detailLabel}>
                      <i className="fas fa-clock"></i>
                      Waktu Input
                    </div>
                    <div className={styles.detailValue}>
                      {new Date(expense.timestamp).toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button className={styles.closeFooterButton} onClick={onClose}>
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* Full Screen Photo Modal - Only triggered by fullscreen button */}
      {showPhotoModal && hasPhoto && (
        <PhotoViewer
          base64Data={expense.base64}
          filename={expense.filename}
          storeName={expense.toko}
          onClose={() => setShowPhotoModal(false)}
          isModal={true}
        />
      )}
    </>
  );
};

export default TransactionDetailModal;