## 🚀 Installation

Proyek ini terdiri dari dua bagian: **backend** dan **frontend**. Anda perlu menginstall dependencies untuk kedua folder.

### 1. Setup Backend

```bash
cd backend
npm install
```

Buat file `.env` di folder backend dan isi dengan konfigurasi yang diperlukan:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Firebase Authentication
FIREBASE_SERVICE_ACCOUNT=your_firebase_service_account_json_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Google Services Configuration
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key

# Google Sheets & Drive
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_DRIVE_FOLDER_ID=your_drive_folder_id

# Additional Configuration
ENABLE_PHOTO_STORAGE=true
ENABLE_PHOTO_DISPLAY=true
MAX_PHOTO_SIZE=10485760
SUPPORTED_IMAGE_FORMATS=jpeg,jpg,png,webp
```

**⚠️ Penting:** Ganti semua placeholder dengan nilai yang sebenarnya sesuai dengan konfigurasi project Anda.

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

## 🏃‍♂️ Running the Project

### Start Backend Server

```bash
cd backend
npm run dev
```

### Start Frontend Application

Buka terminal baru, lalu jalankan:

```bash
cd frontend
npm run dev
```
## 📄 License

[Tambahkan informasi lisensi di sini]
