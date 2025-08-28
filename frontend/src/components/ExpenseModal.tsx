// components/ExpenseModal.tsx - Updated for Base64 Photo Integration
import React, { useState } from 'react';
import PhotoUpload from './PhotoUpload';
import ExpenseForm from './ExpenseForm';
import { useLanguage } from '../contexts/LanguageContext';
import { Expense, AnalysisResult } from '../types/expense.types';
import styles from './styles/ExpenseModal.module.css';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (expense: Omit<Expense, 'id' | 'timestamp'>) => Promise<void>;
  onAnalyzeReceipt: (photo: File) => Promise<AnalysisResult>;
  isBackendConnected: boolean;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onAnalyzeReceipt,
  isBackendConnected
}) => {
  const { t } = useLanguage();
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  if (!isOpen) return null;

  // Convert file to Base64 for storage with better error handling
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const result = reader.result as string;
        console.log(`Base64 conversion successful for ${file.name}:`, {
          fileType: file.type,
          fileSize: file.size,
          base64Size: result.length
        });
        resolve(result);
      };
      
      reader.onerror = (error) => {
        console.error('Base64 conversion failed:', error);
        reject(error);
      };
      
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoChange = async (file: File | null) => {
    setPhoto(file);
    
    if (file) {
      try {
        console.log('Processing photo:', {
          name: file.name,
          type: file.type,
          size: file.size
        });
        
        const base64 = await convertToBase64(file);
        setPhotoBase64(base64);
        console.log('Photo converted to Base64 successfully');
      } catch (error) {
        console.error('Failed to convert photo to Base64:', error);
        setPhotoBase64(null);
      }
    } else {
      setPhotoBase64(null);
    }
  };

  const handleAnalyze = async () => {
    if (!photo) return;
    
    console.log('Starting analysis for:', photo.name);
    setAnalyzing(true);
    try {
      const result = await onAnalyzeReceipt(photo);
      
      // Include Base64 data in analysis result if available from backend
      if (result.photoBase64) {
        setPhotoBase64(result.photoBase64);
      }
      
      console.log('Analysis completed:', {
        toko: result.toko,
        filename: result.filename,
        hasBase64: !!result.photoBase64
      });
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (formData: Omit<Expense, 'id' | 'timestamp'>) => {
    // Include Base64 photo data in submission
    const expenseData = {
      ...formData,
      hasPhoto: photo !== null,
      filename: analysisResult?.filename || (photo ? photo.name : undefined),
      photoData: photoBase64, // Send Base64 data to backend
      base64: photoBase64 || undefined // Store for frontend use - convert null to undefined
    } as Omit<Expense, 'id' | 'timestamp'>;
    
    console.log('Submitting expense with Base64 photo:', {
      filename: expenseData.filename,
      hasBase64: !!expenseData.photoData,
      base64Size: expenseData.photoData ? Math.round(expenseData.photoData.length / 1024) + 'KB' : 'none'
    });
    
    await onSubmit(expenseData);
  };

  const handleClose = () => {
    setPhoto(null);
    setPhotoBase64(null);
    setAnalysisResult(null);
    onClose();
  };

  return (
    <div className={styles.modal} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>{t.expense.addExpense}</h3>
          <button className={styles.closeButton} onClick={handleClose}>
            &times;
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <div className={styles.modalLayout}>
            <PhotoUpload
              photo={photo}
              photoBase64={photoBase64}
              onPhotoChange={handlePhotoChange}
              onAnalyze={handleAnalyze}
              analyzing={analyzing}
              canAnalyze={isBackendConnected}
            />
            
            <ExpenseForm
              onSubmit={handleSubmit}
              onCancel={handleClose}
              initialData={analysisResult}
            />
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ExpenseModal;