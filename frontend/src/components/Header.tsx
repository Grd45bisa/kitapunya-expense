// components/Header.tsx
import { useLanguage } from '../contexts/LanguageContext';
import styles from './styles/Header.module.css';

interface HeaderProps {
  monthlyTotal: number;
  userName: string;
  userPicture?: string;
  todayTotal?: number;
  remainingBudget?: number;
  monthlyBudget?: number;
}

const Header: React.FC<HeaderProps> = ({ 
  monthlyTotal, 
  userName,
  userPicture,
  monthlyBudget = 0
}) => {
  const { t, formatCurrency, formatMonth } = useLanguage();
  
  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.dashboard.goodMorning;
    if (hour < 15) return t.dashboard.goodAfternoon;
    if (hour < 18) return t.dashboard.goodEvening;
    return t.dashboard.goodNight;
  };

  const budgetPercentage = monthlyBudget > 0 
    ? Math.min((monthlyTotal / monthlyBudget) * 100, 100)
    : 0;

  const getBudgetStatus = () => {
    if (budgetPercentage >= 100) return 'over';
    if (budgetPercentage >= 80) return 'warning';
    return 'safe';
  };

  const currentDate = new Date();

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        {/* User Greeting Section */}
        <div className={styles.userSection}>
          <div className={styles.profilePic}>
            {userPicture ? (
              <img src={userPicture} alt={userName} />
            ) : (
              <div className={styles.profileInitial}>
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className={styles.greetingText}>
            <span className={styles.greeting}>{getCurrentGreeting()},</span>
            <h1>{userName}</h1>
            <p>{t.dashboard.manageWisely}</p>
          </div>
        </div>
        
        {/* Monthly Summary Card */}
        <div className={styles.summaryCard}>
          <div className={styles.summaryHeader}>
            <div className={styles.summaryTitle}>
              <i className="fas fa-wallet"></i>
              <span>{t.dashboard.monthSummary}</span>
            </div>
            <span className={styles.currentMonth}>
              {formatMonth(currentDate)}
            </span>
          </div>
          
          <div className={styles.summaryContent}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>{t.dashboard.totalExpense}</span>
              <span className={styles.summaryValue}>
                Rp {formatCurrency(monthlyTotal)}
              </span>
            </div>
            
            {monthlyBudget > 0 && (
              <>
                <div className={styles.budgetProgress}>
                  <div className={styles.progressHeader}>
                    <span className={styles.progressLabel}>{t.dashboard.budgetUsage}</span>
                    <span className={styles.progressPercent}>
                      {Math.round(budgetPercentage)}%
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div 
                      className={`${styles.progressFill} ${styles[getBudgetStatus()]}`}
                      style={{ width: `${budgetPercentage}%` }}
                    />
                  </div>
                  <div className={styles.progressFooter}>
                    <span className={styles.budgetUsed}>
                      Rp {formatCurrency(monthlyTotal)}
                    </span>
                    <span className={styles.budgetTotal}>
                      {t.dashboard.from} Rp {formatCurrency(monthlyBudget)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;