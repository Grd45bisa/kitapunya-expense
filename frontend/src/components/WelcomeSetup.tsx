// components/WelcomeSetup.tsx - Complete Modern Design with Language Support

import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './styles/WelcomeSetup.module.css';

interface WelcomeSetupProps {
  userInfo: any;
  onComplete: (setupData: any) => void;
  onSkip: () => void;
}

const WelcomeSetup: React.FC<WelcomeSetupProps> = ({
  userInfo,
  onComplete,
  onSkip
}) => {
  const { t, language, formatCurrency } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [setupData, setSetupData] = useState({
    nickname: userInfo?.name?.split(' ')[0] || '',
    purpose: '',
    monthlyBudget: '',
    categories: [] as string[]
  });

  const purposes = [
    {
      id: 'personal',
      title: t.setup.purposeOptions.personal.title,
      description: t.setup.purposeOptions.personal.desc,
      icon: 'fas fa-user',
      color: '#8B5CF6'
    },
    {
      id: 'family',
      title: t.setup.purposeOptions.family.title,
      description: t.setup.purposeOptions.family.desc,
      icon: 'fas fa-home',
      color: '#10B981'
    },
    {
      id: 'business',
      title: t.setup.purposeOptions.business.title,
      description: t.setup.purposeOptions.business.desc,
      icon: 'fas fa-briefcase',
      color: '#F59E0B'
    },
    {
      id: 'student',
      title: t.setup.purposeOptions.student.title,
      description: t.setup.purposeOptions.student.desc,
      icon: 'fas fa-graduation-cap',
      color: '#3B82F6'
    },
    {
      id: 'travel',
      title: t.setup.purposeOptions.travel.title,
      description: t.setup.purposeOptions.travel.desc,
      icon: 'fas fa-plane',
      color: '#EF4444'
    },
    {
      id: 'investment',
      title: t.setup.purposeOptions.investment.title,
      description: t.setup.purposeOptions.investment.desc,
      icon: 'fas fa-chart-line',
      color: '#06B6D4'
    }
  ];

  const defaultCategories = [
    { key: 'food', label: t.expense.categories.food, icon: 'fas fa-utensils', color: '#EF4444' },
    { key: 'transport', label: t.expense.categories.transport, icon: 'fas fa-car', color: '#3B82F6' },
    { key: 'shopping', label: t.expense.categories.shopping, icon: 'fas fa-shopping-bag', color: '#F59E0B' },
    { key: 'entertainment', label: t.expense.categories.entertainment, icon: 'fas fa-gamepad', color: '#8B5CF6' },
    { key: 'health', label: t.expense.categories.health, icon: 'fas fa-heart', color: '#EF4444' },
    { key: 'education', label: t.expense.categories.education, icon: 'fas fa-book', color: '#10B981' },
    { key: 'bills', label: t.expense.categories.bills, icon: 'fas fa-file-invoice', color: '#6B7280' },
    { key: 'others', label: t.expense.categories.others, icon: 'fas fa-ellipsis-h', color: '#8B5CF6' }
  ];

  useEffect(() => {
    // Auto-focus nickname input when component mounts
    const nicknameInput = document.getElementById('nickname-input');
    if (nicknameInput && currentStep === 1) {
      setTimeout(() => nicknameInput.focus(), 300);
    }
  }, [currentStep]);

  const handleInputChange = (field: string, value: any) => {
    setSetupData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategoryToggle = (categoryKey: string) => {
    setSetupData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryKey)
        ? prev.categories.filter(c => c !== categoryKey)
        : [...prev.categories, categoryKey]
    }));
  };

  const formatBudgetInput = (value: string) => {
    // Remove non-digits
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    
    // Add thousand separators
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBudgetInput(e.target.value);
    handleInputChange('monthlyBudget', formatted);
  };

  const handleNext = async () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      await handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    const finalData = {
      ...setupData,
      monthlyBudget: setupData.monthlyBudget.replace(/\./g, ''), // Remove dots for storage
      categories: setupData.categories.length > 0 ? setupData.categories : defaultCategories.map(c => c.key)
    };
    
    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onComplete(finalData);
  };

  const handleSkipSetup = async () => {
    setIsLoading(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSkip();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return setupData.nickname.trim().length >= 2;
      case 2:
        return setupData.purpose.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const getSelectedPurpose = () => {
    return purposes.find(p => p.id === setupData.purpose);
  };

  const renderStep1 = () => (
    <div className={styles.stepContent}>
      <div className={styles.stepHeader}>
        <div className={styles.welcomeIcon}>
          {userInfo?.picture ? (
            <img src={userInfo.picture} alt="Profile" className={styles.userPhoto} />
          ) : (
            <div className={styles.defaultAvatar}>
              <i className="fas fa-user"></i>
            </div>
          )}
        </div>
        <h2>{t.setup.greeting}</h2>
        <p>{t.setup.howToCall}</p>
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="nickname-input">{t.setup.nickname}</label>
        <div className={styles.inputWrapper}>
          <input
            id="nickname-input"
            type="text"
            placeholder={language === 'id' ? 'Contoh: Budi, Sarah, Pak Anton...' : 'Example: John, Sarah, Mr. Smith...'}
            value={setupData.nickname}
            onChange={(e) => handleInputChange('nickname', e.target.value)}
            className={styles.textInput}
            maxLength={30}
          />
          <div className={styles.inputIcon}>
            <i className="fas fa-user"></i>
          </div>
        </div>
        <span className={styles.inputHelp}>
          {t.setup.nicknameHelper}
        </span>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className={styles.stepContent}>
      <div className={styles.stepHeader}>
        <h2>{t.setup.purpose}</h2>
        <p>{t.setup.purposeHelper}</p>
      </div>

      <div className={styles.purposeGrid}>
        {purposes.map((purpose) => (
          <button
            key={purpose.id}
            className={`${styles.purposeCard} ${
              setupData.purpose === purpose.id ? styles.selected : ''
            }`}
            onClick={() => handleInputChange('purpose', purpose.id)}
            style={{
              '--purpose-color': purpose.color
            } as React.CSSProperties}
          >
            <div className={styles.purposeIcon} style={{ backgroundColor: purpose.color }}>
              <i className={purpose.icon}></i>
            </div>
            <div className={styles.purposeContent}>
              <h3>{purpose.title}</h3>
              <p>{purpose.description}</p>
            </div>
            {setupData.purpose === purpose.id && (
              <div className={styles.selectedIndicator}>
                <i className="fas fa-check"></i>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className={styles.stepContent}>
      <div className={styles.stepHeader}>
        <h2>{t.setup.optionalSettings}</h2>
        <p>{language === 'id' ? 'Pengaturan ini bisa dilewati dan diubah nanti di menu Settings' : 'These settings can be skipped and changed later in Settings'}</p>
      </div>

      <div className={styles.optionalSettings}>
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>
              <i className="fas fa-wallet"></i>
            </div>
            <div className={styles.cardTitle}>
              <h3>{t.setup.monthlyBudget}</h3>
              <p>{t.setup.budgetHelper}</p>
            </div>
          </div>
          
          <div className={styles.budgetInputWrapper}>
            <span className={styles.currencySymbol}>Rp</span>
            <input
              type="text"
              placeholder="0"
              value={setupData.monthlyBudget}
              onChange={handleBudgetChange}
              className={styles.budgetInput}
            />
          </div>
          
          {setupData.monthlyBudget && (
            <div className={styles.budgetPreview}>
              <span>{language === 'id' ? 'Target bulanan' : 'Monthly target'}: <strong>Rp {formatCurrency(parseInt(setupData.monthlyBudget.replace(/\./g, '')) || 0)}</strong></span>
            </div>
          )}
        </div>

        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>
              <i className="fas fa-tags"></i>
            </div>
            <div className={styles.cardTitle}>
              <h3>{t.setup.favoriteCategories}</h3>
              <p>{t.setup.categoriesHelper}</p>
            </div>
          </div>
          
          <div className={styles.categoryGrid}>
            {defaultCategories.map((category) => (
              <button
                key={category.key}
                className={`${styles.categoryChip} ${
                  setupData.categories.includes(category.key) ? styles.selected : ''
                }`}
                onClick={() => handleCategoryToggle(category.key)}
                style={{
                  '--category-color': category.color
                } as React.CSSProperties}
              >
                <div className={styles.categoryIcon} style={{ backgroundColor: category.color }}>
                  <i className={category.icon}></i>
                </div>
                <span style={{ color: category.color }}>{category.label}</span>
              </button>
            ))}
          </div>
          
          <div className={styles.categoryStatus}>
            {setupData.categories.length === 0 ? (
              <span className={styles.noSelection}>{t.setup.noCategoriesSelected}</span>
            ) : (
              <span className={styles.hasSelection}>
                {setupData.categories.length} {t.setup.categoriesSelected}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSummary = () => {
    const selectedPurpose = getSelectedPurpose();
    const budgetAmount = parseInt(setupData.monthlyBudget.replace(/\./g, '')) || 0;
    
    return (
      <div className={styles.summarySection}>
        <h3>{language === 'id' ? 'Ringkasan Setup' : 'Setup Summary'}</h3>
        
        <div className={styles.summaryCard}>
          <div className={styles.summaryItem}>
            <i className="fas fa-user"></i>
            <span>{language === 'id' ? 'Nama' : 'Name'}: <strong>{setupData.nickname}</strong></span>
          </div>
          
          {selectedPurpose && (
            <div className={styles.summaryItem}>
              <i className={selectedPurpose.icon} style={{ color: selectedPurpose.color }}></i>
              <span>{language === 'id' ? 'Tujuan' : 'Purpose'}: <strong>{selectedPurpose.title}</strong></span>
            </div>
          )}
          
          {budgetAmount > 0 && (
            <div className={styles.summaryItem}>
              <i className="fas fa-wallet"></i>
              <span>{language === 'id' ? 'Budget' : 'Budget'}: <strong>Rp {formatCurrency(budgetAmount)}</strong></span>
            </div>
          )}
          
          <div className={styles.summaryItem}>
            <i className="fas fa-tags"></i>
            <span>
              {language === 'id' ? 'Kategori' : 'Categories'}: <strong>
                {setupData.categories.length > 0 ? setupData.categories.length : defaultCategories.length} {language === 'id' ? 'kategori' : 'categories'}
              </strong>
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.setupContainer}>
      <div className={styles.setupCard}>
        {/* Progress Bar */}
        <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            <div className={styles.progressTrack}>
              <div 
                className={styles.progressFill}
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </div>
          <div className={styles.progressInfo}>
            <span className={styles.progressText}>
              {t.setup.step} {currentStep} {t.setup.of} 3
            </span>
            <div className={styles.stepDots}>
              {[1, 2, 3].map(step => (
                <div 
                  key={step} 
                  className={`${styles.stepDot} ${step <= currentStep ? styles.active : ''}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className={styles.userInfo}>
          <div className={styles.userEmail}>
            <i className="fas fa-envelope"></i>
            <span>{userInfo?.email}</span>
          </div>
        </div>

        {/* Step Content */}
        <div className={styles.contentArea}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          
          {currentStep === 3 && renderSummary()}
        </div>

        {/* Navigation */}
        <div className={styles.navigationSection}>
          <div className={styles.navigationButtons}>
            <div className={styles.leftButtons}>
              {currentStep > 1 && (
                <button 
                  className={styles.backButton}
                  onClick={handleBack}
                  disabled={isLoading}
                >
                  <i className="fas fa-arrow-left"></i>
                  {t.common.back}
                </button>
              )}
            </div>

            <div className={styles.rightButtons}>
              <button 
                className={styles.skipButton}
                onClick={handleSkipSetup}
                disabled={isLoading}
              >
                {isLoading && currentStep === 3 ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    {t.common.loading}...
                  </>
                ) : (
                  t.common.skip
                )}
              </button>
              
              <button
                className={`${styles.nextButton} ${!canProceed() || isLoading ? styles.disabled : ''}`}
                onClick={handleNext}
                disabled={!canProceed() || isLoading}
              >
                {isLoading && currentStep === 3 ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    {t.common.loading}...
                  </>
                ) : currentStep === 3 ? (
                  <>
                    <i className="fas fa-check"></i>
                    {t.common.finish}
                  </>
                ) : (
                  <>
                    {t.common.next}
                    <i className="fas fa-arrow-right"></i>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className={styles.backgroundElements}>
        <div className={`${styles.floatingElement} ${styles.element1}`}></div>
        <div className={`${styles.floatingElement} ${styles.element2}`}></div>
        <div className={`${styles.floatingElement} ${styles.element3}`}></div>
      </div>
    </div>
  );
};

export default WelcomeSetup;