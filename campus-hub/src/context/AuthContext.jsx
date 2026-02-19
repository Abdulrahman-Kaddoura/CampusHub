import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  AUTH_TOKEN_STORAGE_KEY,
  fetchCurrentUser,
  loginUser,
  registerUser,
} from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || "");
  const [authLoading, setAuthLoading] = useState(Boolean(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)));

  useEffect(() => {
    if (!token) {
      setCurrentUser(null);
      setAuthLoading(false);
      return;
    }

    let isMounted = true;
    fetchCurrentUser(token)
      .then((user) => {
        if (isMounted) {
          setCurrentUser(user);
        }
      })
      .catch(() => {
        if (isMounted) {
          localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
          setToken("");
          setCurrentUser(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setAuthLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const saveSession = (authPayload) => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, authPayload.token);
    setToken(authPayload.token);
    setCurrentUser(authPayload.user);
  };

  const register = async (payload) => {
    const response = await registerUser(payload);
    saveSession(response);
    return response.user;
  };

  const login = async (payload) => {
    const response = await loginUser(payload);
    saveSession(response);
    return response.user;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    setToken("");
    setCurrentUser(null);
  };

  const updateProfile = useCallback((updates) => {
    setCurrentUser((previousUser) => {
      if (!previousUser) {
        return previousUser;
      }

      return {
        ...previousUser,
        ...updates,
      };
    });
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      token,
      authLoading,
      isAuthenticated: Boolean(currentUser),
      register,
      login,
      logout,
      updateProfile,
    }),
    [currentUser, token, authLoading, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
