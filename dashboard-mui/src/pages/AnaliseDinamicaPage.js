// src/pages/AnaliseDinamicaPage.js

import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Box, Typography, Button, CircularProgress, Alert, Paper, Collapse } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import PainelDeControle from '../components/PainelDeControle';
import { AgGridReact } from 'ag-grid-react';
import DownloadIcon from '@mui/icons-material/Download';


function AnaliseDinamicaPage() {
  const gridRef = useRef();
  const [painelAberto, setPainelAberto] = useState(true);
  // Estados para os filtros
  const [dataInicial, setDataInicial] = useState(null);
  const [dataFinal, setDataFinal] = useState(null);
  const [dimensoes, setDimensoes] = useState([]);
  const [metricas, setMetricas] = useState([]);
  const [filtros, setFiltros] = useState({});

  // Estados para o resultado
  const [resultado, setResultado] = useState([]);
  const [colunas, setColunas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


    const onExportClick = () => {
      if (gridRef.current && gridRef.current.api) {
        gridRef.current.api.exportDataAsCsv({
          fileName: 'analise_dinamica.csv',
          columnSeparator: ';', // ✅ PONTO E VÍRGULA
          suppressQuotes: true, // ✅ SEM ASPAS (opcional)
          skipColumnGroupHeaders: true,
          skipColumnHeaders: false,
          skipRowGroups: true,
          allColumns: true,
          processCellCallback: (params) => {
            if (typeof params.value === 'number') {
              return params.value.toLocaleString('pt-BR'); // 1.000,00
            }
            return params.value;
          }
        });
      }
    };

  const handleAnalisar = async () => {
    if (!dataInicial || !dataFinal || dimensoes.length === 0 || metricas.length === 0) {
      setError("Por favor, preencha as datas e selecione ao menos uma dimensão e uma métrica.");
      return;
    }
    setError('');
    setLoading(true);
    setResultado([]);
    setColunas([]);
    setPainelAberto(false);

    const filtrosAtivos = Object.fromEntries(
      Object.entries(filtros).filter(([_, v]) => v != null && v.trim() !== '')
    );

    const queryRequest = {
      data_inicial: dataInicial.toISOString().split('T')[0],
      data_final: dataFinal.toISOString().split('T')[0],
      dimensoes: dimensoes,
      metricas: metricas,
      filtros: filtrosAtivos
    };

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/query`, queryRequest);
      if (response.data && response.data.length > 0) {
        const colunasDimensoes = dimensoes.map(d => ({ headerName: d.replace(/_/g, ' ').toUpperCase(), field: d, sortable: true, filter: true, resizable: true }));
        const colunasMetricas = metricas.map(m => ({
            headerName: (m.label || m.nome).replace(/_/g, ' ').toUpperCase(), field: m.nome, sortable: true, filter: 'agNumberColumnFilter', resizable: true,
            valueFormatter: params => (typeof params.value === 'number' && params.value.toFixed) ? params.value.toFixed(2) : params.value
        }));
        setColunas([...colunasDimensoes, ...colunasMetricas]);
        setResultado(response.data);
      } else {
        setResultado([]);
        setColunas([]);
      }
    } catch (err) {
      setError("Ocorreu um erro ao buscar os dados.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ flexGrow: 1, mb: 0 }}>
          Análise Dinâmica
        </Typography>

        {resultado.length > 0 && (
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={onExportClick}
            sx={{ mr: 2 }}
          >
            Exportar CSV
          </Button>
        )}

        <Button
          variant={painelAberto ? "contained" : "outlined"}
          startIcon={<FilterListIcon />}
          onClick={() => setPainelAberto(!painelAberto)}
        >
          {painelAberto ? 'Esconder Painel' : 'Mostrar Painel'}
        </Button>
      </Box>

      <Collapse in={painelAberto}>
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <PainelDeControle
            controlState={{ dataInicial, dataFinal, dimensoes, metricas, filtros }}
            controlSetters={{ setDataInicial, setDataFinal, setDimensoes, setMetricas, setFiltros }}
            onAnalisar={handleAnalisar}
            loading={loading}
          />
        </Paper>
      </Collapse>

      <Paper elevation={3}>
          <Box className="ag-theme-quartz" sx={{ height: '75vh', width: '100%' }}>
            {loading ? (
              <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}><CircularProgress /></Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
            <AgGridReact
              ref={gridRef}
              rowData={resultado}
              columnDefs={colunas}
              defaultColDef={{ flex: 1, minWidth: 150 }}
              theme="legacy"
            />
            )}
          </Box>
      </Paper>
    </Box>
  );
}

export default AnaliseDinamicaPage;