// components/ExpenseForm.tsx - Complete with Language Support
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getCurrentDate } from '../utils/formatters';
import type { Expense, AnalysisResult } from '../types/expense.types';
import styles from './styles/ExpenseForm.module.css';

interface ExpenseFormProps {
  onSubmit: (data: Omit<Expense, 'id' | 'timestamp'>) => void;
  onCancel: () => void;
  initialData?: AnalysisResult | null;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const { t, language } = useLanguage();
  
  const [formData, setFormData] = useState({
    toko: '',
    kategori: '',
    total: '',
    tanggal: getCurrentDate(),
    alamat: '',
    catatan: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Category options with translations
  const categories = [
    { value: 'makanan', label: language === 'id' ? 'Makanan' : 'Food', icon: 'fa-utensils' },
    { value: 'transportasi', label: language === 'id' ? 'Transportasi' : 'Transport', icon: 'fa-car' },
    { value: 'belanja', label: language === 'id' ? 'Belanja' : 'Shopping', icon: 'fa-shopping-bag' },
    { value: 'hiburan', label: language === 'id' ? 'Hiburan' : 'Entertainment', icon: 'fa-film' },
    { value: 'kesehatan', label: language === 'id' ? 'Kesehatan' : 'Health', icon: 'fa-heartbeat' },
    { value: 'pendidikan', label: language === 'id' ? 'Pendidikan' : 'Education', icon: 'fa-graduation-cap' },
    { value: 'tagihan', label: language === 'id' ? 'Tagihan' : 'Bills', icon: 'fa-file-invoice' },
    { value: 'lainnya', label: language === 'id' ? 'Lainnya' : 'Others', icon: 'fa-ellipsis-h' }
  ];

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        toko: initialData.toko || prev.toko,
        kategori: initialData.kategori || prev.kategori,
        total: initialData.total?.toString() || prev.total,
        tanggal: initialData.tanggal || prev.tanggal,
        alamat: initialData.alamat || prev.alamat,
        catatan: initialData.catatan || prev.catatan
      }));
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    await onSubmit({
      toko: formData.toko,
      kategori: formData.kategori as any,
      total: parseInt(formData.total),
      tanggal: formData.tanggal,
      alamat: formData.alamat,
      catatan: formData.catatan
    });
    
    setSubmitting(false);
  };

  return (
    <form className={styles.expenseForm} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label htmlFor="toko">{t.expense.storeName} *</label>
        <input
          type="text"
          id="toko"
          name="toko"
          value={formData.toko}
          onChange={handleChange}
          required
          placeholder={t.expense.placeholders.storeName}
        />
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="kategori">{t.expense.category} *</label>
        <select
          id="kategori"
          name="kategori"
          value={formData.kategori}
          onChange={handleChange}
          required
        >
          <option value="">{t.common.select} {t.expense.category}</option>
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="total">{t.expense.amount} (Rp) *</label>
        <div className={styles.amountInputWrapper}>
          <span className={styles.currencySymbol}>Rp</span>
          <input
            type="number"
            id="total"
            name="total"
            value={formData.total}
            onChange={handleChange}
            required
            min="0"
            placeholder={t.expense.placeholders.amount}
            className={styles.amountInput}
          />
        </div>
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="tanggal">{t.expense.date} *</label>
        <input
          type="date"
          id="tanggal"
          name="tanggal"
          value={formData.tanggal}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="alamat">{t.expense.address}</label>
        <input
          type="text"
          id="alamat"
          name="alamat"
          value={formData.alamat}
          onChange={handleChange}
          placeholder={t.expense.placeholders.address}
        />
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="catatan">{t.expense.notes}</label>
        <textarea
          id="catatan"
          name="catatan"
          value={formData.catatan}
          onChange={handleChange}
          rows={4}
          placeholder={t.expense.placeholders.notes}
        />
      </div>
      
      <div className={styles.formActions}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>
          {t.common.cancel}
        </button>
        <button type="submit" className={styles.submitButton} disabled={submitting}>
          <i className={`fas ${submitting ? 'fa-spinner fa-spin' : 'fa-save'}`}></i>
          {submitting ? t.common.saving : t.common.save}
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;