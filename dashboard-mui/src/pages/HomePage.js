// src/pages/HomePage.js

import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import axios from 'axios';

// Ícones para os cards
import StorefrontIcon from '@mui/icons-material/Storefront';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import FlagIcon from '@mui/icons-material/Flag';
import BarChartIcon from '@mui/icons-material/BarChart';
import TableChartIcon from '@mui/icons-material/TableChart';

// Componente para os cards de KPI
const KPICard = ({ title, value, icon }) => (
  <Card elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
    <Box sx={{ mr: 2 }}>{icon}</Box>
    <Box>
      <Typography variant="h6" color="text.secondary">{title}</Typography>
      <Typography variant="h4" fontWeight="bold">{value}</Typography>
    </Box>
  </Card>
);

const ServiceCard = ({ name, description, path, icon }) => (
  <Card sx={{ height: '100%', transition: '0.2s', '&:hover': { transform: 'scale(1.02)', boxShadow: 6 } }}>
    <RouterLink to={path} style={{ textDecoration: 'none', color: 'inherit' }}>
      <CardContent sx={{ textAlign: 'center', p: 4 }}>
        {icon}
        <Typography gutterBottom variant="h5" component="div" sx={{ mt: 2, fontWeight: 'bold' }}>
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </RouterLink>
  </Card>
);

function HomePage() {
  const { user } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

 useEffect(() => {
    const fetchKpis = async () => {
      // 1. Limpa erros antigos e ativa o loading
      setError('');
      setLoading(true);

      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/kpis/gerais`);
        // 2. Se a chamada for bem-sucedida, atualiza os KPIs
        setKpis(response.data);
      } catch (err) {
        // 3. Se falhar, define a mensagem de erro
        setError('Não foi possível carregar os KPIs.');
        console.error(err);
      } finally {
        // 4. Desativa o loading, não importa o que aconteça
        setLoading(false);
      }
    };

    fetchKpis();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  const getMetaPercent = () => {
    if (!kpis || !kpis.meta_exemplo) return 0;
    return (kpis.vendas_mes_atual / kpis.meta_exemplo) * 100;
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4">
          Bem-vindo, {user ? user.username.toUpperCase() : 'Usuário'}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>
      </Box>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {kpis && (
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} sm={6} md={4}>
            <KPICard title="Venda (Mês Atual)" value={formatCurrency(kpis.vendas_mes_atual)} icon={<AttachMoneyIcon color="primary" sx={{ fontSize: 40 }} />} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <KPICard title="Meta Atingida (Mês)" value={`${getMetaPercent().toFixed(1)}%`} icon={<FlagIcon color="primary" sx={{ fontSize: 40 }} />} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <KPICard title="Lojas Ativas" value={kpis.total_lojas} icon={<StorefrontIcon color="primary" sx={{ fontSize: 40 }} />} />
          </Grid>
        </Grid>
      )}

      <Typography variant="h5" gutterBottom>Ferramentas de Análise</Typography>
      <Grid container spacing={4} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <ServiceCard
            name='Análise de Sellout'
            description='Dashboard individual de produto, com KPIs e histórico de fluxo de estoque.'
            path='/sellout'
            icon={<BarChartIcon color="primary" sx={{ fontSize: 50 }} />}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <ServiceCard
            name='Análise Dinâmica (BI)'
            description='Ferramenta de exploração de dados para criar suas próprias análises e relatórios.'
            path='/analise'
            icon={<TableChartIcon color="primary" sx={{ fontSize: 50 }} />}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default HomePage;