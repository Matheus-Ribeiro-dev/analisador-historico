import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  //  configurar Authorization se token existir
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  const login = async (username, password) => {
    try {
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/token`, params);

      const newToken = response.data.access_token;
      setToken(newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      localStorage.setItem('authToken', newToken);
      return true;
    } catch (error) {
      console.error("Falha no login", error);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('authToken');
    window.location.href = "/login"; // força voltar pro login
  };

  const isAuthenticated = !!token;

  // capturar erros 401
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout(); // 🔑 encerra a sessão
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
