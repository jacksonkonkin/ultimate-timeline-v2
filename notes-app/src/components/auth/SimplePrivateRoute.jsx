import React, { useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { Navigate } from "react-router-dom";
import './auth.css';

const SimplePrivateRoute = ({ children }) => {
  const { user, session, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    // Initialize auth if not already done
    initialize();
  }, [initialize]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Redirect to signin if not authenticated
  if (!user && !session) {
    return <Navigate to="/signin" replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default SimplePrivateRoute;