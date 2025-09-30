import React, { useState } from 'react';
import axios from 'axios';
import { Container, Typography, Box, CircularProgress, Alert, ButtonGroup, Button, Divider, Drawer,Toolbar, Fab } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

// Importando os componentes de UI
import ProductSearch from '../components/ProductSearch';
import ProductCard from '../components/ProductCard';
import HistoryChart from '../components/HistoryChart';
import HistoryTable from '../components/HistoryTable';

// O nome da função foi corrigido para DashboardPage
function DashboardPage() {
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(true);
  const [viewMode, setViewMode] = useState('grafico');

  const fetchProduct = async (searchTerm) => {
    setIsSearchOpen(false);
    setLoading(true);
    setError(null);
    setProductData(null);
    try {
      // Lembre-se que o token agora é enviado automaticamente pelo AuthContext
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/products/${searchTerm}`);
      setProductData(response.data);
    } catch (err) {
      setError('Produto não encontrado ou erro na busca.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ my: 0.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          Dashboard SellOut
        </Typography>

      </Box>
      <Divider />

      <Drawer
        anchor="top"
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      >
      <Toolbar />
        <Container sx={{ py: 4 }}>
            <ProductSearch onSearch={fetchProduct} />
        </Container>
      </Drawer>

      {!isSearchOpen && (
        <Fab
          color="primary"
          aria-label="buscar"
          onClick={() => setIsSearchOpen(true)}
          sx={{ position: 'fixed', bottom: 32, right: 32 }}
        >
          <SearchIcon />
        </Fab>
      )}

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        {loading && <CircularProgress />}
      </Box>
      {!productData && !loading && !isSearchOpen && (
        <Alert severity="info" sx={{ mt: 4 }}>
          Clique no ícone de busca para pesquisar um produto.
        </Alert>
      )}
      {error && <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>}

      {productData && (
        <Box sx={{ mt: 4 }}>
          <ProductCard productData={productData} />
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <ButtonGroup variant="outlined">
              <Button onClick={() => setViewMode('grafico')} variant={viewMode === 'grafico' ? 'contained' : 'outlined'}>Gráfico</Button>
              <Button onClick={() => setViewMode('tabela')} variant={viewMode === 'tabela' ? 'contained' : 'outlined'}>Tabela</Button>
            </ButtonGroup>
          </Box>
          {viewMode === 'grafico' ? <HistoryChart history={productData.history} /> : <HistoryTable history={productData.history} />}
        </Box>
      )}
    </Container>
  );
}

// A linha de exportação também foi corrigida
export default DashboardPage;