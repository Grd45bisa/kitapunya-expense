import styles from './styles/FloatingActionButton.module.css';

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  return (
    <button className={styles.fab} onClick={onClick}>
      <i className="fas fa-plus"></i>
    </button>
  );
};

export default FloatingActionButton;