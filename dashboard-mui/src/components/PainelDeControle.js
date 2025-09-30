// src/components/PainelDeControle.js - CAMPOS MENOS LARGOS

import React from 'react';
import { Typography, Grid, FormGroup, FormControlLabel, Checkbox, Button, TextField } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';

const DIMENSOES_DISPONIVEIS = [
    "nome_loja", "nome_marca", "nome_departamento", "nome_produto", "mes",
    "codigo_produto", "nome_fornecedor", "nome_classificacao", "nome_grupo", "nome_modelo"
];
const METRICAS_DISPONIVEIS = [
    { nome: "quantidade_vendida", agregacao: "SUM" },
    { nome: "venda_liquida", agregacao: "SUM" },
    { nome: "estoque_atual", agregacao: "LAST" },
    { nome: "estoque_pdv", agregacao: "LAST", label: "Estoque Preço Venda" }
];

function PainelDeControle({ controlState, controlSetters, onAnalisar, loading }) {
    const { dataInicial, dataFinal, dimensoes, metricas, filtros } = controlState;
    const { setDataInicial, setDataFinal, setDimensoes, setMetricas, setFiltros } = controlSetters;

    const handleDimensaoChange = (event) => {
        const { name, checked } = event.target;
        setDimensoes(prev => checked ? [...prev, name] : prev.filter(d => d !== name));
    };

    const handleMetricaChange = (event) => {
        const { name, checked } = event.target;
        const metricaObj = METRICAS_DISPONIVEIS.find(m => m.nome === name);
        if (checked) {
            setMetricas(prev => [...prev, metricaObj]);
        } else {
            setMetricas(prev => prev.filter(m => m.nome !== name));
        }
    };

    const handleFiltroChange = (event) => {
        const { name, value } = event.target;
        setFiltros(prev => ({ ...prev, [name]: value }));
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <Grid container spacing={2} alignItems="flex-start">
                {/* Coluna Período - CAMPOS CURTOS */}
                <Grid item xs={12} sm={4} md={2}> {/* ✅ Coluna MAIS FINA */}
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>Período</Typography>
                    <DatePicker
                        label="Inicial" // ✅ Label mais curto
                        value={dataInicial}
                        onChange={setDataInicial}
                        slotProps={{
                            textField: {
                                size: 'small',
                                margin: 'dense',
                            }
                        }}
                        sx={{ width: '100%', mb: 2, maxWidth: '190px'}} // ✅ LARGURA LIMITADA
                    />
                    <DatePicker
                        label="Final" // ✅ Label mais curto
                        value={dataFinal}
                        onChange={setDataFinal}
                        slotProps={{
                            textField: {
                                size: 'small',
                                margin: 'dense',
                            }
                        }}
                        sx={{ width: '100%', maxWidth: '190px' }} // ✅ LARGURA LIMITADA
                    />
                </Grid>

                {/* Coluna Filtros - TODOS NA MESMA COLUNA */}
                <Grid item xs={1} sm={1} md={2}> {/* ✅ Coluna MAIS CURTA */}
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>Filtros</Typography>

                    {/* TODOS OS CAMPOS UM EMBAIXO DO OUTRO */}
                    <TextField
                        label="Loja"
                        name="nome_loja"
                        value={filtros.nome_loja || ''}
                        onChange={handleFiltroChange}
                        fullWidth
                        margin="dense"
                        size="small"
                        sx={{
                        width: '180px', // ✅ LARGURA FIXA PEQUENA
                        mb: 1,
                        display: 'block'
                        }}
                    />

                    <TextField
                        label="Departamento"
                        name="nome_departamento"
                        value={filtros.nome_departamento || ''}
                        onChange={handleFiltroChange}
                        fullWidth
                        margin="dense"
                        size="small"
                        sx={{
                        width: '180px', // ✅ LARGURA FIXA PEQUENA
                        mb: 1,
                        display: 'block'
                        }}
                    />
                    <TextField
                        label="Fornecedor"
                        name="nome_fornecedor"
                        value={filtros.nome_fornecedor || ''}
                        onChange={handleFiltroChange}
                        fullWidth
                        margin="dense"
                        size="small"
                        sx={{
                        width: '180px', // ✅ LARGURA FIXA PEQUENA
                        mb: 1,
                        display: 'block'
                        }}
                    />
                                        <TextField
                        label="Cod Produto"
                        name="codigo_produto"
                        value={filtros.codigo_produto || ''}
                        onChange={handleFiltroChange}
                        fullWidth
                        margin="dense"
                        size="small"
                        sx={{
                        width: '180px', // ✅ LARGURA FIXA PEQUENA
                        mb: 1,
                        display: 'block'
                        }}
                    />
                </Grid>

                {/* Coluna Dimensões - MAIS ESPAÇO */}
                <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>Dimensões</Typography>
                    <FormGroup sx={{ maxHeight: 200, overflowY: 'auto' }}>
                        {DIMENSOES_DISPONIVEIS.map(dim => (
                            <FormControlLabel
                                key={dim}
                                control={
                                    <Checkbox
                                        name={dim}
                                        onChange={handleDimensaoChange}
                                        checked={dimensoes.includes(dim)}
                                        size="small"
                                    />
                                }
                                label={<Typography variant="body2">{dim.replace(/_/g, ' ')}</Typography>}
                            />
                        ))}
                    </FormGroup>
                </Grid>

                {/* Coluna Métricas - MAIS ESPAÇO */}
                <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>Métricas</Typography>
                    <FormGroup>
                        {METRICAS_DISPONIVEIS.map(met => (
                            <FormControlLabel
                                key={met.nome}
                                control={
                                    <Checkbox
                                        name={met.nome}
                                        onChange={handleMetricaChange}
                                        checked={metricas.some(m => m.nome === met.nome)}
                                        size="small"
                                    />
                                }
                                label={<Typography variant="body2">{met.label || met.nome.replace(/_/g, ' ')}</Typography>}
                            />
                        ))}
                    </FormGroup>
                    <Button
                        variant="contained"
                        onClick={onAnalisar}
                        sx={{ mt: 2 }}
                        fullWidth
                        size="medium"
                        disabled={loading}
                    >
                        {loading ? 'Analisando...' : 'Analisar'}
                    </Button>
                </Grid>
            </Grid>
        </LocalizationProvider>
    );
}

export default PainelDeControle;