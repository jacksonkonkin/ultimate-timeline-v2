import React, { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';

const AuthProvider = ({ children }) => {
  const { initialize } = useAuthStore();

  useEffect(() => {
    // Initialize the auth store when the app starts
    initialize();
  }, [initialize]);

  return children;
};

export default AuthProvider;