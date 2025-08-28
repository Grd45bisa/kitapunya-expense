// components/ExportExcel.tsx
import { useState } from 'react';
import * as XLSX from 'xlsx';
import type { Expense } from '../types/expense.types';
import { formatCurrency } from '../utils/formatters';
import styles from './styles/ExportExcel.module.css';

interface ExportExcelProps {
  expenses: Expense[];
  userName?: string;
  monthlyTotal: number;
  categoryTotals: { [key: string]: number };
}

const ExportExcel: React.FC<ExportExcelProps> = ({
  expenses,
  userName = 'User',
  monthlyTotal,
  categoryTotals
}) => {
  const [exporting, setExporting] = useState(false);

  const exportToExcel = async () => {
    setExporting(true);
    
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Sheet 1: Summary
      const summaryData = [
        ['LAPORAN PENGELUARAN'],
        ['Nama:', userName],
        ['Tanggal Export:', new Date().toLocaleDateString('id-ID')],
        [''],
        ['RINGKASAN'],
        ['Total Bulan Ini:', `Rp ${formatCurrency(monthlyTotal)}`],
        ['Total Transaksi:', expenses.length],
        [''],
        ['BREAKDOWN KATEGORI']
      ];
      
      Object.entries(categoryTotals).forEach(([category, amount]) => {
        summaryData.push([category, `Rp ${formatCurrency(amount)}`]);
      });
      
      const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Ringkasan');
      
      // Sheet 2: Detail Transactions
      const detailData = expenses.map(exp => ({
        'Tanggal': new Date(exp.tanggal).toLocaleDateString('id-ID'),
        'Toko': exp.toko,
        'Kategori': exp.kategori,
        'Total (Rp)': exp.total,
        'Alamat': exp.alamat || '-',
        'Catatan': exp.catatan || '-',
        'Ada Foto': exp.filename && exp.filename !== 'No' ? 'Ya' : 'Tidak'
      }));
      
      const ws2 = XLSX.utils.json_to_sheet(detailData);
      
      // Style columns
      const range = XLSX.utils.decode_range(ws2['!ref'] || 'A1');
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + '1';
        if (!ws2[address]) continue;
        ws2[address].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "00B8B8" } }
        };
      }
      
      XLSX.utils.book_append_sheet(wb, ws2, 'Detail Transaksi');
      
      // Sheet 3: Monthly Statistics
      const monthlyStats: any[] = [];
      const groupedByMonth: { [key: string]: Expense[] } = {};
      
      expenses.forEach(exp => {
        const monthKey = new Date(exp.tanggal).toLocaleDateString('id-ID', { 
          year: 'numeric', 
          month: 'long' 
        });
        if (!groupedByMonth[monthKey]) {
          groupedByMonth[monthKey] = [];
        }
        groupedByMonth[monthKey].push(exp);
      });
      
      Object.entries(groupedByMonth).forEach(([month, exps]) => {
        const total = exps.reduce((sum, exp) => sum + exp.total, 0);
        monthlyStats.push({
          'Bulan': month,
          'Jumlah Transaksi': exps.length,
          'Total (Rp)': total,
          'Rata-rata (Rp)': Math.round(total / exps.length)
        });
      });
      
      const ws3 = XLSX.utils.json_to_sheet(monthlyStats);
      XLSX.utils.book_append_sheet(wb, ws3, 'Statistik Bulanan');
      
      // Generate filename
      const filename = `Pengeluaran_${userName}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Write file
      XLSX.writeFile(wb, filename);
      
      console.log('✅ Export to Excel successful');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Gagal export ke Excel');
    } finally {
      setExporting(false);
    }
  };

  return (
    <button 
      className={styles.exportButton}
      onClick={exportToExcel}
      disabled={exporting || expenses.length === 0}
      title={expenses.length === 0 ? 'Tidak ada data untuk di-export' : 'Export ke Excel'}
    >
      {exporting ? (
        <>
          <i className="fas fa-spinner fa-spin"></i>
          <span>Exporting...</span>
        </>
      ) : (
        <>
          <i className="fas fa-file-excel"></i>
          <span>Export Excel</span>
        </>
      )}
    </button>
  );
};

export default ExportExcel;