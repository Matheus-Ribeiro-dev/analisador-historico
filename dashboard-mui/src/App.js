// src/App.js

import React from 'react';

import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MainLayout from './components/MainLayout'; // Importamos nosso novo layout
import AnaliseDinamicaPage from './pages/AnaliseDinamicaPage';
import HomePage from './pages/HomePage';


// Seu componente PrivateRoute (porteiro) continua perfeito e inalterado
function PrivateRoute({ children }) {
  const auth = useAuth();
  return auth.isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* A rota de login é pública e fica fora do layout principal */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rota "coringa" que protege e aplica o layout a todas as outras páginas */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <MainLayout> {/* O layout só é renderizado para usuários autenticados */}
                <Routes>
                 <Route path="/" element={<HomePage />} />
                  <Route path="/sellout" element={<DashboardPage />} />
                  <Route path="/analise" element={<AnaliseDinamicaPage />} />
                  {/* Qualquer outra página interna que criarmos virá aqui */}
                </Routes>
              </MainLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;