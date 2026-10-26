import { Navigate } from 'react-router-dom';

export const AuthCallbackPage = () => {
  return <Navigate to="/login" replace />;
};

export default AuthCallbackPage;

