// src/components/UfCidadeDropdown.js
import React, { memo } from 'react';
import { Grid, TextField, Autocomplete, CircularProgress } from '@mui/material';
import useUfCidadeDropdowns from '../hooks/useUfCidadeDropdowns';

/**
 * Componente reutilizável para pares de dropdowns UF e Cidade
 * 
 * Props:
 * - valueUf: valor da UF selecionada
 * - valueCidade: valor da cidade selecionada
 * - onChangeUf: callback quando a UF muda (recebe o valor da nova UF)
 * - onChangeCidade: callback quando a cidade muda (recebe o valor da nova cidade)
 * - labelUf: label do campo UF (opcional, padrão: "UF")
 * - labelCidade: label do campo Cidade (opcional, padrão: "Cidade")
 * - errorUf: mensagem de erro para UF (opcional)
 * - errorCidade: mensagem de erro para Cidade (opcional)
 * - gridBreakpoints: objeto com breakpoints para os Grid items (opcional)
 *   Exemplo: { uf: { xs: 12, md: 6 }, cidade: { xs: 12, md: 6 } }
 */
const UfCidadeDropdown = ({
  valueUf,
  valueCidade,
  onChangeUf,
  onChangeCidade,
  labelUf = "UF",
  labelCidade = "Cidade",
  errorUf,
  errorCidade,
  gridBreakpoints = {}
}) => {
  // Extrair breakpoints ou usar padrões
  const { uf: ufBp = { xs: 12, md: 6 }, cidade: cidadeBp = { xs: 12, md: 6 } } = gridBreakpoints;
  const {
    ufOptions,
    cidadeOptions,
    loadingUf,
    loadingCidade,
    handleUfChange,
    handleCidadeChange,
  } = useUfCidadeDropdowns(valueUf, valueCidade);

  // Handler interno para UF
  const handleUfChangeInternal = (event, newValue) => {
    const newUf = newValue ? newValue.sigla : '';
    handleUfChange(newUf);
    if (onChangeUf) {
      onChangeUf(newUf);
    }
  };

  // Handler interno para Cidade
  const handleCidadeChangeInternal = (event, newValue) => {
    const newCidade = newValue ? (newValue.nome || newValue.value || newValue) : '';
    handleCidadeChange(newCidade);
    if (onChangeCidade) {
      onChangeCidade(newCidade);
    }
  };

  // Encontrar a UF selecionada
  const ufSelecionadaObj = ufOptions.find(u => u.value === valueUf || u.sigla === valueUf) || null;

  // Encontrar a cidade selecionada
  const cidadeSelecionadaObj = cidadeOptions.find(c => c.value === valueCidade || c.nome === valueCidade) || null;

  return (
    <>
      <Grid item {...ufBp}>
        <Autocomplete
          options={ufOptions}
          getOptionLabel={(option) => option.sigla || ''}
          value={ufSelecionadaObj}
          onChange={handleUfChangeInternal}
          renderInput={(params) => (
            <TextField
              {...params}
              label={labelUf}
              variant="outlined"
              size="small"
              error={!!errorUf}
              helperText={errorUf}
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
          isOptionEqualToValue={(option, value) => option.sigla === value.sigla}
          noOptionsText="Nenhum estado encontrado"
          loading={loadingUf}
        />
      </Grid>
      <Grid item {...cidadeBp}>
        <Autocomplete
          options={cidadeOptions}
          getOptionLabel={(option) => {
            if (typeof option === 'string') return option;
            return option.nome || option.value || '';
          }}
          value={cidadeSelecionadaObj}
          onChange={handleCidadeChangeInternal}
          renderInput={(params) => (
            <TextField
              {...params}
              label={labelCidade}
              variant="outlined"
              size="small"
              error={!!errorCidade}
              helperText={errorCidade}
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
          disabled={!valueUf || cidadeOptions.length === 0}
          noOptionsText={!valueUf ? "Selecione uma UF" : "Nenhuma cidade encontrada"}
          loading={loadingCidade}
        />
      </Grid>
    </>
  );
};

export default memo(UfCidadeDropdown);
