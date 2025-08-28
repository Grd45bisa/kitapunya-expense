// assets/sample-data.ts

import type { Expense } from '../types/expense.types';

export const getSampleExpenses = (): Expense[] => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  return [
    {
      id: 'exp_sample_1',
      toko: 'Indomaret',
      kategori: 'belanja',
      total: 125000,
      tanggal: new Date(currentYear, currentMonth, 15).toISOString().split('T')[0],
      alamat: 'Jl. Raya Bogor KM 30',
      catatan: 'Beli mie instan, deterjen, sabun mandi, shampoo',
      hasPhoto: true,
      timestamp: new Date().toISOString()
    },
    {
      id: 'exp_sample_2',
      toko: 'KFC',
      kategori: 'makanan',
      total: 89000,
      tanggal: new Date(currentYear, currentMonth, 14).toISOString().split('T')[0],
      alamat: 'Mall Summarecon Bekasi',
      catatan: 'Beli Paket Kombo Original Recipe, Pepsi',
      hasPhoto: false,
      timestamp: new Date().toISOString()
    },
    {
      id: 'exp_sample_3',
      toko: 'BreadTalk',
      kategori: 'makanan',
      total: 43500,
      tanggal: new Date(currentYear, currentMonth, 13).toISOString().split('T')[0],
      alamat: 'RUKO SUMMARECON BEKASI JL.BOULEVARD BARU',
      catatan: 'Beli Bread Butter Pudding Rp 11.500, Cream Bruille Rp 14.000, Croissant Rp 18.000',
      hasPhoto: true,
      timestamp: new Date().toISOString()
    },
    {
      id: 'exp_sample_4',
      toko: 'Grab',
      kategori: 'transportasi',
      total: 25000,
      tanggal: new Date(currentYear, currentMonth, 12).toISOString().split('T')[0],
      alamat: 'Jakarta Selatan',
      catatan: 'GrabCar dari Kemang ke Blok M',
      hasPhoto: false,
      timestamp: new Date().toISOString()
    },
    {
      id: 'exp_sample_5',
      toko: 'Guardian',
      kategori: 'kesehatan',
      total: 67000,
      tanggal: new Date(currentYear, currentMonth, 10).toISOString().split('T')[0],
      alamat: 'Plaza Senayan',
      catatan: 'Beli vitamin C, masker wajah, hand sanitizer',
      hasPhoto: true,
      timestamp: new Date().toISOString()
    },
    {
      id: 'exp_sample_6',
      toko: 'XXI',
      kategori: 'hiburan',
      total: 55000,
      tanggal: new Date(currentYear, currentMonth, 8).toISOString().split('T')[0],
      alamat: 'Grand Indonesia',
      catatan: 'Tiket nonton film + popcorn medium',
      hasPhoto: false,
      timestamp: new Date().toISOString()
    }
  ];
};