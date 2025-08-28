import styles from './styles/LoadingSpinner.module.css';

const LoadingSpinner: React.FC = () => {
  return (
    <div className={styles.spinner}>
      <div className={styles.spinnerCircle}></div>
      <p>Loading...</p>
    </div>
  );
};

export default LoadingSpinner;