import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  AUTH_TOKEN_STORAGE_KEY,
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  verifyEmailCode,
} from "../api/auth";
import { FEATURE_FLAGS } from "../config/features";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || "");
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (!FEATURE_FLAGS.auth) {
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

  const saveToken = (authPayload) => {
    if (!authPayload?.token) {
      return;
    }

    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, authPayload.token);
    setToken(authPayload.token);
  };

  const register = async (payload) => {
    if (!FEATURE_FLAGS.auth) {
      throw new Error("Authentication is currently unavailable.");
    }

    const response = await registerUser(payload);
    return response;
  };

  const login = async (payload) => {
    if (!FEATURE_FLAGS.auth) {
      throw new Error("Authentication is currently unavailable.");
    }

    const response = await loginUser(payload);
    saveToken(response);

    const user = await fetchCurrentUser(response?.token || token);
    setCurrentUser(user);
    return user;
  };

  const verifyEmail = async (payload) => {
    if (!FEATURE_FLAGS.auth) {
      throw new Error("Authentication is currently unavailable.");
    }

    return verifyEmailCode(payload);
  };

  const logout = async () => {
    if (!FEATURE_FLAGS.auth) {
      return;
    }

    try {
      await logoutUser();
    } finally {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      setToken("");
      setCurrentUser(null);
    }
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
      verifyEmail,
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
