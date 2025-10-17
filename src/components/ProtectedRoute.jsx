import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    // Non autenticato -> redirect al login
    return <Navigate to="/login" replace />;
  }

  // Autenticato -> mostra il contenuto
  return children;
}

export default ProtectedRoute;
