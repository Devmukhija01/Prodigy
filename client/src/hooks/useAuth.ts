import { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Always ask backend instead of checking document.cookie
  useEffect(() => {
    axios
      .get<User>("http://localhost:5055/api/user/me", { withCredentials: true })
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        console.error("Auth check failed:", err);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await axios.post(
        "http://localhost:5055/api/auth/login",
        { email, password },
        { withCredentials: true }
      );

      // ✅ get fresh user after login
      const userRes = await axios.get<User>("http://localhost:5055/api/user/me", {
        withCredentials: true,
      });
      setUser(userRes.data);
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await axios.post("http://localhost:5055/api/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setUser(null);
    }
  };

  return {
    user,
    isAuthenticated: !!user, // ✅ Now only false if backend confirms user not logged in
    isLoading,
    login,
    logout,
  };
};
