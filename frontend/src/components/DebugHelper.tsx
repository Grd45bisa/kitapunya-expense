// components/DebugHelper.tsx - Debug component to track user email flow
import { useEffect } from 'react';

interface DebugHelperProps {
  user: any;
  location: string;
}

const DebugHelper: React.FC<DebugHelperProps> = ({ user, location }) => {
  useEffect(() => {
    console.log(`🔍 [${location}] User data:`, {
      email: user?.email || 'NO EMAIL',
      name: user?.name || 'NO NAME',
      nickname: user?.nickname || 'NO NICKNAME',
      isSetupComplete: user?.isSetupComplete || false,
      hasUser: !!user
    });
  }, [user, location]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
        Debug: {location}
      </div>
      <div>Email: {user?.email || 'ANONYMOUS'}</div>
      <div>Name: {user?.nickname || user?.name || 'NO NAME'}</div>
      <div>Setup: {user?.isSetupComplete ? '✅' : '❌'}</div>
    </div>
  );
};

export default DebugHelper;