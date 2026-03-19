import { Navigate } from "react-router-dom";
import { getRole } from "../utils/auth";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const role = getRole();

  if (!role) return <Navigate to="/login" />;

  if (!allowedRoles.includes(role)) return <Navigate to="/login" />;

  return children;
};

export default ProtectedRoute;
