// src/auth/AuthContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);
const API_URL = process.env.REACT_APP_API_URL;


//  é um identificador único
const authChannel = new BroadcastChannel('auth-channel');

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      try {
        const decodedToken = jwtDecode(storedToken);
        if (decodedToken.exp * 1000 < Date.now()) {
          logout(false);
        } else {
          setToken(storedToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        logout(false);
      }
    }
  }, []);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data === 'logout') {
        console.log("Recebida mensagem de logout de outra aba.");
        setToken(null);
        delete axios.defaults.headers.common['Authorization'];
        localStorage.removeItem('authToken');
      }
    };

    authChannel.addEventListener('message', handleMessage);

    return () => {
      authChannel.removeEventListener('message', handleMessage);
    };
  }, []);


  const login = async (username, password) => {
    try {
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);
        const response = await axios.post(`${API_URL}/token`, params);
        const newToken = response.data.access_token;

        setToken(newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        localStorage.setItem('authToken', newToken);
        return true;
      } catch (error) {
        console.error("Falha no login", error);
        logout(false);
        return false;
      }
  };

  const logout = (broadcast = true) => {
    if (broadcast) {
      console.log("Enviando mensagem de logout para outras abas.");
      authChannel.postMessage('logout');
    }
    setToken(null);
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('authToken');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);