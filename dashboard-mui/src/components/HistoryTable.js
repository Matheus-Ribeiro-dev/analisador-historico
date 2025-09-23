// src/components/HistoryTable.js

import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography } from '@mui/material';

function HistoryTable({ history }) {
  const sortedHistory = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <Box sx={{ mt: 4, boxShadow: 2, border: '1px solid #E0E0E0', borderRadius: 2 }}>
      <Typography variant="h6" component="h3" sx={{ padding: 2 }}>
        Histórico Detalhado
      </Typography>
      <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
        <Table aria-label="tabela de histórico">
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Mês</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Est. Inicial</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Entradas</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Vendas</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedHistory.map((row) => (
              <TableRow key={row.date}>
                <TableCell component="th" scope="row">
                  {new Date(row.date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                </TableCell>
                <TableCell align="right">{row.opening_stock}</TableCell>
                <TableCell align="right">{row.inbound_quantity}</TableCell>
                <TableCell align="right">{row.sold_quantity}</TableCell> {/* <<< Sem o sinal de menos e sem cor */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default HistoryTable;