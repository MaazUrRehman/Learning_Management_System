import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../lib/api.js";

const AuthContext = createContext(null);
const STORAGE_KEY = "academy_lms_auth";

const getStoredAuth = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedData = getStoredAuth();
    if (storedData?.user && storedData?.token) {
      setUser(storedData.user);
      setToken(storedData.token);
    }
    setIsLoading(false);
  }, []);

  const persistAuth = (userData, accessToken) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user: userData, token: accessToken })
    );
  };

  const login = async ({ identifier, password }) => {
    try {
      const response = await api.post("/auth/login", {
        identifier,
        password,
      });

      const { accessToken, user: loggedInUser } = response.data.data;
      persistAuth(loggedInUser, accessToken);
      setUser(loggedInUser);
      setToken(accessToken);

      return { user: loggedInUser, forcePasswordChange: false };
    } catch (error) {
      if (error?.response?.data?.status === "FORCE_PASSWORD_CHANGE") {
        const authData = error.response.data.data;
        const partialUser = authData?.user;
        const accessToken = authData?.accessToken;

        if (partialUser && accessToken) {
          persistAuth(partialUser, accessToken);
          setUser(partialUser);
          setToken(accessToken);
        }

        return {
          forcePasswordChange: true,
          role: partialUser?.role,
          message: error.response.data.message,
        };
      }

      throw error;
    }
  };

  const setAuthData = (userData, accessToken) => {
    persistAuth(userData, accessToken);
    setUser(userData);
    setToken(accessToken);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // Ignore logout errors and clear local state anyway.
    }

    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setToken(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(user && token),
      login,
      logout,
      setAuthData,
    }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
