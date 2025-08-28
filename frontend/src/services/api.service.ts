// services/api.service.ts - Fixed Base64 Only Version
import { getApiUrl, urls, isDevelopment } from '../config';
import { Expense, AnalysisResult } from '../types/expense.types';

class ApiService {
  private baseUrl = urls.api;

  // Helper method to create full API URL
  private createUrl(endpoint: string): string {
    return getApiUrl(endpoint);
  }

  // Enhanced user registration/verification before saving expense
  private async ensureUserExists(userEmail: string, userName?: string): Promise<void> {
    try {
      // First, check if user exists
      const profileUrl = this.createUrl(`user/profile/${encodeURIComponent(userEmail)}`);
      const profileResponse = await fetch(profileUrl);
      
      if (profileResponse.ok) {
        const result = await profileResponse.json();
        if (result.success && result.user) {
          console.log('User exists:', userEmail);
          return; // User exists, no need to create
        }
      }

      // User doesn't exist, create it
      console.log('Creating user:', userEmail);
      const registerUrl = this.createUrl('user/register');
      const registerResponse = await fetch(registerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: `auto_${Date.now()}`,
          email: userEmail,
          name: userName || userEmail.split('@')[0],
          isSetupComplete: true // Auto-complete setup to avoid blocking
        })
      });

      if (!registerResponse.ok) {
        throw new Error('Failed to create user');
      }

      const registerResult = await registerResponse.json();
      if (!registerResult.success) {
        throw new Error(registerResult.error || 'User registration failed');
      }

      console.log('User created successfully:', userEmail);

    } catch (error) {
      console.error('Failed to ensure user exists:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`User verification failed: ${errorMessage}`);
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      console.log(`Health check: ${this.createUrl('health')}`);
      const response = await fetch(this.createUrl('health'), { 
        signal: AbortSignal.timeout(5000) 
      });
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Get expenses from user's personal spreadsheet with auto user creation
  async getExpenses(userEmail?: string, userName?: string): Promise<Expense[]> {
    try {
      if (!userEmail) {
        throw new Error('User email required for personal expense access');
      }

      // Ensure user exists before fetching expenses
      await this.ensureUserExists(userEmail, userName);

      const params = new URLSearchParams();
      params.append('userEmail', userEmail);
      if (userName) params.append('userName', userName);

      const url = this.createUrl(`expenses?${params}`);
      console.log(`Fetching expenses from: ${url}`);
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch personal expenses');
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to load personal expenses');
      }

      console.log(`Loaded ${data.expenses.length} expenses from ${userEmail}'s personal spreadsheet`);
      return data.expenses || [];
    } catch (error) {
      console.error('Get personal expenses failed:', error);
      throw error;
    }
  }

  // Get stats from user's personal spreadsheet
  async getStats(userEmail?: string, userName?: string): Promise<any> {
    try {
      if (!userEmail) {
        throw new Error('User email required for personal stats');
      }

      const params = new URLSearchParams();
      params.append('userEmail', userEmail);
      if (userName) params.append('userName', userName);

      const url = this.createUrl(`stats?${params}`);
      console.log(`Fetching stats from: ${url}`);
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch personal stats');
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to load personal stats');
      }

      console.log(`Loaded stats from ${userEmail}'s personal spreadsheet:`, data.stats);
      return data.stats;
    } catch (error) {
      console.error('Get personal stats failed:', error);
      throw error;
    }
  }

  // Save expense to user's personal spreadsheet with auto user creation
  async saveExpense(expense: Omit<Expense, 'id' | 'timestamp'> & { userEmail?: string, userName?: string }): Promise<Expense> {
    try {
      if (!expense.userEmail) {
        throw new Error('User email required to save to personal spreadsheet');
      }

      console.log(`Preparing to save expense for: ${expense.userEmail}`);

      // Ensure user exists first
      await this.ensureUserExists(expense.userEmail, expense.userName);

      const url = this.createUrl('save-expense');
      console.log(`Saving expense to: ${url}`);
      
      const requestBody = {
        toko: expense.toko,
        kategori: expense.kategori,
        total: expense.total,
        tanggal: expense.tanggal,
        alamat: expense.alamat || '',
        catatan: expense.catatan || '',
        filename: expense.filename || 'No',
        photoData: expense.photoData || null, // Send Base64 photo data
        userEmail: expense.userEmail,
        userName: expense.userName
      };

      console.log('Request body:', {
        ...requestBody,
        photoData: requestBody.photoData ? `Base64 data (${Math.round(requestBody.photoData.length / 1024)}KB)` : 'none'
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        console.error('Save expense failed:', response.status, errorData);
        
        // If still user not found after creation attempt, provide helpful error
        if (response.status === 400 && errorData.error?.includes('User not found')) {
          throw new Error('Unable to create user account. Please try logging out and logging in again.');
        }
        
        throw new Error(errorData.error || errorData.details || 'Failed to save expense to personal spreadsheet');
      }
      
      const result = await response.json();
      console.log(`Personal spreadsheet save response:`, result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save to personal spreadsheet');
      }

      // Map response to frontend Expense type
      const savedExpense = result.expense;
      return {
        id: savedExpense.id || `exp_${Date.now()}`,
        toko: savedExpense.toko,
        kategori: savedExpense.kategori,
        total: savedExpense.total,
        tanggal: savedExpense.tanggal,
        alamat: savedExpense.alamat || '',
        catatan: savedExpense.catatan || '',
        hasPhoto: savedExpense.filename !== 'No',
        filename: savedExpense.filename,
        base64: savedExpense.base64 || undefined, // Include Base64 data
        timestamp: savedExpense.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Save expense to personal spreadsheet failed:', error);
      throw error;
    }
  }

  // Get user's personal spreadsheet info
  async getSpreadsheetInfo(userEmail: string): Promise<any> {
    try {
      if (!userEmail) {
        throw new Error('User email required');
      }

      const params = new URLSearchParams();
      params.append('userEmail', userEmail);
      
      const url = this.createUrl(`spreadsheet-info?${params}`);
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch spreadsheet info');
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get spreadsheet info');
      }

      console.log(`Spreadsheet info for ${userEmail}:`, data.spreadsheet);
      return data;
    } catch (error) {
      console.error('Get spreadsheet info failed:', error);
      throw error;
    }
  }

  // User management methods
  async registerUser(userData: { uid: string, email: string, name?: string, picture?: string }): Promise<any> {
    try {
      console.log(`Registering user:`, userData.email);
      
      const url = this.createUrl('user/register');
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) throw new Error('Failed to register user');
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Registration failed');
      }

      console.log(`User registered:`, result.user);
      
      if (result.user.spreadsheetId) {
        console.log(`Personal spreadsheet created: ${result.user.spreadsheetId}`);
      }

      return result;
    } catch (error) {
      console.error('User registration failed:', error);
      throw error;
    }
  }

  async setupUser(setupData: { 
    email: string, 
    nickname?: string, 
    purpose?: string, 
    monthlyBudget?: number, 
    categories?: string[] 
  }): Promise<any> {
    try {
      console.log(`Setting up user:`, setupData.email);
      
      const url = this.createUrl('user/setup');
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setupData)
      });
      
      if (!response.ok) throw new Error('Failed to setup user');
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Setup failed');
      }

      console.log(`User setup completed:`, result.user);
      return result;
    } catch (error) {
      console.error('User setup failed:', error);
      throw error;
    }
  }

  async getUserProfile(email: string): Promise<any> {
    try {
      const encodedEmail = encodeURIComponent(email);
      const url = this.createUrl(`user/profile/${encodedEmail}`);
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Failed to get user profile');
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get profile');
      }

      return result.user;
    } catch (error) {
      console.error('Get user profile failed:', error);
      throw error;
    }
  }

  async updateUserProfile(userData: { 
    email: string, 
    nickname?: string, 
    monthlyBudget?: string | number,
    purpose?: string,
    categories?: string[]
  }, authToken?: string): Promise<any> {
    try {
      console.log(`Updating user profile:`, userData.email);
      
      const url = this.createUrl('user/profile');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) throw new Error('Failed to update user profile');
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update profile');
      }

      console.log(`User profile updated:`, result.user);
      return result;
    } catch (error) {
      console.error('Update user profile failed:', error);
      throw error;
    }
  }

  async deleteUserAccount(email: string, authToken?: string): Promise<any> {
    try {
      console.log(`Deleting user account:`, email);
      
      const url = this.createUrl('user/delete-account');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.text();
          if (errorData) {
            try {
              const parsedError = JSON.parse(errorData);
              errorMessage = parsedError.error || parsedError.message || errorMessage;
            } catch {
              errorMessage = errorData || errorMessage;
            }
          }
        } catch {
          // Use status text if can't read response
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete account');
      }

      console.log(`User account deleted:`, email);
      return result;
    } catch (error) {
      console.error('Delete user account failed:', error);
      throw error;
    }
  }

  async exportUserData(email: string, authToken?: string): Promise<Blob> {
    try {
      console.log(`Exporting data for:`, email);
      
      const url = this.createUrl(`user/export-data/${encodeURIComponent(email)}`);
      const headers: Record<string, string> = {};
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to export data');
      }
      
      console.log(`Data exported successfully for:`, email);
      return await response.blob();
    } catch (error) {
      console.error('Export user data failed:', error);
      throw error;
    }
  }

  async ensureUserSpreadsheet(email: string): Promise<string | null> {
    try {
      console.log(`Ensuring spreadsheet exists for: ${email}`);
      
      const url = this.createUrl('user/ensure-spreadsheet');
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) throw new Error('Failed to ensure user spreadsheet');
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create spreadsheet');
      }

      console.log(`Spreadsheet ensured: ${result.spreadsheetId}`);
      return result.spreadsheetId;
    } catch (error) {
      console.error('Ensure user spreadsheet failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async verifyGoogleToken(idToken: string): Promise<any> {
    try {
      console.log(`Verifying Google token`);
      
      const url = this.createUrl('auth/verify');
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ idToken })
      });
      
      if (!response.ok) throw new Error('Failed to verify Google token');
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Token verification failed');
      }

      console.log(`Google token verified`);
      return result;
    } catch (error) {
      console.error('Google token verification failed:', error);
      throw error;
    }
  }

  // Receipt analysis
  async analyzeReceipt(photo: File): Promise<AnalysisResult> {
    try {
      const formData = new FormData();
      formData.append('photo', photo);
      
      const url = this.createUrl('analyze-receipt');
      console.log(`Analyzing receipt at: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Failed to analyze receipt');
      
      const result = await response.json();
      return result.analysis;
    } catch (error) {
      console.error('Analyze receipt failed:', error);
      throw error;
    }
  }

  // Clear user's personal data (for testing)
  async clearUserData(userEmail: string): Promise<any> {
    try {
      console.log(`Clearing data for: ${userEmail}`);
      
      const url = this.createUrl('clear-data');
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail })
      });
      
      if (!response.ok) throw new Error('Failed to clear user data');
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to clear data');
      }

      console.log(`Data cleared for: ${userEmail}`);
      return result;
    } catch (error) {
      console.error('Clear user data failed:', error);
      throw error;
    }
  }

  // System info methods
  async getSystemHealth(): Promise<any> {
    try {
      const url = this.createUrl('health');
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to get system health');
      return await response.json();
    } catch (error) {
      console.error('Get system health failed:', error);
      throw error;
    }
  }

  async getSystemConfig(): Promise<any> {
    try {
      const url = this.createUrl('config');
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to get system config');
      return await response.json();
    } catch (error) {
      console.error('Get system config failed:', error);
      throw error;
    }
  }

  // Debug helper
  public debugUrls(): void {
    if (isDevelopment()) {
      console.table({
        'Base API URL': this.baseUrl,
        'Health Check': this.createUrl('health'),
        'Register User': this.createUrl('user/register'),
        'Verify Auth': this.createUrl('auth/verify'),
        'Save Expense': this.createUrl('save-expense'),
        'Analyze Receipt': this.createUrl('analyze-receipt')
      });
    }
  }
}

// Create and export singleton instance
const apiService = new ApiService();

// Debug URLs in development
if (isDevelopment()) {
  apiService.debugUrls();
}

export default apiService;