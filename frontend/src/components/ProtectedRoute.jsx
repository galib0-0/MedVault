import { Navigate } from 'react-router-dom';
import { getSession } from '../lib/auth';

export default function ProtectedRoute({ role, children }) {
  const session = getSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (role && session.role !== role && session.role !== 'ADMIN') {
    return (
      <Navigate
        to={session.role === 'DOCTOR' ? '/doctor' : '/patient'}
        replace
      />
    );
  }

  return children;
}
