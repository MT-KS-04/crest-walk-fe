import { createContext, useContext, useEffect, useState } from "react";
import authApi from "@/api/auth.api";
import axiosClient, { setAccessToken } from "@/api/axiosClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const applyToken = (token) => {
    setAccessToken(token || null);
    if (token) {
      axiosClient.defaults.headers.Authorization = `Bearer ${token}`;
    } else {
      delete axiosClient.defaults.headers.Authorization;
    }
  };

  const handleLogin = async (email, password) => {
    try {
      setIsLoading(true);
      const data = await authApi.login(email, password);
      const { accessToken, user: userData } = data || {};

      if (accessToken) {
        applyToken(accessToken);
      }

      if (userData) {
        setUser(userData);
      }

      setIsAuthenticated(Boolean(accessToken && userData));
      return { success: true, data };
    } catch (error) {
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async ({ fullName, email, password }) => {
    // Map từ form sang field backend yêu cầu
    const payload = {
      full_name: fullName,
      email,
      password,
    };

    try {
      setIsLoading(true);
      const data = await authApi.register(payload);

      // Tuỳ backend, có thể trả luôn token + user hoặc chỉ user
      const { accessToken, user: userData } = data || {};

      if (accessToken) {
        applyToken(accessToken);
      }

      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      }

      return { success: true, data };
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await authApi.logout().catch(() => {});
    } finally {
      applyToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const data = await authApi.refreshToken();
        const { accessToken, user: userData } = data || {};

        if (accessToken) {
          applyToken(accessToken);
        }

        if (userData) {
          setUser(userData);
        }

        setIsAuthenticated(Boolean(accessToken && userData));
      } catch {
        applyToken(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    handleLogin,
    handleRegister,
    handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
