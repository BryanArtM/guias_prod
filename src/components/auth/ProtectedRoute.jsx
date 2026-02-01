import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import PropTypes from "prop-types";

export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
