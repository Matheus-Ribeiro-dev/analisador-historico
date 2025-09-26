
// src/pages/LoginPage.js

import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Alert, Paper } from '@mui/material';

// logo
import Logo from './assets/logo-maridata.png';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const auth = useAuth();
  const navigate = useNavigate();

    if (auth.isAuthenticated) {
    return <Navigate to="/" />;
    }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const success = await auth.login(username, password);
    if (success) {
      navigate('/');
    } else {
      setError('Usuário ou senha inválidos.');
    }
  };

  return (
    <Container
      component="main"
      maxWidth={false}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f5f5, #eaeafc)',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 400,
          borderRadius: 3,
        }}
      >
        <Box
          component="img"
          src={Logo}
          alt="Logo MariData"
          sx={{ width: 200, mb: 1 }}
        />

        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
          Service BI
        </Typography>

        <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          Conectar-se!
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Nome de Usuário"
            name="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 4,
              py: 1.2,
              background: 'linear-gradient(135deg, #7b2ff7, #9f44d3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #6a24d3, #892bb8)',
              },
            }}
          >
            Entrar
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default LoginPage;
