// contexts/LanguageContext.tsx - Simplified with Rupiah only
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Translation type definitions (simplified)
interface Translations {
  common: {
    loading: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    search: string;
    filter: string;
    export: string;
    import: string;
    refresh: string;
    close: string;
    back: string;
    next: string;
    finish: string;
    skip: string;
    confirm: string;
    yes: string;
    no: string;
    all: string;
    none: string;
    select: string;
    selected: string;
    currency: string;
    date: string;
    time: string;
    today: string;
    yesterday: string;
    week: string;
    month: string;
    year: string;
    total: string;
    average: string;
    minimum: string;
    maximum: string;
    saving: string;
  };

  navigation: {
    dashboard: string;
    statistics: string;
    tools: string;
    settings: string;
    home: string;
    profile: string;
    logout: string;
  };

  auth: {
    welcomeTitle: string;
    welcomeSubtitle: string;
    signInTitle: string;
    signInWithGoogle: string;
    tryDemo: string;
    orDivider: string;
    termsAndConditions: string;
    privacyPolicy: string;
    bySigningIn: string;
    securityNote: string;
    features: {
      realTimeAnalysis: string;
      autoSpreadsheet: string;
      multiPlatform: string;
      secureData: string;
    };
  };

  setup: {
    greeting: string;
    howToCall: string;
    nickname: string;
    nicknameHelper: string;
    purpose: string;
    purposeHelper: string;
    purposeOptions: {
      personal: { title: string; desc: string };
      family: { title: string; desc: string };
      business: { title: string; desc: string };
      student: { title: string; desc: string };
      travel: { title: string; desc: string };
      investment: { title: string; desc: string };
    };
    optionalSettings: string;
    monthlyBudget: string;
    budgetHelper: string;
    favoriteCategories: string;
    categoriesHelper: string;
    noCategoriesSelected: string;
    categoriesSelected: string;
    step: string;
    of: string;
  };

  dashboard: {
    goodMorning: string;
    goodAfternoon: string;
    goodEvening: string;
    goodNight: string;
    manageWisely: string;
    monthSummary: string;
    totalExpense: string;
    budgetUsage: string;
    todayExpense: string;
    remainingBudget: string;
    overBudget: string;
    transactions: string;
    categories: string;
    categoryBreakdown: string;
    recentTransactions: string;
    viewAllTransactions: string;
    noTransactions: string;
    addFirstExpense: string;
    from: string;
  };

  statistics: {
    expenseAnalysis: string;
    totalExpenses: string;
    biggestTransaction: string;
    totalTransactions: string;
    periodLabel: string;
    chart: string;
    list: string;
    expenseChart: string;
    categoryBreakdown: string;
    transactionDetails: string;
    budgetComparison: string;
    monthlyBudget: string;
    used: string;
    remaining: string;
    highest: string;
    lowest: string;
    noData: string;
    noCategory: string;
    moreCategories: string;
  };

  tools: {
    title: string;
    subtitle: string;
    financial: string;
    analysis: string;
    planning: string;
    comingSoon: string;
    open: string;
    quickActions: string;
    recurringExpenses: string;
    recurringDesc: string;
    splitBill: string;
    splitBillDesc: string;
    budgetPlanner: string;
    budgetPlannerDesc: string;
    detailedReports: string;
    detailedReportsDesc: string;
    smartInsights: string;
    smartInsightsDesc: string;
    comparison: string;
    comparisonDesc: string;
    savingTargets: string;
    savingTargetsDesc: string;
    receiptArchive: string;
    receiptArchiveDesc: string;
    calculator: string;
    calculatorDesc: string;
    exportData: string;
    backup: string;
    shareReport: string;
    help: string;
  };

