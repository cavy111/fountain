import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  const guardianData = localStorage.getItem('guardian_data');
  
  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  // If guardian data exists, redirect to guardian dashboard
  if (guardianData) {
    return <Navigate to="/guardian/dashboard" />;
  }
  
  // Otherwise, allow access to admin panel
  return children;
};

export default ProtectedRoute;