// types/expense.types.ts - Updated with Base64 support

export interface Expense {
  id: string;
  toko: string;
  kategori: Category;
  total: number;
  tanggal: string;
  alamat?: string;
  catatan?: string;
  hasPhoto?: boolean;
  timestamp: string;
  filename?: string;
  base64?: string; // Added for Base64 photo storage
  photoData?: string; // Added for form submission
}

export type Category = 
  | 'makanan' 
  | 'transportasi' 
  | 'belanja' 
  | 'hiburan' 
  | 'kesehatan' 
  | 'pendidikan' 
  | 'lainnya';

export interface CategoryTotal {
  [key: string]: number;
}

export interface Stats {
  monthlyTotal: number;
  categoryTotals: CategoryTotal;
  currentMonth: number;
  currentYear: number;
}

export interface AnalysisResult {
  toko?: string;
  kategori?: Category;
  total?: number;
  tanggal?: string;
  alamat?: string;
  catatan?: string;
  confidence?: number;
  filename?: string;
  photoBase64?: string; // Added for Base64 analysis result
  hasPhoto?: boolean; // Added to indicate photo presence
}

export interface AnalysisResponse {
  success: boolean;
  analysis?: AnalysisResult;
  error?: string;
  isAIError?: boolean;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';