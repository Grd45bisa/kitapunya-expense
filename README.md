# 🚀 Panduan Instalasi Lengkap

Proyek ini terdiri dari tiga bagian: **backend**, **frontend**, dan **n8n workflow**. Anda perlu menginstall dependencies dan konfigurasi untuk semua komponen.

## 📋 Prerequisites

Sebelum memulai, pastikan Anda telah menginstall:
- Node.js (v16 atau lebih baru)
- npm atau yarn
- Git

## 🛠️ Instalasi n8n

n8n adalah platform otomatisasi workflow yang diperlukan untuk proyek ini. Pilih salah satu metode instalasi berikut:

### Metode 1: Menggunakan npm (Recommended)

```bash
# Install n8n secara global
npm install n8n -g

# Atau install secara lokal di project
npm install n8n
```

### Metode 2: Menggunakan Docker

```bash
# Pull image n8n
docker pull n8nio/n8n

# Jalankan n8n dengan Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### Metode 3: Menggunakan Docker Compose

Buat file `docker-compose.yml`:

```yaml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=password
    volumes:
      - n8n_data:/home/node/.n8n
volumes:
  n8n_data:
```

Kemudian jalankan:
```bash
docker-compose up -d
```

## 🔧 Setup n8n Workflow

1. **Jalankan n8n:**
   ```bash
   # Jika install via npm
   n8n start
   
   # Akses melalui browser di: http://localhost:5678
   ```

2. **Import Workflow:**
   - Buka n8n di browser (http://localhost:5678)
   - Klik tombol "Import" atau "+" untuk workflow baru
   - Upload file `n8n-analyze-receipt.json` yang ada di root project
   - Atau copy-paste isi file JSON tersebut ke dalam n8n

3. **Aktivasi Workflow:**
   - Setelah import berhasil, aktifkan workflow
   - Pastikan semua node terkonfigurasi dengan benar

## 🚀 Setup Backend

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Konfigurasi Environment
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

# n8n Configuration
N8N_WEBHOOK_URL=http://localhost:5678/webhook/analyze-receipt

# Additional Configuration
ENABLE_PHOTO_STORAGE=true
ENABLE_PHOTO_DISPLAY=true
MAX_PHOTO_SIZE=10485760
SUPPORTED_IMAGE_FORMATS=jpeg,jpg,png,webp
```

**⚠️ Penting:** Ganti semua placeholder dengan nilai yang sebenarnya sesuai dengan konfigurasi project Anda.

## 🎨 Setup Frontend

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Konfigurasi Environment (Opsional)
Jika diperlukan, buat file `.env` di folder frontend:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_N8N_URL=http://localhost:5678
```

## 🏃‍♂️ Menjalankan Proyek

### 1. Start n8n (Terminal 1)
```bash
# Jika menggunakan npm
n8n start

# Jika menggunakan Docker
docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n

# Jika menggunakan Docker Compose
docker-compose up
```

### 2. Start Backend Server (Terminal 2)
```bash
cd backend
npm run dev
```

### 3. Start Frontend Application (Terminal 3)
```bash
cd frontend
npm run dev
```

## 🌐 Akses Aplikasi

Setelah semua service berjalan, Anda dapat mengakses:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **n8n Interface:** http://localhost:5678

## 🔍 Troubleshooting

### n8n Issues:
- Pastikan port 5678 tidak digunakan aplikasi lain
- Periksa file workflow `n8n-analyze-receipt.json` sudah di-import dengan benar
- Verifikasi webhook URL di konfigurasi backend

### Backend Issues:
- Pastikan semua environment variables sudah diset dengan benar
- Periksa koneksi ke Google Services
- Verifikasi Firebase configuration

### Frontend Issues:
- Clear browser cache jika ada masalah loading
- Pastikan backend sudah running sebelum start frontend
- Periksa console browser untuk error messages

## 📁 Struktur Project

```
project-root/
├── backend/
│   ├── src/
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   ├── .env (optional)
│   └── package.json
├── n8n-analyze-receipt.json
└── README.md
```

## 📄 License

[Tambahkan informasi lisensi di sini]

## 🤝 Contributing

[Tambahkan panduan kontribusi di sini]

## 📞 Support

Jika mengalami masalah, silakan buat issue di repository atau hubungi tim development.
