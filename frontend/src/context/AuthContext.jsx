import { createContext, useState, useContext } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('auth_token') || null);
  const isAuthenticated = !!token;

  const handleSetToken = (newToken) => {
    if (newToken) {
      localStorage.setItem('auth_token', newToken);
    } else {
      localStorage.removeItem('auth_token');
    }
    setToken(newToken);
  };

  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      if (response.success && response.token) {
        handleSetToken(response.token);
        return { success: true };
      }
      return { success: false, error: "Invalid response from server" };
    } catch (err) {
      return { success: false, error: err.error || "Login Failed" };
    }
  };

  const register = async (userData) => {
    try {
      await authService.register(userData);
      return { success: true };
    } catch (err) {
      let errorMsg = err.error || "Registration failed";
      if (typeof errorMsg === 'object') {
        const firstKey = Object.keys(errorMsg)[0];
        errorMsg = Array.isArray(errorMsg[firstKey]) ? errorMsg[firstKey][0] : errorMsg[firstKey];
      }
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authService.logout();
      }
    } catch (e) {
      console.warn("Logout endpoint error, clearing token locally anyway", e);
    } finally {
      handleSetToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
