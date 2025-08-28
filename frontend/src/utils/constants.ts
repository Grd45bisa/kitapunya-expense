// utils/constants.ts - Updated with centralized config

import { urls } from '../config';

// Dynamic API base URL from centralized config
export const API_BASE_URL = urls.api;

export const CATEGORIES = {
  makanan: { icon: 'fa-utensils', label: '🍽️ Makanan', color: '#FF6B6B' },
  transportasi: { icon: 'fa-car', label: '🚗 Transportasi', color: '#4ECDC4' },
  belanja: { icon: 'fa-shopping-bag', label: '🛍️ Belanja', color: '#45B7D1' },
  hiburan: { icon: 'fa-gamepad', label: '🎮 Hiburan', color: '#96CEB4' },
  kesehatan: { icon: 'fa-heartbeat', label: '❤️ Kesehatan', color: '#FFA07A' },
  pendidikan: { icon: 'fa-graduation-cap', label: '🎓 Pendidikan', color: '#DDA0DD' },
  lainnya: { icon: 'fa-receipt', label: '📄 Lainnya', color: '#B0B0B0' }
};

export const NOTIFICATION_COLORS = {
  success: '#66BB6A',
  error: '#FF6F61',
  warning: '#FFA726',
  info: '#00B8B8'
};