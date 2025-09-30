// src/auth/AuthContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// --- Contexto e Configurações ---
const AuthContext = createContext(null);
const API_URL = process.env.REACT_APP_API_URL;

// --- Canal de Comunicação entre Abas ---
// Este é o nosso "grupo de WhatsApp" para o logout
const authChannel = new BroadcastChannel('auth-channel');


export const AuthProvider = ({ children }) => {
  // --- Estados Principais ---
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState(null); // Estado para guardar os dados do usuário (ex: username)

  // --- Efeitos ---

  // Efeito 1: Roda uma vez quando o App carrega para verificar um token existente
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      try {
        const decodedToken = jwtDecode(storedToken);
        // Verifica se a data de expiração do token já passou
        if (decodedToken.exp * 1000 < Date.now()) {
          console.log("Token expirado detectado na inicialização.");
          logout(false); // Faz o logout sem avisar outras abas (pois todas farão a mesma verificação)
        } else {
          // Se o token for válido, configura o estado e o axios
          setToken(storedToken);
          setUser({ username: decodedToken.sub }); // 'sub' é o campo padrão para o username no JWT
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.error("Token inválido ou malformado encontrado. Limpando.", error);
        logout(false);
      }
    }
  }, []);

  // Efeito 2: Fica "ouvindo" por mensagens de logout de outras abas
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data === 'logout') {
        console.log("Recebida mensagem de logout de outra aba. Deslogando...");
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
        localStorage.removeItem('authToken');
        // O componente PrivateRoute se encarregará do redirecionamento
      }
    };
    authChannel.addEventListener('message', handleMessage);
    // Limpa o "ouvinte" quando o componente é desmontado para evitar vazamento de memória
    return () => {
      authChannel.removeEventListener('message', handleMessage);
    };
  }, []);

  // --- Funções Principais ---

  const login = async (username, password) => {
    try {
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      const response = await axios.post(`${API_URL}/token`, params);
      const newToken = response.data.access_token;

      const decodedToken = jwtDecode(newToken);
      setUser({ username: decodedToken.sub }); // Guarda os dados do usuário

      setToken(newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      localStorage.setItem('authToken', newToken);
      return true;
    } catch (error) {
      console.error("Falha no login", error);
      logout(false); // Limpa qualquer estado antigo em caso de falha
      return false;
    }
  };

  const logout = (broadcast = true) => {
    // Se o logout foi iniciado por esta aba, avisa as outras
    if (broadcast) {
      console.log("Enviando mensagem de logout para outras abas.");
      authChannel.postMessage('logout');
    }
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('authToken');
  };

  const isAuthenticated = !!token;

  // --- O Provedor ---
  // Agora ele fornece o 'user' para toda a aplicação
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para facilitar o uso
export const useAuth = () => {
  return useContext(AuthContext);
};