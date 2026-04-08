import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "@/api/auth.api";
import axiosClient, { setAccessToken } from "@/api/axiosClient";
import { parseAuthResponseBody, parseMeResponse } from "@/lib/parseAuthResponse";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('accessToken');
  });
  const [isLoading, setIsLoading] = useState(false);

  const applyToken = (token, payloadData) => {
    setAccessToken(token || null);
    if (token) {
      axiosClient.defaults.headers.Authorization = `Bearer ${token}`;
      localStorage.setItem('accessToken', token);
      if (payloadData) localStorage.setItem('user', JSON.stringify(payloadData));
    } else {
      delete axiosClient.defaults.headers.Authorization;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  };

  const handleLogin = async (email, password) => {
    try {
      setIsLoading(true);
      const data = await authApi.login(email, password);
      let { accessToken, user: userData } = parseAuthResponseBody(data);

      if (accessToken && !userData) {
        applyToken(accessToken, null);
        try {
          const me = await authApi.getMe();
          userData = parseMeResponse(me);
        } catch {
          /* /auth/me không có hoặc lỗi — vẫn coi là đăng nhập nếu đã có token */
        }
      }

      if (accessToken) {
        applyToken(accessToken, userData);
      }

      setUser(userData ?? null);

      setIsAuthenticated(Boolean(accessToken));
      return {
        success: true,
        data,
        user: userData,
        accessToken,
      };
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async ({ fullName, email, password }) => {
    const payload = {
      full_name: fullName,
      email,
      password,
    };

    try {
      setIsLoading(true);
      const data = await authApi.register(payload);
      let { accessToken, user: userData } = parseAuthResponseBody(data);

      if (accessToken && !userData) {
        applyToken(accessToken, null);
        try {
          const me = await authApi.getMe();
          userData = parseMeResponse(me);
        } catch {
          /* ignore */
        }
      }

      if (accessToken) {
        applyToken(accessToken, userData);
      }

      setUser(userData ?? null);

      setIsAuthenticated(Boolean(accessToken));

      return { success: true, data, user: userData, accessToken };
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
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
      navigate("/auth", { replace: true });
    }
  };

  // Khi F5 reload trang: khôi phục token từ localStorage
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      applyToken(token, user);
    }
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