  settings: {
    title: string;
    subtitle: string;
    profile: string;
    preferences: string;
    dataSecurity: string;
    username: string;
    email: string;
    monthlyBudget: string;
    currency: string;
    changePhoto: string;
    saveChanges: string;
    saving: string;
    saved: string;
    notifications: string;
    notificationsDesc: string;
    darkMode: string;
    darkModeDesc: string;
    autoBackup: string;
    autoBackupDesc: string;
    language: string;
    languageDesc: string;
    manageData: string;
    dangerZone: string;
    logout: string;
    logoutDesc: string;
    deleteAccount: string;
    deleteAccountDesc: string;
    deleteConfirmation: string;
    typeToConfirm: string;
    permanentDelete: string;
    deleting: string;
    warning: string;
    cannotBeUndone: string;
    deleteWarnings: {
      profile: string;
      history: string;
      spreadsheet: string;
    };
  };

  expense: {
    addExpense: string;
    editExpense: string;
    storeName: string;
    category: string;
    amount: string;
    date: string;
    address: string;
    notes: string;
    uploadReceipt: string;
    analyzeReceipt: string;
    analyzing: string;
    photoRequired: string;
    dragDropFile: string;
    clickToUpload: string;
    maxFileSize: string;
    deleteImage: string;
    zoomImage: string;
    dragToMove: string;
    categories: {
      food: string;
      transport: string;
      shopping: string;
      entertainment: string;
      health: string;
      education: string;
      bills: string;
      others: string;
    };
    placeholders: {
      storeName: string;
      amount: string;
      address: string;
      notes: string;
    };
  };

  notifications: {
    success: {
      saved: string;
      deleted: string;
      updated: string;
      exported: string;
      imported: string;
      loginSuccess: string;
      logoutSuccess: string;
      setupComplete: string;
      analyzed: string;
    };
    error: {
      saveFailed: string;
      deleteFailed: string;
      updateFailed: string;
      exportFailed: string;
      importFailed: string;
      loginFailed: string;
      analysisFailed: string;
      connectionLost: string;
    };
    warning: {
      offlineMode: string;
      unsavedChanges: string;
      confirmDelete: string;
      confirmLogout: string;
    };
    info: {
      loading: string;
      processing: string;
      syncing: string;
    };
  };

  status: {
    online: string;
    offline: string;
    connecting: string;
    synced: string;
    syncing: string;
    unsyncedData: string;
  };

  months: {
    january: string;
    february: string;
    march: string;
    april: string;
    may: string;
    june: string;
    july: string;
    august: string;
    september: string;
    october: string;
    november: string;
    december: string;
  };

  days: {
    sunday: string;
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sun: string;
    mon: string;
    tue: string;
    wed: string;
    thu: string;
    fri: string;
    sat: string;
  };
}

