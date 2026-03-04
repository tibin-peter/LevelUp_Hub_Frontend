import React, { createContext, useContext, useState, useEffect } from "react";
import { loginAPI, registerAPI, logoutAPI } from "../api/auth.api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("levelHubUser");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("levelHubUser");
      }
    }
    setLoading(false);
  }, []);


  // Inside AuthContext.js
  const login = async (credentials) => {
    try {
      const response = await loginAPI(credentials);
      const { success, data, message } = response.data;

      if (success && data) {
        const isVerified = data.IsVerified || data.isVerified || data.is_verified || false;
        const id = data.id || data.ID || data.Id;
        const status = data.status || data.Status || (isVerified ? "approved" : "new");
        const profilePicURL = data.ProfilePicURL || data.profilePicURL || data.profile_pic_url || "";

        const sessionUser = {
          ...data,
          id,
          isVerified,
          status,
          profilePicURL,
          permissions: data.permissions || data.Permissions || [],
        };

        if (data.accessToken) localStorage.setItem("levelHubToken", data.accessToken);
        if (data.refreshToken) localStorage.setItem("levelHubRefreshToken", data.refreshToken);
        localStorage.setItem("levelHubUser", JSON.stringify(sessionUser));
        setUser(sessionUser);
        return sessionUser;
      }
      throw new Error(message || "Login failed");
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Login failed";
      throw new Error(errMsg);
    }
  };

  const register = async (payload) => {
    const response = await registerAPI(payload);
    const { success, data, message } = response.data;

    if (success && data) {
      const isVerified = data.IsVerified || data.isVerified || data.is_verified || false;
      const id = data.id || data.ID || data.Id;
      const status = data.status || data.Status || (isVerified ? "approved" : "new");
      const profilePicURL = data.ProfilePicURL || data.profilePicURL || data.profile_pic_url || "";

      const sessionUser = {
        ...data,
        id,
        isVerified,
        status,
        profilePicURL,
        permissions: data.permissions || data.Permissions || [],
      };
      if (data.accessToken) localStorage.setItem("levelHubToken", data.accessToken);
      if (data.refreshToken) localStorage.setItem("levelHubRefreshToken", data.refreshToken);
      localStorage.setItem("levelHubUser", JSON.stringify(sessionUser));
      setUser(sessionUser);
      return sessionUser;
    }
    throw new Error(message || "Registration failed");
  };

  const logout = async () => {
    try {
      await logoutAPI();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      localStorage.clear();
      setUser(null);
      window.location.href = "/";
    }
  };

  const updateUser = (newData) => {
    setUser((prevUser) => {
      const updated = { ...prevUser, ...newData };
      localStorage.setItem("levelHubUser", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUser }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};;

// Named export for the hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
