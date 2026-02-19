import { jwtDecode } from "jwt-decode";
import { ACCESS_TOKEN_KEY } from "../config";

export const getUserFromToken = () => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};