// Indonesian translations (default)
const indonesianTranslations: Translations = {
  common: {
    loading: 'Memuat',
    save: 'Simpan',
    cancel: 'Batal',
    delete: 'Hapus',
    edit: 'Ubah',
    add: 'Tambah',
    search: 'Cari',
    filter: 'Filter',
    export: 'Ekspor',
    import: 'Impor',
    refresh: 'Segarkan',
    close: 'Tutup',
    back: 'Kembali',
    next: 'Lanjut',
    finish: 'Selesai',
    skip: 'Lewati',
    confirm: 'Konfirmasi',
    yes: 'Ya',
    no: 'Tidak',
    all: 'Semua',
    none: 'Tidak ada',
    select: 'Pilih',
    selected: 'Dipilih',
    currency: 'Mata Uang',
    date: 'Tanggal',
    time: 'Waktu',
    today: 'Hari ini',
    yesterday: 'Kemarin',
    week: 'Minggu',
    month: 'Bulan',
    year: 'Tahun',
    total: 'Total',
    average: 'Rata-rata',
    minimum: 'Minimum',
    maximum: 'Maksimum',
    saving: 'Menyimpan',
  },

  navigation: {
    dashboard: 'Beranda',
    statistics: 'Statistik',
    tools: 'Alat',
    settings: 'Pengaturan',
    home: 'Beranda',
    profile: 'Profil',
    logout: 'Keluar',
  },

  auth: {
    welcomeTitle: 'Kita Punya Catatan',
    welcomeSubtitle: 'Platform pencatatan keuangan dengan spreadsheet personal otomatis',
    signInTitle: 'Mulai Catat Pengeluaran Anda',
    signInWithGoogle: 'Masuk dengan Google',
    tryDemo: 'Coba Demo (Tanpa Login)',
    orDivider: 'atau',
    termsAndConditions: 'Syarat & Ketentuan',
    privacyPolicy: 'Kebijakan Privasi',
    bySigningIn: 'Dengan masuk, Anda menyetujui',
    securityNote: 'Data aman tersimpan di Google Sheets personal',
    features: {
      realTimeAnalysis: 'Analisis Real-time',
      autoSpreadsheet: 'Spreadsheet Otomatis',
      multiPlatform: 'Multi-Platform',
      secureData: 'Data Aman',
    },
  },

  setup: {
    greeting: 'Halo! Senang bertemu Anda 👋',
    howToCall: 'Bagaimana Anda ingin dipanggil?',
    nickname: 'Nama Panggilan',
    nicknameHelper: 'Nama ini akan muncul di dashboard Anda',
    purpose: 'Tujuan Penggunaan',
    purposeHelper: 'Pilih yang paling sesuai dengan kebutuhan Anda',
    purposeOptions: {
      personal: { title: 'Pribadi', desc: 'Keuangan sehari-hari' },
      family: { title: 'Keluarga', desc: 'Rumah tangga' },
      business: { title: 'Bisnis', desc: 'Usaha kecil' },
      student: { title: 'Pelajar', desc: 'Uang saku kuliah' },
      travel: { title: 'Travel', desc: 'Perjalanan liburan' },
      investment: { title: 'Investasi', desc: 'Dana investasi' },
    },
    optionalSettings: 'Pengaturan Opsional',
    monthlyBudget: 'Target Bulanan (Opsional)',
    budgetHelper: 'Membantu memantau pengeluaran bulanan',
    favoriteCategories: 'Kategori Favorit',
    categoriesHelper: 'Pilih kategori yang sering Anda gunakan',
    noCategoriesSelected: 'Tidak ada yang dipilih? Semua kategori akan tersedia',
    categoriesSelected: 'kategori dipilih',
    step: 'Langkah',
    of: 'dari',
  },

  dashboard: {
    goodMorning: 'Selamat Pagi',
    goodAfternoon: 'Selamat Siang',
    goodEvening: 'Selamat Sore',
    goodNight: 'Selamat Malam',
    manageWisely: 'Kelola pengeluaran dengan bijak hari ini',
    monthSummary: 'Ringkasan Bulan Ini',
    totalExpense: 'Total Pengeluaran',
    budgetUsage: 'Penggunaan Budget',
    todayExpense: 'Pengeluaran Hari Ini',
    remainingBudget: 'Sisa Budget',
    overBudget: 'Melebihi Budget',
    transactions: 'Transaksi',
    categories: 'Kategori',
    categoryBreakdown: 'Breakdown pengeluaran bulan ini',
    recentTransactions: 'Transaksi Terbaru',
    viewAllTransactions: 'Lihat Semua Transaksi',
    noTransactions: 'Belum ada pengeluaran',
    addFirstExpense: 'Klik tombol + untuk menambahkan pengeluaran pertama Anda',
    from: 'dari',
  },

  statistics: {
    expenseAnalysis: 'Analisis Pengeluaran',
    totalExpenses: 'Total Pengeluaran',
    biggestTransaction: 'Transaksi Terbesar',
    totalTransactions: 'Total Transaksi',
    periodLabel: 'Periode',
    chart: 'Grafik',
    list: 'Daftar',
    expenseChart: 'Grafik Pengeluaran',
    categoryBreakdown: 'Breakdown Kategori',
    transactionDetails: 'Detail Transaksi',
    budgetComparison: 'Perbandingan Budget',
    monthlyBudget: 'Budget Bulanan',
    used: 'Sudah Terpakai',
    remaining: 'Sisa',
    highest: 'Tertinggi',
    lowest: 'Terendah',
    noData: 'Tidak ada data untuk periode ini',
    noCategory: 'Belum ada kategori pengeluaran',
    moreCategories: 'kategori lainnya',
  },

  tools: {
    title: 'Alat & Fitur',
    subtitle: 'Fitur tambahan untuk memaksimalkan pengelolaan keuangan Anda',
    financial: 'Keuangan',
    analysis: 'Analisis',
    planning: 'Perencanaan',
    comingSoon: 'Segera Hadir',
    open: 'Buka',
    quickActions: 'Aksi Cepat',
    recurringExpenses: 'Pengeluaran Rutin',
    recurringDesc: 'Kelola tagihan & langganan bulanan',
    splitBill: 'Patungan',
    splitBillDesc: 'Catat & hitung patungan dengan teman',
    budgetPlanner: 'Perencana Budget',
    budgetPlannerDesc: 'Rencana budget untuk event khusus',
    detailedReports: 'Laporan Detail',
    detailedReportsDesc: 'Generate laporan bulanan/tahunan',
    smartInsights: 'Wawasan Cerdas',
    smartInsightsDesc: 'Analisis pengeluaran berbasis AI',
    comparison: 'Perbandingan',
    comparisonDesc: 'Bandingkan antar periode',
    savingTargets: 'Target Tabungan',
    savingTargetsDesc: 'Set & track target tabungan',
    receiptArchive: 'Arsip Struk',
    receiptArchiveDesc: 'Simpan & kelola foto struk',
    calculator: 'Kalkulator',
    calculatorDesc: 'Berbagai kalkulator keuangan',
    exportData: 'Ekspor Data',
    backup: 'Cadangan',
    shareReport: 'Bagikan Laporan',
    help: 'Bantuan',
  },

  settings: {
    title: 'Pengaturan',
    subtitle: 'Kelola akun dan preferensi Anda',
    profile: 'Profil',
    preferences: 'Preferensi',
    dataSecurity: 'Data & Keamanan',
    username: 'Nama Pengguna',
    email: 'Email',
    monthlyBudget: 'Budget Bulanan',
    currency: 'Mata Uang',
    changePhoto: 'Ubah Foto',
    saveChanges: 'Simpan Perubahan',
    saving: 'Menyimpan...',
    saved: 'Tersimpan',
    notifications: 'Notifikasi',
    notificationsDesc: 'Terima pemberitahuan untuk transaksi baru',
    darkMode: 'Mode Gelap',
    darkModeDesc: 'Gunakan tema gelap untuk mengurangi ketegangan mata',
    autoBackup: 'Backup Otomatis',
    autoBackupDesc: 'Simpan data secara otomatis ke cloud',
    language: 'Bahasa',
    languageDesc: 'Pilih bahasa tampilan aplikasi',
    manageData: 'Kelola Data',
    dangerZone: 'Zona Berbahaya',
    logout: 'Keluar dari Akun',
    logoutDesc: 'Anda akan keluar dari aplikasi ini',
    deleteAccount: 'Hapus Akun',
    deleteAccountDesc: 'Hapus akun dan semua data secara permanen',
    deleteConfirmation: 'Konfirmasi Hapus Akun',
    typeToConfirm: 'Untuk konfirmasi, ketik HAPUS AKUN SAYA di bawah:',
    permanentDelete: 'Hapus Permanen',
    deleting: 'Menghapus...',
    warning: 'Peringatan!',
    cannotBeUndone: 'Tindakan ini tidak dapat dibatalkan.',
    deleteWarnings: {
      profile: 'Semua data profil Anda akan dihapus',
      history: 'Riwayat pengeluaran akan hilang permanen',
      spreadsheet: 'Spreadsheet di Google Drive akan dihapus otomatis',
    },
  },

  expense: {
    addExpense: 'Tambah Pengeluaran Baru',
    editExpense: 'Edit Pengeluaran',
    storeName: 'Nama Toko',
    category: 'Kategori',
    amount: 'Total',
    date: 'Tanggal',
    address: 'Alamat Toko',
    notes: 'Catatan Detail',
    uploadReceipt: 'Upload Foto Struk',
    analyzeReceipt: 'Analisa Foto Struk',
    analyzing: 'Menganalisa struk...',
    photoRequired: 'Analisa foto memerlukan koneksi backend',
    dragDropFile: 'Klik atau drag & drop file disini',
    clickToUpload: 'Klik untuk upload',
    maxFileSize: 'JPG, PNG, GIF (Maks. 10MB)',
    deleteImage: 'Hapus gambar',
    zoomImage: 'Zoom gambar',
    dragToMove: 'Drag untuk geser',
    categories: {
      food: 'Makanan',
      transport: 'Transportasi',
      shopping: 'Belanja',
      entertainment: 'Hiburan',
      health: 'Kesehatan',
      education: 'Pendidikan',
      bills: 'Tagihan',
      others: 'Lainnya',
    },
    placeholders: {
      storeName: 'Contoh: BreadTalk, Indomaret, KFC',
      amount: '43500',
      address: 'Contoh: RUKO SUMMARECON BEKASI',
      notes: 'Contoh: Beli Bread Butter Pudding Rp 11.500...',
    },
  },

  notifications: {
    success: {
      saved: 'Pengeluaran berhasil disimpan!',
      deleted: 'Data berhasil dihapus',
      updated: 'Data berhasil diperbarui',
      exported: 'Data berhasil diekspor',
      imported: 'Data berhasil diimpor',
      loginSuccess: 'Selamat datang kembali!',
      logoutSuccess: 'Anda telah keluar',
      setupComplete: 'Setup selesai! Spreadsheet sudah siap.',
      analyzed: 'Analisis struk berhasil',
    },
    error: {
      saveFailed: 'Gagal menyimpan pengeluaran',
      deleteFailed: 'Gagal menghapus data',
      updateFailed: 'Gagal memperbarui data',
      exportFailed: 'Gagal mengekspor data',
      importFailed: 'Gagal mengimpor data',
      loginFailed: 'Login gagal. Silakan coba lagi.',
      analysisFailed: 'Gagal menganalisis struk',
      connectionLost: 'Koneksi terputus',
    },
    warning: {
      offlineMode: 'Mode offline: Data akan disinkronkan saat online',
      unsavedChanges: 'Ada perubahan yang belum disimpan',
      confirmDelete: 'Yakin ingin menghapus?',
      confirmLogout: 'Yakin ingin keluar?',
    },
    info: {
      loading: 'Memuat data...',
      processing: 'Memproses...',
      syncing: 'Menyinkronkan data...',
    },
  },

  status: {
    online: 'Online',
    offline: 'Offline',
    connecting: 'Menghubungkan',
    synced: 'Tersinkronisasi',
    syncing: 'Menyinkronkan',
    unsyncedData: 'Ada data yang belum tersinkronisasi',
  },

  months: {
    january: 'Januari',
    february: 'Februari',
    march: 'Maret',
    april: 'April',
    may: 'Mei',
    june: 'Juni',
    july: 'Juli',
    august: 'Agustus',
    september: 'September',
    october: 'Oktober',
    november: 'November',
    december: 'Desember',
  },

  days: {
    sunday: 'Minggu',
    monday: 'Senin',
    tuesday: 'Selasa',
    wednesday: 'Rabu',
    thursday: 'Kamis',
    friday: 'Jumat',
    saturday: 'Sabtu',
    sun: 'Min',
    mon: 'Sen',
    tue: 'Sel',
    wed: 'Rab',
    thu: 'Kam',
    fri: 'Jum',
    sat: 'Sab',
  },
};

