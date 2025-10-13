/**
 * Componente de dropdown UF/Cidade otimizado
 * Implementa todas as funcionalidades solicitadas:
 * - Dropdown de UF com todos os estados
 * - Dropdown de cidades filtradas por UF
 * - Fechamento automático ao clicar fora
 * - Sem necessidade de tecla ESC
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  TextField,
  Box,
  CircularProgress,
  Typography,
  Chip,
  Autocomplete,
  Grid
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Public as PublicIcon
} from '@mui/icons-material';
import useUfCidadeDropdowns from '../hooks/useUfCidadeDropdowns';

const UfCidadeDropdown = ({
  valueUf = '',
  valueCidade = '',
  onChangeUf,
  onChangeCidade,
  labelUf = 'Estado (UF)',
  labelCidade = 'Cidade',
  placeholderUf = 'Selecione um estado',
  placeholderCidade = 'Selecione uma cidade',
  disabled = false,
  required = false,
  showSearch = true,
  sx = {}
}) => {
  const {
    ufSelecionada,
    cidadeSelecionada,
    buscaCidade,
    ufOptions,
    cidadeOptions,
    loadingUf,
    loadingCidade,
    handleUfChange,
    handleCidadeChange,
    handleBuscaCidade,
    isDataLoaded,
    hasCidades,
    getCidadeSelecionada,
    getUfSelecionada
  } = useUfCidadeDropdowns();

  // Sincronizar com props externas
  useEffect(() => {
    if (valueUf !== ufSelecionada) {
      handleUfChange(valueUf);
    }
  }, [valueUf, ufSelecionada, handleUfChange]);

  useEffect(() => {
    if (valueCidade !== cidadeSelecionada) {
      handleCidadeChange(valueCidade);
    }
  }, [valueCidade, cidadeSelecionada, handleCidadeChange]);

  const handleUfSelect = (event, newValue) => {
    const value = newValue ? newValue.value : '';
    handleUfChange(value);
    if (onChangeUf) {
      onChangeUf(value);
    }
  };

  const handleCidadeSelect = (event, newValue) => {
    const value = newValue ? newValue.value : '';
    handleCidadeChange(value);
    if (onChangeCidade) {
      onChangeCidade(value);
    }
  };

  const ufSelecionadaData = getUfSelecionada();
  const cidadeSelecionadaData = getCidadeSelecionada();

  return (
    <>
      <Grid item xs={12} md={6}>
        <Autocomplete
          options={ufOptions}
          getOptionLabel={(option) => option.sigla ? `${option.nome} (${option.sigla})` : ''}
          value={ufOptions.find(u => u.value === ufSelecionada) || null}
          onChange={handleUfSelect}
          loading={loadingUf}
          disabled={disabled || loadingUf}
          renderInput={(params) => (
            <TextField
              {...params}
              label={labelUf}
              variant="outlined"
              required={required}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingUf ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(props, option) => (
            <li {...props}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PublicIcon color="action" fontSize="small" />
                <Box>
                  <Typography variant="body2">{option.nome}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.sigla} • {option.regiao}
                  </Typography>
                </Box>
              </Box>
            </li>
          )}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          noOptionsText="Nenhum estado encontrado"
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Autocomplete
          options={cidadeOptions}
          getOptionLabel={(option) => option.nome || ''}
          value={cidadeOptions.find(c => c.value === cidadeSelecionada) || null}
          onChange={handleCidadeSelect}
          loading={loadingCidade}
          disabled={disabled || loadingCidade || !ufSelecionada}
          renderInput={(params) => (
            <TextField
              {...params}
              label={labelCidade}
              variant="outlined"
              required={required}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingCidade ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(props, option) => (
            <li {...props}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon color="action" fontSize="small" />
                <Typography variant="body2">{option.nome}</Typography>
              </Box>
            </li>
          )}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          noOptionsText={!ufSelecionada ? "Selecione um estado primeiro" : "Nenhuma cidade encontrada"}
        />
      </Grid>
    </>
  );
};

export default UfCidadeDropdown;
