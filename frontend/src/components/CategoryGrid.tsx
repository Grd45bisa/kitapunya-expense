// components/CategoryGrid.tsx

import CategoryCard from './CategoryCard';
import type { CategoryTotal } from '../types/expense.types';
import styles from './styles/CategoryGrid.module.css';

interface CategoryGridProps {
  categoryTotals: CategoryTotal;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ categoryTotals }) => {
  const mainCategories = ['makanan', 'transportasi', 'belanja', 'hiburan'];

  return (
    <div className={styles.categoryGrid}>
      {mainCategories.map(category => (
        <CategoryCard
          key={category}
          category={category}
          amount={categoryTotals[category] || 0}
          totalAmount={Object.values(categoryTotals).reduce((a, b) => a + b, 0)}
        />
      ))}
    </div>
  );
};

export default CategoryGrid;