// English translations
const englishTranslations: Translations = {
  common: {
    loading: 'Loading',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    import: 'Import',
    refresh: 'Refresh',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    finish: 'Finish',
    skip: 'Skip',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    all: 'All',
    none: 'None',
    select: 'Select',
    selected: 'Selected',
    currency: 'Currency',
    date: 'Date',
    time: 'Time',
    today: 'Today',
    yesterday: 'Yesterday',
    week: 'Week',
    month: 'Month',
    year: 'Year',
    total: 'Total',
    average: 'Average',
    minimum: 'Minimum',
    maximum: 'Maximum',
    saving: 'Saving',
  },

  navigation: {
    dashboard: 'Dashboard',
    statistics: 'Statistics',
    tools: 'Tools',
    settings: 'Settings',
    home: 'Home',
    profile: 'Profile',
    logout: 'Logout',
  },

  auth: {
    welcomeTitle: 'Expense Tracker',
    welcomeSubtitle: 'Financial tracking platform with automatic personal spreadsheet',
    signInTitle: 'Start Tracking Your Expenses',
    signInWithGoogle: 'Sign in with Google',
    tryDemo: 'Try Demo (No Login)',
    orDivider: 'or',
    termsAndConditions: 'Terms & Conditions',
    privacyPolicy: 'Privacy Policy',
    bySigningIn: 'By signing in, you agree to our',
    securityNote: 'Data securely stored in personal Google Sheets',
    features: {
      realTimeAnalysis: 'Real-time Analysis',
      autoSpreadsheet: 'Auto Spreadsheet',
      multiPlatform: 'Multi-Platform',
      secureData: 'Secure Data',
    },
  },

  setup: {
    greeting: 'Hello! Nice to meet you 👋',
    howToCall: 'What should we call you?',
    nickname: 'Nickname',
    nicknameHelper: 'This name will appear on your dashboard',
    purpose: 'Purpose of Use',
    purposeHelper: 'Choose what best fits your needs',
    purposeOptions: {
      personal: { title: 'Personal', desc: 'Daily finance' },
      family: { title: 'Family', desc: 'Household' },
      business: { title: 'Business', desc: 'Small business' },
      student: { title: 'Student', desc: 'Student allowance' },
      travel: { title: 'Travel', desc: 'Vacation trips' },
      investment: { title: 'Investment', desc: 'Investment funds' },
    },
    optionalSettings: 'Optional Settings',
    monthlyBudget: 'Monthly Target (Optional)',
    budgetHelper: 'Helps monitor monthly expenses',
    favoriteCategories: 'Favorite Categories',
    categoriesHelper: 'Choose categories you use frequently',
    noCategoriesSelected: 'Nothing selected? All categories will be available',
    categoriesSelected: 'categories selected',
    step: 'Step',
    of: 'of',
  },

  dashboard: {
    goodMorning: 'Good Morning',
    goodAfternoon: 'Good Afternoon',
    goodEvening: 'Good Evening',
    goodNight: 'Good Night',
    manageWisely: 'Manage your expenses wisely today',
    monthSummary: "This Month's Summary",
    totalExpense: 'Total Expenses',
    budgetUsage: 'Budget Usage',
    todayExpense: "Today's Expenses",
    remainingBudget: 'Remaining Budget',
    overBudget: 'Over Budget',
    transactions: 'Transactions',
    categories: 'Categories',
    categoryBreakdown: "This month's expense breakdown",
    recentTransactions: 'Recent Transactions',
    viewAllTransactions: 'View All Transactions',
    noTransactions: 'No expenses yet',
    addFirstExpense: 'Click the + button to add your first expense',
    from: 'from',
  },

  statistics: {
    expenseAnalysis: 'Expense Analysis',
    totalExpenses: 'Total Expenses',
    biggestTransaction: 'Biggest Transaction',
    totalTransactions: 'Total Transactions',
    periodLabel: 'Period',
    chart: 'Chart',
    list: 'List',
    expenseChart: 'Expense Chart',
    categoryBreakdown: 'Category Breakdown',
    transactionDetails: 'Transaction Details',
    budgetComparison: 'Budget Comparison',
    monthlyBudget: 'Monthly Budget',
    used: 'Used',
    remaining: 'Remaining',
    highest: 'Highest',
    lowest: 'Lowest',
    noData: 'No data for this period',
    noCategory: 'No expense categories yet',
    moreCategories: 'more categories',
  },

  tools: {
    title: 'Tools & Features',
    subtitle: 'Additional features to maximize your financial management',
    financial: 'Financial',
    analysis: 'Analysis',
    planning: 'Planning',
    comingSoon: 'Coming Soon',
    open: 'Open',
    quickActions: 'Quick Actions',
    recurringExpenses: 'Recurring Expenses',
    recurringDesc: 'Manage monthly bills & subscriptions',
    splitBill: 'Split Bill',
    splitBillDesc: 'Track & calculate split bills with friends',
    budgetPlanner: 'Budget Planner',
    budgetPlannerDesc: 'Budget plans for special events',
    detailedReports: 'Detailed Reports',
    detailedReportsDesc: 'Generate monthly/yearly reports',
    smartInsights: 'Smart Insights',
    smartInsightsDesc: 'AI-powered expense analysis',
    comparison: 'Comparison',
    comparisonDesc: 'Compare between periods',
    savingTargets: 'Saving Targets',
    savingTargetsDesc: 'Set & track saving targets',
    receiptArchive: 'Receipt Archive',
    receiptArchiveDesc: 'Save & manage receipt photos',
    calculator: 'Calculator',
    calculatorDesc: 'Various financial calculators',
    exportData: 'Export Data',
    backup: 'Backup',
    shareReport: 'Share Report',
    help: 'Help',
  },

  settings: {
    title: 'Settings',
    subtitle: 'Manage your account and preferences',
    profile: 'Profile',
    preferences: 'Preferences',
    dataSecurity: 'Data & Security',
    username: 'Username',
    email: 'Email',
    monthlyBudget: 'Monthly Budget',
    currency: 'Currency',
    changePhoto: 'Change Photo',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    saved: 'Saved',
    notifications: 'Notifications',
    notificationsDesc: 'Receive notifications for new transactions',
    darkMode: 'Dark Mode',
    darkModeDesc: 'Use dark theme to reduce eye strain',
    autoBackup: 'Auto Backup',
    autoBackupDesc: 'Automatically save data to cloud',
    language: 'Language',
    languageDesc: 'Choose application display language',
    manageData: 'Manage Data',
    dangerZone: 'Danger Zone',
    logout: 'Sign Out',
    logoutDesc: 'You will be signed out from this app',
    deleteAccount: 'Delete Account',
    deleteAccountDesc: 'Permanently delete account and all data',
    deleteConfirmation: 'Confirm Account Deletion',
    typeToConfirm: 'To confirm, type DELETE MY ACCOUNT below:',
    permanentDelete: 'Delete Permanently',
    deleting: 'Deleting...',
    warning: 'Warning!',
    cannotBeUndone: 'This action cannot be undone.',
    deleteWarnings: {
      profile: 'All your profile data will be deleted',
      history: 'Expense history will be permanently lost',
      spreadsheet: 'Google Drive spreadsheet will be automatically deleted',
    },
  },

  expense: {
    addExpense: 'Add New Expense',
    editExpense: 'Edit Expense',
    storeName: 'Store Name',
    category: 'Category',
    amount: 'Amount',
    date: 'Date',
    address: 'Store Address',
    notes: 'Detailed Notes',
    uploadReceipt: 'Upload Receipt Photo',
    analyzeReceipt: 'Analyze Receipt',
    analyzing: 'Analyzing receipt...',
    photoRequired: 'Photo analysis requires backend connection',
    dragDropFile: 'Click or drag & drop file here',
    clickToUpload: 'Click to upload',
    maxFileSize: 'JPG, PNG, GIF (Max. 10MB)',
    deleteImage: 'Delete image',
    zoomImage: 'Zoom image',
    dragToMove: 'Drag to move',
    categories: {
      food: 'Food',
      transport: 'Transport',
      shopping: 'Shopping',
      entertainment: 'Entertainment',
      health: 'Health',
      education: 'Education',
      bills: 'Bills',
      others: 'Others',
    },
    placeholders: {
      storeName: 'Example: BreadTalk, Walmart, KFC',
      amount: '43500',
      address: 'Example: Main Street Mall',
      notes: 'Example: Bought groceries for the week...',
    },
  },

  notifications: {
    success: {
      saved: 'Expense saved successfully!',
      deleted: 'Data deleted successfully',
      updated: 'Data updated successfully',
      exported: 'Data exported successfully',
      imported: 'Data imported successfully',
      loginSuccess: 'Welcome back!',
      logoutSuccess: 'You have been signed out',
      setupComplete: 'Setup complete! Spreadsheet is ready.',
      analyzed: 'Receipt analyzed successfully',
    },
    error: {
      saveFailed: 'Failed to save expense',
      deleteFailed: 'Failed to delete data',
      updateFailed: 'Failed to update data',
      exportFailed: 'Failed to export data',
      importFailed: 'Failed to import data',
      loginFailed: 'Login failed. Please try again.',
      analysisFailed: 'Failed to analyze receipt',
      connectionLost: 'Connection lost',
    },
    warning: {
      offlineMode: 'Offline mode: Data will sync when online',
      unsavedChanges: 'You have unsaved changes',
      confirmDelete: 'Are you sure you want to delete?',
      confirmLogout: 'Are you sure you want to sign out?',
    },
    info: {
      loading: 'Loading data...',
      processing: 'Processing...',
      syncing: 'Syncing data...',
    },
  },

  status: {
    online: 'Online',
    offline: 'Offline',
    connecting: 'Connecting',
    synced: 'Synced',
    syncing: 'Syncing',
    unsyncedData: 'You have unsynced data',
  },

  months: {
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December',
  },

  days: {
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sun: 'Sun',
    mon: 'Mon',
    tue: 'Tue',
    wed: 'Wed',
    thu: 'Thu',
    fri: 'Fri',
    sat: 'Sat',
  },
};

// Language type
export type Language = 'id' | 'en';

// Context type
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string | Date) => string;
  formatMonth: (date: Date) => string;
}

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider component
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize with Indonesian as default
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('preferredLanguage');
    return (saved as Language) || 'id';
  });

  // Get current translations
  const t = language === 'id' ? indonesianTranslations : englishTranslations;

  // Set language and save to localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('preferredLanguage', lang);
  };

  // Currency formatter - Rupiah only
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Date formatter
  const formatDate = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = language === 'id' ? 'id-ID' : 'en-US';
    
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(dateObj);
  };

  // Month formatter
  const formatMonth = (date: Date): string => {
    const locale = language === 'id' ? 'id-ID' : 'en-US';
    
    return new Intl.DateTimeFormat(locale, {
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  // Apply language to document
  useEffect(() => {
    document.documentElement.lang = language;
    
    // Update any meta tags
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        language === 'id' 
          ? 'Platform pencatatan keuangan dengan spreadsheet otomatis'
          : 'Financial tracking platform with automatic spreadsheet'
      );
    }
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    formatCurrency,
    formatDate,
    formatMonth,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};