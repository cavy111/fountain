import { Navigate } from 'react-router-dom';

const GuardianRoute = ({ children }) => {
  const guardianData = localStorage.getItem('guardian_data');
  const accessToken = localStorage.getItem('access_token');

  if (!guardianData || !accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default GuardianRoute;