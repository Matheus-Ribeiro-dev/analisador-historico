// src/components/ProductCard.js
import React from 'react';
import { Box, Typography, Divider, Paper, Grid } from '@mui/material';

// func para dar cor  saude do Estoque
const getStockHealthColor = (health) => {
  if (health === 'Em Risco') return 'error.main'; // Vermelho
  if (health === 'Excesso') return 'warning.main'; // Amarelo
  return 'success.main'; // Verde
};

function ProductCard({ productData }) {
  let currentStock = 0;
  let currentMonthSales = 0;
  let lastMonthSales = 0;
  let stockCoverage = 'N/A';
  let inventoryTurnover = 'N/A';
  let stockHealth = 'N/A';

  const historyExists = productData.history && productData.history.length > 0;

  if (historyExists) {
    // Ordenar histórico do mais recente para o mais antigo
    const sortedHistory = [...productData.history].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    // Registro mais recente
    const latestRecord = sortedHistory[0];
    currentStock = latestRecord.closing_stock || 0;
    currentMonthSales = latestRecord.sold_quantity || 0;

    // Registro do mes passado
    const lastMonthRecord = sortedHistory[1];
    lastMonthSales = lastMonthRecord?.sold_quantity || 0;

    // Pegar ultimos 3 meses
    const recentHistory = sortedHistory.slice(0, 3);

    // Cobertura de estoque em dias
    if (recentHistory.length > 0) {
      const totalSalesRecent = recentHistory.reduce(
        (sum, record) => sum + (record.sold_quantity || 0),
        0
      );
      const avgMonthlySales = totalSalesRecent / recentHistory.length;
      const avgDailySales = avgMonthlySales / 30;

      if (avgDailySales > 0) {
        stockCoverage = Math.round(currentStock / avgDailySales);
      }

      // Giro de estoque
      const totalClosingStockRecent = recentHistory.reduce(
        (sum, record) => sum + (record.closing_stock || 0),
        0
      );
      const avgStockRecent = totalClosingStockRecent / recentHistory.length;

      if (avgStockRecent > 0 && avgMonthlySales > 0) {
        inventoryTurnover = (avgMonthlySales / avgStockRecent).toFixed(2);
      }
    }

    // Saúde do estoque
    if (stockCoverage !== 'N/A') {
      if (stockCoverage < 30) stockHealth = 'Em Risco';
      else if (stockCoverage > 90) stockHealth = 'Excesso';
      else stockHealth = 'Saudável';
    }
  }
//
    const imageUrl = `${process.env.REACT_APP_IMAGE_BASE_URL}/${productData.product_code}.png`;

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2, borderRadius: '12px' }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} lg={3} sx={{ textAlign: 'center' }}>
          <Box
            component="img"
            sx={{
              height: 160,
              width: 160,
              borderRadius: '8px',
              objectFit: 'cover',
            }}
            alt={productData.product_name}
            src={imageUrl}
          />
        </Grid>
        <Grid item xs={12} lg={9}>
          <Typography variant="h5" component="h2" fontWeight="bold">
            {productData.product_name}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Código: {productData.product_code}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2} textAlign="center">
            <Grid item xs={6} sm={4} md={2}>
              <Typography variant="overline">Estoque Atual</Typography>
              <Typography variant="h5" fontWeight="bold">
                {currentStock}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Typography variant="overline">Venda Mês (parcial)</Typography>
              <Typography variant="h5" fontWeight="bold">
                {currentMonthSales}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Typography variant="overline">Venda Mês Passado</Typography>
              <Typography variant="h5" fontWeight="bold">
                {lastMonthSales}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Typography variant="overline">Cobertura</Typography>
              <Typography variant="h5" fontWeight="bold">
                {stockCoverage} <span style={{ fontSize: '0.9rem' }}>dias</span>
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Typography variant="overline">Giro</Typography>
              <Typography variant="h5" fontWeight="bold">
                {inventoryTurnover}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Typography variant="overline">Saúde (ST)</Typography>
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{ color: getStockHealthColor(stockHealth) }}
              >
                {stockHealth}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default ProductCard;
