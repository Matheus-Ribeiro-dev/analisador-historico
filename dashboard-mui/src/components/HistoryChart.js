// src/components/HistoryChart.js

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Paper, Typography } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

function HistoryChart({ history }) {
  //1 Ordenar historico do mais antigo para o mais recente
  const sortedHistory = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));

  // 2. Encontrar o primeiro registro que tenha algum dado válido
  const firstValidIndex = sortedHistory.findIndex(record =>
    // Verifica se a movimentação ou estoque inicial nao é zero, nulo, ou indefinido
    (record.opening_stock && record.opening_stock !== 0) ||
    (record.inbound_quantity && record.inbound_quantity !== 0) ||
    (record.sold_quantity && record.sold_quantity !== 0)
  );

  // 3. Usa slice() para criar um novo array a partir do índice válido e chama de filteredHistory
  const filteredHistory = firstValidIndex === -1
    ? []
    : sortedHistory.slice(firstValidIndex);
  const chartData = {
    labels: filteredHistory.map(record =>
      new Date(record.date).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
    ),
    datasets: [
      {
        label: 'Estoque Inicial',
        data: filteredHistory.map(record => record.opening_stock),
        backgroundColor: '#4E9AE1',
        stack: 'stack1',
      },
      {
        label: 'Entradas',
        data: filteredHistory.map(record => record.inbound_quantity),
        backgroundColor: '#366B9D',
        stack: 'stack1',
        hidden: true,
      },
      {
        label: 'Vendas',
        data: filteredHistory.map(record => -record.sold_quantity),
        backgroundColor: '#E57575',
        stack: 'stack1',
      },
    ],
  };


  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold' },
        formatter: (value) => (value < 0 ? `${Math.abs(value)}` : value),
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const val = context.raw;
            return `${context.dataset.label}: ${val < 0 ? Math.abs(val) : val} unidades`;
          },
        },
      },
    },
    scales: {
      x: { stacked: true, title: { display: true, text: 'Mês' } },
      y: {
        stacked: true,
        title: { display: true, text: 'Quantidade' },
      },
    },
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4, borderRadius: '12px' }}>
      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
        Evolução Histórica
      </Typography>
      <Bar options={options} data={chartData} />
    </Paper>
  );
}

export default HistoryChart;
