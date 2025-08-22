import { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  _id: string; // ✅ use _id instead of id
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
  logout: () => void;
}

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const tokenExists = document.cookie.includes('token=');

    if (tokenExists) {
      // Validate token and fetch user details
      axios
        .get<User>('http://https://prodigy-59mg.onrender.com/api/user/me', { withCredentials: true })
        .then((res) => {
          setUser(res.data);
        })
        .catch((err) => {
          console.error("Auth check failed:", err);
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post(
        'http://https://prodigy-59mg.onrender.com/api/auth/login',
        { email, password },
        { withCredentials: true }
      );

      if (res.data) {
        // Fetch user data after successful login
        const userRes = await axios.get<User>('http://https://prodigy-59mg.onrender.com/api/user/me', {
          withCredentials: true,
        });
        setUser(userRes.data);
      }
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    // Clear token cookie
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };
};
