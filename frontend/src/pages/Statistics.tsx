// pages/Statistics.tsx - Complete with Language Support
import React, { useState, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Expense, CategoryTotal, ConnectionStatus } from '../types/expense.types';
import { CATEGORIES } from '../utils/constants';
import styles from './styles/Statistics.module.css';

interface User {
  uid: string;
  email: string;
  name: string;
  picture?: string;
  nickname?: string;
  purpose?: string;
  monthlyBudget?: string;
  categories?: string[];
  isSetupComplete?: boolean;
  idToken?: string;
}

interface StatisticsProps {
  user: User | null;
  expenses: Expense[];
  categoryTotals: CategoryTotal;
  monthlyTotal: number;
  connectionStatus: ConnectionStatus;
  loading: boolean;
  addExpense: (expense: Omit<Expense, 'id' | 'timestamp'>) => Promise<{ success: boolean; expense?: Expense; error?: Error }>;
  analyzeReceipt: (photo: File) => Promise<any>;
  refresh: () => void;
}

const Statistics: React.FC<StatisticsProps> = ({
  user,
  expenses,
  loading,
  refresh
}) => {
  const { t, language, formatCurrency } = useLanguage();
  
  // Time period states
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year' | 'all'>('month');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [viewType, setViewType] = useState<'chart' | 'list'>('chart');

  // Get category label based on language
  const getCategoryLabel = (category: string) => {
    const categoryMap: { [key: string]: { id: string; en: string } } = {
      makanan: { id: 'Makanan', en: 'Food' },
      transportasi: { id: 'Transportasi', en: 'Transport' },
      belanja: { id: 'Belanja', en: 'Shopping' },
      hiburan: { id: 'Hiburan', en: 'Entertainment' },
      kesehatan: { id: 'Kesehatan', en: 'Health' },
      pendidikan: { id: 'Pendidikan', en: 'Education' },
      tagihan: { id: 'Tagihan', en: 'Bills' },
      lainnya: { id: 'Lainnya', en: 'Others' }
    };
    
    const labels = categoryMap[category] || { id: category, en: category };
    return language === 'id' ? labels.id : labels.en;
  };

  // Get week date range
  const getWeekDateRange = (year: number, month: number, week: number): { start: Date; end: Date } => {
    const firstDayOfMonth = new Date(year, month, 1);
    const dayOfWeek = firstDayOfMonth.getDay();
    const startDate = new Date(year, month, 1 + (week - 1) * 7 - dayOfWeek);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    if (endDate > lastDayOfMonth) {
      return { start: startDate, end: lastDayOfMonth };
    }
    return { start: startDate, end: endDate };
  };

  // Get available periods
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    const currentYear = new Date().getFullYear();
    years.add(currentYear);
    
    expenses.forEach(expense => {
      const year = new Date(expense.tanggal).getFullYear();
      if (year >= 2020 && year <= currentYear + 1) {
        years.add(year);
      }
    });
    
    return Array.from(years).sort((a, b) => b - a);
  }, [expenses]);

  const availableMonths = useMemo(() => {
    const months = new Set<number>();
    expenses.forEach(expense => {
      const date = new Date(expense.tanggal);
      if (date.getFullYear() === selectedYear) {
        months.add(date.getMonth());
      }
    });
    
    if (months.size === 0) {
      months.add(new Date().getMonth());
    }
    
    return Array.from(months).sort((a, b) => a - b);
  }, [expenses, selectedYear]);

  // Filter expenses based on selected period
  const filteredExpenses = useMemo(() => {
    if (selectedPeriod === 'all') {
      return expenses;
    }
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.tanggal);
      
      if (isNaN(expenseDate.getTime())) {
        return false;
      }
      
      if (selectedPeriod === 'year') {
        return expenseDate.getFullYear() === selectedYear;
      } else if (selectedPeriod === 'month') {
        return expenseDate.getFullYear() === selectedYear && 
               expenseDate.getMonth() === selectedMonth;
      } else if (selectedPeriod === 'week') {
        if (expenseDate.getFullYear() !== selectedYear || 
            expenseDate.getMonth() !== selectedMonth) {
          return false;
        }
        
        const weekRange = getWeekDateRange(selectedYear, selectedMonth, selectedWeek);
        return expenseDate >= weekRange.start && expenseDate <= weekRange.end;
      }
      
      return false;
    });
  }, [expenses, selectedPeriod, selectedYear, selectedMonth, selectedWeek]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const stats = {
      total: 0,
      average: 0,
      transactionCount: 0,
      categoryTotals: {} as CategoryTotal,
      dailyData: {} as { [key: string]: number },
      topExpense: null as Expense | null,
      trend: 'stable' as 'up' | 'down' | 'stable'
    };
    
    filteredExpenses.forEach(expense => {
      const date = new Date(expense.tanggal);
      if (isNaN(date.getTime())) return;
      
      const dayKey = date.toISOString().split('T')[0];
      
      stats.total += expense.total;
      stats.transactionCount++;
      
      // Category totals
      stats.categoryTotals[expense.kategori] = 
        (stats.categoryTotals[expense.kategori] || 0) + expense.total;
      
      // Daily data
      stats.dailyData[dayKey] = (stats.dailyData[dayKey] || 0) + expense.total;
      
      // Top expense
      if (!stats.topExpense || expense.total > stats.topExpense.total) {
        stats.topExpense = expense;
      }
    });

    // Calculate average
    if (stats.transactionCount > 0) {
      stats.average = Math.round(stats.total / stats.transactionCount);
    }

    // Calculate trend
    const previousPeriodExpenses = expenses.filter(expense => {
      const date = new Date(expense.tanggal);
      if (selectedPeriod === 'month') {
        const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
        const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
        return date.getFullYear() === prevYear && date.getMonth() === prevMonth;
      }
      return false;
    });

    const previousTotal = previousPeriodExpenses.reduce((sum, exp) => sum + exp.total, 0);
    if (previousTotal > 0) {
      const difference = ((stats.total - previousTotal) / previousTotal) * 100;
      stats.trend = difference > 5 ? 'up' : difference < -5 ? 'down' : 'stable';
    }
    
    return stats;
  }, [filteredExpenses, expenses, selectedPeriod, selectedMonth, selectedYear]);

  // Get chart data
  const getChartData = () => {
    const data = [];
    const monthNamesId = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 
                         'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthNames = language === 'id' ? monthNamesId : monthNamesEn;
    
    const dayNamesId = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayNames = language === 'id' ? dayNamesId : dayNamesEn;

    if (selectedPeriod === 'week') {
      const weekRange = getWeekDateRange(selectedYear, selectedMonth, selectedWeek);
      for (let d = new Date(weekRange.start); d <= weekRange.end; d.setDate(d.getDate() + 1)) {
        const dayKey = d.toISOString().split('T')[0];
        data.push({
          label: `${dayNames[d.getDay()]} ${d.getDate()}`,
          amount: statistics.dailyData[dayKey] || 0
        });
      }
    } else if (selectedPeriod === 'month') {
      for (let week = 1; week <= 5; week++) {
        const weekRange = getWeekDateRange(selectedYear, selectedMonth, week);
        if (weekRange.start.getMonth() === selectedMonth || weekRange.end.getMonth() === selectedMonth) {
          let weekTotal = 0;
          for (let d = new Date(weekRange.start); d <= weekRange.end; d.setDate(d.getDate() + 1)) {
            const dayKey = d.toISOString().split('T')[0];
            weekTotal += statistics.dailyData[dayKey] || 0;
          }
          const weekLabel = language === 'id' ? `Minggu ${week}` : `Week ${week}`;
          data.push({
            label: weekLabel,
            amount: weekTotal
          });
        }
      }
    } else if (selectedPeriod === 'year') {
      for (let m = 0; m < 12; m++) {
        const monthExpenses = filteredExpenses.filter(exp => {
          const date = new Date(exp.tanggal);
          return date.getMonth() === m;
        });
        const monthTotal = monthExpenses.reduce((sum, exp) => sum + exp.total, 0);
        data.push({
          label: monthNames[m],
          amount: monthTotal
        });
      }
    } else {
      availableYears.forEach(year => {
        const yearExpenses = expenses.filter(exp => {
          const date = new Date(exp.tanggal);
          return date.getFullYear() === year;
        });
        const yearTotal = yearExpenses.reduce((sum, exp) => sum + exp.total, 0);
        data.push({
          label: year.toString(),
          amount: yearTotal
        });
      });
    }
    
    return data;
  };

  const chartData = getChartData();
  const maxChartAmount = Math.max(...chartData.map(d => d.amount), 1);

  const monthNames = language === 'id' 
    ? ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
       'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    : ['January', 'February', 'March', 'April', 'May', 'June',
       'July', 'August', 'September', 'October', 'November', 'December'];

  const getPeriodLabel = () => {
    if (selectedPeriod === 'week') {
      const weekLabel = language === 'id' ? 'Minggu' : 'Week';
      return `${weekLabel} ${selectedWeek}, ${monthNames[selectedMonth]} ${selectedYear}`;
    } else if (selectedPeriod === 'month') {
      return `${monthNames[selectedMonth]} ${selectedYear}`;
    } else if (selectedPeriod === 'year') {
      const yearLabel = language === 'id' ? 'Tahun' : 'Year';
      return `${yearLabel} ${selectedYear}`;
    } else {
      return language === 'id' ? 'Semua Waktu' : 'All Time';
    }
  };

  const getPeriodButtonLabel = (period: string) => {
    const labels: { [key: string]: { id: string; en: string } } = {
      week: { id: 'Minggu', en: 'Week' },
      month: { id: 'Bulan', en: 'Month' },
      year: { id: 'Tahun', en: 'Year' },
      all: { id: 'Semua', en: 'All' }
    };
    return language === 'id' ? labels[period].id : labels[period].en;
  };

  return (
    <div className={styles.statistics}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.profileSection}>
          <div className={styles.profileAvatar}>
            {user?.picture ? (
              <img src={user.picture} alt="Profile" />
            ) : (
              <div className={styles.profileInitial}>
                {user?.name?.charAt(0) || user?.nickname?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <div className={styles.profileInfo}>
            <h1>{user?.nickname || user?.name || 'UserName'}</h1>
            <p>{t.statistics.expenseAnalysis} {getPeriodLabel()}</p>
          </div>
        </div>
        <button 
          className={styles.refreshButton}
          onClick={refresh}
          disabled={loading}
        >
          <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
          {t.common.refresh}
        </button>
      </div>

      {/* Hero Stats Cards */}
      <div className={styles.heroStats}>
        <div className={styles.primaryStat}>
          <div className={styles.statHeader}>
            <div className={styles.statIcon}>
              <i className="fas fa-wallet"></i>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>{t.statistics.totalExpenses}</span>
              <span className={styles.statValue}>Rp {formatCurrency(statistics.total)}</span>
              <span className={styles.statDetail}>
                {statistics.transactionCount} {t.dashboard.transactions} • {getPeriodLabel()}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.secondaryStats}>
          <div className={styles.secondaryStat}>
            <div className={styles.statIcon}>
              <i className="fas fa-trophy"></i>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>{t.statistics.biggestTransaction}</span>
              <span className={styles.statValue}>Rp {formatCurrency(statistics.topExpense?.total || 0)}</span>
              <span className={styles.statDetail}>{statistics.topExpense?.toko || t.common.none}</span>
            </div>
          </div>

          <div className={styles.secondaryStat}>
            <div className={styles.statIcon}>
              <i className="fas fa-receipt"></i>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>{t.statistics.totalTransactions}</span>
              <span className={styles.statValue}>{statistics.transactionCount}</span>
              <span className={styles.statDetail}>{t.dashboard.transactions} {getPeriodLabel()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.periodSelector}>
          {(['week', 'month', 'year', 'all'] as const).map(period => (
            <button
              key={period}
              className={`${styles.periodButton} ${selectedPeriod === period ? styles.active : ''}`}
              onClick={() => setSelectedPeriod(period)}
            >
              {getPeriodButtonLabel(period)}
            </button>
          ))}
        </div>

        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewButton} ${viewType === 'chart' ? styles.active : ''}`}
            onClick={() => setViewType('chart')}
          >
            <i className="fas fa-chart-bar"></i>
            {t.statistics.chart}
          </button>
          <button
            className={`${styles.viewButton} ${viewType === 'list' ? styles.active : ''}`}
            onClick={() => setViewType('list')}
          >
            <i className="fas fa-list"></i>
            {t.statistics.list}
          </button>
        </div>
      </div>

      {/* Date Selectors */}
      {selectedPeriod !== 'all' && (
        <div className={styles.dateSelectors}>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className={styles.dateSelect}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          {(selectedPeriod === 'month' || selectedPeriod === 'week') && (
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className={styles.dateSelect}
            >
              {availableMonths.map(month => (
                <option key={month} value={month}>{monthNames[month]}</option>
              ))}
            </select>
          )}

          {selectedPeriod === 'week' && (
            <select 
              value={selectedWeek} 
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className={styles.dateSelect}
            >
              {[1, 2, 3, 4, 5].map(week => {
                const weekLabel = language === 'id' ? 'Minggu' : 'Week';
                return (
                  <option key={week} value={week}>{weekLabel} {week}</option>
                );
              })}
            </select>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className={styles.mainContent}>
        {viewType === 'chart' ? (
          <>
            {/* Chart Section */}
            <div className={styles.chartSection}>
              <div className={styles.chartHeader}>
                <h2>{t.statistics.expenseChart}</h2>
                <span className={styles.chartPeriod}>{getPeriodLabel()}</span>
              </div>
              
              <div className={styles.chartContainer}>
                {chartData.length > 0 && chartData.some(d => d.amount > 0) ? (
                  chartData.map((data, index) => {
                    const heightPercentage = maxChartAmount > 0 
                      ? Math.max((data.amount / maxChartAmount) * 80 + 5, data.amount > 0 ? 20 : 5) 
                      : 5;
                    
                    return (
                      <div key={index} className={styles.chartBar}>
                        <div 
                          className={styles.bar}
                          style={{ 
                            height: `${heightPercentage}%`
                          }}
                          title={`${data.label}: Rp ${formatCurrency(data.amount)}`}
                        >
                          {data.amount > 0 && (
                            <span className={styles.barValue}>
                              {data.amount > 1000000 
                                ? `${Math.round(data.amount / 1000000)}M` 
                                : data.amount > 1000 
                                ? `${Math.round(data.amount / 1000)}K`
                                : formatCurrency(data.amount)
                              }
                            </span>
                          )}
                        </div>
                        <span className={styles.barLabel}>{data.label}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className={styles.emptyChart}>
                    <i className="fas fa-chart-bar"></i>
                    <p>{t.statistics.noData}</p>
                  </div>
                )}
              </div>
              
              {/* Chart Summary */}
              {chartData.length > 0 && chartData.some(d => d.amount > 0) && (
                <div className={styles.chartSummary}>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>{t.statistics.highest}</span>
                    <span className={styles.summaryValue}>
                      Rp {formatCurrency(Math.max(...chartData.map(d => d.amount)))}
                    </span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>{t.common.average}</span>
                    <span className={styles.summaryValue}>
                      Rp {formatCurrency(Math.round(chartData.reduce((sum, d) => sum + d.amount, 0) / chartData.filter(d => d.amount > 0).length) || 0)}
                    </span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>{t.statistics.lowest}</span>
                    <span className={styles.summaryValue}>
                      Rp {formatCurrency(Math.min(...chartData.filter(d => d.amount > 0).map(d => d.amount)) || 0)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Category Breakdown */}
            <div className={styles.categorySection}>
              <h2>{t.statistics.categoryBreakdown}</h2>
              <div className={styles.categoryList}>
                {Object.entries(statistics.categoryTotals).length > 0 ? (
                  Object.entries(statistics.categoryTotals)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([category, amount]) => {
                      const percentage = statistics.total > 0 ? (amount / statistics.total) * 100 : 0;
                      const categoryInfo = CATEGORIES[category as keyof typeof CATEGORIES];
                      
                      return (
                        <div key={category} className={styles.categoryItem}>
                          <div className={styles.categoryHeader}>
                            <div 
                              className={styles.categoryIcon}
                              style={{ backgroundColor: categoryInfo?.color || '#B0B0B0' }}
                            >
                              <i className={`fas ${categoryInfo?.icon || 'fa-receipt'}`}></i>
                            </div>
                            <div className={styles.categoryInfo}>
                              <span className={styles.categoryName}>{getCategoryLabel(category)}</span>
                              <span className={styles.categoryAmount}>Rp {formatCurrency(amount)}</span>
                            </div>
                            <span className={styles.categoryPercentage}>{percentage.toFixed(1)}%</span>
                          </div>
                          <div className={styles.categoryProgress}>
                            <div 
                              className={styles.progressBar}
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: categoryInfo?.color || '#B0B0B0'
                              }}
                            />
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className={styles.moreCategories}>
                    <span>{t.statistics.noCategory}</span>
                  </div>
                )}
                
                {Object.entries(statistics.categoryTotals).length > 5 && (
                  <div className={styles.moreCategories}>
                    <span>+{Object.entries(statistics.categoryTotals).length - 5} {t.statistics.moreCategories}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* List View */
          <div className={styles.listSection}>
            <h2>{t.statistics.transactionDetails}</h2>
            <div className={styles.transactionList}>
              {filteredExpenses.length > 0 ? (
                filteredExpenses
                  .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
                  .slice(0, 20)
                  .map((expense) => (
                    <div key={expense.id} className={styles.transactionItem}>
                      <div className={styles.transactionDate}>
                        <span className={styles.day}>
                          {new Date(expense.tanggal).getDate()}
                        </span>
                        <span className={styles.month}>
                          {new Date(expense.tanggal).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'short' })}
                        </span>
                      </div>
                      <div className={styles.transactionDetails}>
                        <span className={styles.transactionStore}>{expense.toko}</span>
                        <span className={styles.transactionCategory}>
                          <i className={`fas ${CATEGORIES[expense.kategori as keyof typeof CATEGORIES]?.icon || 'fa-receipt'}`}></i>
                          {getCategoryLabel(expense.kategori)}
                        </span>
                      </div>
                      <div className={styles.transactionAmount}>
                        Rp {formatCurrency(expense.total)}
                      </div>
                    </div>
                  ))
              ) : (
                <div className={styles.moreCategories}>
                  <span>{t.statistics.noData}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Budget Comparison */}
        {user?.monthlyBudget && parseInt(user.monthlyBudget) > 0 && selectedPeriod === 'month' && (
          <div className={styles.budgetSection}>
            <h2>{t.statistics.budgetComparison}</h2>
            <div className={styles.budgetCard}>
              <div className={styles.budgetHeader}>
                <div className={styles.budgetItem}>
                  <span className={styles.budgetLabel}>{t.statistics.monthlyBudget}</span>
                  <span className={styles.budgetValue}>Rp {formatCurrency(parseInt(user.monthlyBudget))}</span>
                </div>
                <div className={styles.budgetItem}>
                  <span className={styles.budgetLabel}>{t.statistics.used}</span>
                  <span className={styles.budgetValue}>Rp {formatCurrency(statistics.total)}</span>
                </div>
              </div>
              
              <div className={styles.budgetProgress}>
                <div 
                  className={styles.budgetBar}
                  style={{ 
                    width: `${Math.min((statistics.total / parseInt(user.monthlyBudget)) * 100, 100)}%`,
                    backgroundColor: statistics.total > parseInt(user.monthlyBudget) ? '#EF4444' : '#10B981'
                  }}
                />
              </div>
              
              <div className={styles.budgetStatus}>
                {statistics.total > parseInt(user.monthlyBudget) 
                  ? `${t.dashboard.overBudget}: Rp ${formatCurrency(statistics.total - parseInt(user.monthlyBudget))}`
                  : `${t.dashboard.remainingBudget}: Rp ${formatCurrency(parseInt(user.monthlyBudget) - statistics.total)}`
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;