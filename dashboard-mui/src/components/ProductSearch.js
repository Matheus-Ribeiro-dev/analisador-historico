// src/components/ProductSearch.js

import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';

function ProductSearch({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');

  const inputRef = useRef(null);

  useEffect(() => {
    // Foca no input assim que ele aparece
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSearch = () => {
    if (searchTerm) {
      onSearch(searchTerm);
    }
  };


  const handleKeyPress = (event) => {
    // Se a tecla pressionada 'Enter', chama a função de busca
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box
      sx={{
        padding: 3, boxShadow: 2, border: '1px solid #E0E0E0',
        borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2,
      }}
    >
      <Typography variant="h6" component="h2">
        Buscar Produto
      </Typography>
      <TextField
        fullWidth
        id="product-search"
        label="Digite o código do produto"
        variant="outlined"
        placeholder="Ex: 10096"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyPress}
        inputRef={inputRef}
      />
      <Button variant="contained" onClick={handleSearch} fullWidth     sx={{

              background: 'linear-gradient(135deg, #7b2ff7, #9f44d3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #6a24d3, #892bb8)',
              },
            }}>
        Buscar
      </Button>
    </Box>
  );
}

export default ProductSearch;