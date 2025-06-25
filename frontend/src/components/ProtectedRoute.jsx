// This component checks if the user is signed in and has the correct role
// If not, it redirects them to the appropriate dashboard or sign-in page
import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRole }) {
  const { isSignedIn, user } = useUser();
  const role = user?.publicMetadata?.role;

  if (!isSignedIn) return <Navigate to="/dashboard" />;
  if (allowedRole && role !== allowedRole) {
    return role
      ? <Navigate to={`/${role}/dashboard`} />
      : <Navigate to="/dashboard" />;
  }
  return children;
}
