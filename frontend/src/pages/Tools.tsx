// pages/Tools.tsx - Complete with Language Support
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './styles/Tools.module.css';

interface ToolsProps {
  user: any;
  expenses: any[];
  onNavigate?: (tool: string) => void;
}

const Tools: React.FC<ToolsProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<'financial' | 'analysis' | 'planning'>('financial');

  const toolCategories = {
    financial: {
      title: t.tools.financial,
      icon: 'fas fa-wallet',
      tools: [
        {
          id: 'recurring',
          title: t.tools.recurringExpenses,
          description: t.tools.recurringDesc,
          icon: 'fas fa-sync-alt',
          color: '#10B981',
          features: language === 'id' 
            ? ['Auto-add bulanan', 'Reminder tagihan', 'Track subscription']
            : ['Monthly auto-add', 'Bill reminders', 'Track subscriptions'],
          isAvailable: false
        },
        {
          id: 'split-bill',
          title: t.tools.splitBill,
          description: t.tools.splitBillDesc,
          icon: 'fas fa-users',
          color: '#F59E0B',
          features: language === 'id'
            ? ['Split otomatis', 'Share link', 'Settlement tracker']
            : ['Auto split', 'Share link', 'Settlement tracker'],
          isAvailable: false
        },
        {
          id: 'budget-planner',
          title: t.tools.budgetPlanner,
          description: t.tools.budgetPlannerDesc,
          icon: 'fas fa-calendar-alt',
          color: '#8B5CF6',
          features: language === 'id'
            ? ['Event budget', 'Shopping list', 'Wishlist tracker']
            : ['Event budget', 'Shopping list', 'Wishlist tracker'],
          isAvailable: false
        }
      ]
    },
    analysis: {
      title: t.tools.analysis,
      icon: 'fas fa-chart-pie',
      tools: [
        {
          id: 'reports',
          title: t.tools.detailedReports,
          description: t.tools.detailedReportsDesc,
          icon: 'fas fa-file-alt',
          color: '#3B82F6',
          features: language === 'id'
            ? ['Export PDF', 'Grafik interaktif', 'Trend analysis']
            : ['Export PDF', 'Interactive charts', 'Trend analysis'],
          isAvailable: false
        },
        {
          id: 'insights',
          title: t.tools.smartInsights,
          description: t.tools.smartInsightsDesc,
          icon: 'fas fa-brain',
          color: '#EC4899',
          features: language === 'id'
            ? ['Pola pengeluaran', 'Tips hemat', 'Deteksi anomali']
            : ['Spending patterns', 'Saving tips', 'Anomaly detection'],
          isAvailable: false
        },
        {
          id: 'compare',
          title: t.tools.comparison,
          description: t.tools.comparisonDesc,
          icon: 'fas fa-exchange-alt',
          color: '#14B8A6',
          features: language === 'id'
            ? ['Bulan ke bulan', 'Tahun ke tahun', 'Analisis kategori']
            : ['Month to month', 'Year over year', 'Category analysis'],
          isAvailable: false
        }
      ]
    },
    planning: {
      title: t.tools.planning,
      icon: 'fas fa-bullseye',
      tools: [
        {
          id: 'goals',
          title: t.tools.savingTargets,
          description: t.tools.savingTargetsDesc,
          icon: 'fas fa-piggy-bank',
          color: '#F97316',
          features: language === 'id'
            ? ['Tracking milestone', 'Visual progress', 'Achievement badges']
            : ['Milestone tracking', 'Progress visual', 'Achievement badges'],
          isAvailable: false
        },
        {
          id: 'receipt-vault',
          title: t.tools.receiptArchive,
          description: t.tools.receiptArchiveDesc,
          icon: 'fas fa-archive',
          color: '#06B6D4',
          features: language === 'id'
            ? ['Cloud backup', 'OCR search', 'Warranty tracker']
            : ['Cloud backup', 'OCR search', 'Warranty tracker'],
          isAvailable: false
        },
        {
          id: 'calculator',
          title: t.tools.calculator,
          description: t.tools.calculatorDesc,
          icon: 'fas fa-calculator',
          color: '#84CC16',
          features: language === 'id'
            ? ['Bunga', 'Investasi', 'Pajak']
            : ['Interest', 'Investment', 'Tax'],
          isAvailable: false
        }
      ]
    }
  };

  const categories = Object.entries(toolCategories);

  const handleToolClick = (toolId: string) => {
    console.log('Tool clicked:', toolId);
    if (onNavigate) {
      onNavigate(toolId);
    }
  };

  return (
    <div className={styles.tools}>
      {/* Header */}
      <div className={styles.header}>
        <h1>
          <i className="fas fa-toolbox"></i>
          {t.tools.title}
        </h1>
        <p>{t.tools.subtitle}</p>
      </div>

      {/* Category Tabs */}
      <div className={styles.categoryTabs}>
        {categories.map(([key, category]) => (
          <button
            key={key}
            className={`${styles.categoryTab} ${activeCategory === key ? styles.active : ''}`}
            onClick={() => setActiveCategory(key as any)}
          >
            <i className={category.icon}></i>
            <span>{category.title}</span>
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className={styles.toolsGrid}>
        {toolCategories[activeCategory].tools.map((tool) => (
          <div
            key={tool.id}
            className={`${styles.toolCard} ${!tool.isAvailable ? styles.disabled : ''}`}
            onClick={() => tool.isAvailable && handleToolClick(tool.id)}
            style={{ '--tool-color': tool.color } as React.CSSProperties}
          >
            <div className={styles.toolHeader}>
              <div className={styles.toolIcon} style={{ background: tool.color }}>
                <i className={tool.icon}></i>
              </div>
              {tool.isAvailable && (
                <span className={styles.toolBadge}>Available</span>
              )}
            </div>

            <h3 className={styles.toolTitle}>{tool.title}</h3>
            <p className={styles.toolDescription}>{tool.description}</p>

            <div className={styles.toolFeatures}>
              {tool.features.map((feature, index) => (
                <div key={index} className={styles.feature}>
                  <i className="fas fa-check-circle"></i>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <button className={styles.toolButton}>
              {tool.isAvailable ? (
                <>
                  <span>{t.tools.open}</span>
                  <i className="fas fa-arrow-right"></i>
                </>
              ) : (
                <span>{t.tools.comingSoon}</span>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h2>{t.tools.quickActions}</h2>
        <div className={styles.actionButtons}>
          <button className={styles.actionButton}>
            <i className="fas fa-file-export"></i>
            <span>{t.tools.exportData}</span>
          </button>
          <button className={styles.actionButton}>
            <i className="fas fa-cloud-upload-alt"></i>
            <span>{t.tools.backup}</span>
          </button>
          <button className={styles.actionButton}>
            <i className="fas fa-share-alt"></i>
            <span>{t.tools.shareReport}</span>
          </button>
          <button className={styles.actionButton}>
            <i className="fas fa-question-circle"></i>
            <span>{t.tools.help}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tools;