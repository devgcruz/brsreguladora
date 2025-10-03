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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  CircularProgress,
  Typography,
  Chip,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
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

  const [openUf, setOpenUf] = useState(false);
  const [openCidade, setOpenCidade] = useState(false);
  const ufRef = useRef(null);
  const cidadeRef = useRef(null);

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

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ufRef.current && !ufRef.current.contains(event.target)) {
        setOpenUf(false);
      }
      if (cidadeRef.current && !cidadeRef.current.contains(event.target)) {
        setOpenCidade(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUfSelect = (event) => {
    const value = event.target.value;
    handleUfChange(value);
    setOpenUf(false);
    if (onChangeUf) {
      onChangeUf(value);
    }
  };

  const handleCidadeSelect = (event) => {
    const value = event.target.value;
    handleCidadeChange(value);
    setOpenCidade(false);
    if (onChangeCidade) {
      onChangeCidade(value);
    }
  };

  const handleUfOpen = () => {
    if (!disabled) {
      setOpenUf(true);
    }
  };

  const handleCidadeOpen = () => {
    if (!disabled && ufSelecionada) {
      setOpenCidade(true);
    }
  };

  const ufSelecionadaData = getUfSelecionada();
  const cidadeSelecionadaData = getCidadeSelecionada();

  return (
    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, ...sx }}>
      {/* Dropdown UF */}
      <Box ref={ufRef} sx={{ flex: 1 }}>
        <FormControl fullWidth variant="outlined" required={required}>
          <InputLabel id="uf-label">{labelUf}</InputLabel>
          <Select
            labelId="uf-label"
            value={ufSelecionada}
            onChange={handleUfSelect}
            onOpen={handleUfOpen}
            onClose={() => setOpenUf(false)}
            open={openUf}
            disabled={disabled || loadingUf}
            label={labelUf}
            startAdornment={
              <InputAdornment position="start">
                <PublicIcon color="action" />
              </InputAdornment>
            }
            renderValue={(value) => {
              if (!value) return placeholderUf;
              const uf = ufOptions.find(u => u.value === value);
              return uf ? `${uf.nome} (${uf.sigla})` : value;
            }}
          >
            {loadingUf ? (
              <MenuItem disabled>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">Carregando estados...</Typography>
                </Box>
              </MenuItem>
            ) : (
              ufOptions.map((uf) => (
                <MenuItem key={uf.id} value={uf.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <LocationIcon color="action" />
                    <Box>
                      <Typography variant="body1">{uf.nome}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {uf.sigla} • {uf.regiao}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
      </Box>

      {/* Dropdown Cidade */}
      <Box ref={cidadeRef} sx={{ flex: 1 }}>
        <FormControl fullWidth variant="outlined" required={required}>
          <InputLabel id="cidade-label">{labelCidade}</InputLabel>
          <Select
            labelId="cidade-label"
            value={cidadeSelecionada}
            onChange={handleCidadeSelect}
            onOpen={handleCidadeOpen}
            onClose={() => setOpenCidade(false)}
            open={openCidade}
            disabled={disabled || loadingCidade || !ufSelecionada}
            label={labelCidade}
            startAdornment={
              <InputAdornment position="start">
                <LocationIcon color="action" />
              </InputAdornment>
            }
            renderValue={(value) => {
              if (!value) {
                if (!ufSelecionada) return 'Selecione primeiro um estado';
                return placeholderCidade;
              }
              const cidade = cidadeOptions.find(c => c.value === value);
              return cidade ? cidade.nome : value;
            }}
          >
            {!ufSelecionada ? (
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  Selecione primeiro um estado
                </Typography>
              </MenuItem>
            ) : loadingCidade ? (
              <MenuItem disabled>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">Carregando cidades...</Typography>
                </Box>
              </MenuItem>
            ) : cidadeOptions.length === 0 ? (
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  Nenhuma cidade encontrada para este estado
                </Typography>
              </MenuItem>
            ) : (
              cidadeOptions.map((cidade) => (
                <MenuItem key={cidade.id} value={cidade.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <LocationIcon color="action" />
                    <Typography variant="body1">{cidade.nome}</Typography>
                  </Box>
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
      </Box>

      {/* Campo de busca de cidade (opcional) */}
      {showSearch && ufSelecionada && (
        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            label="Buscar cidade"
            value={buscaCidade}
            onChange={(e) => handleBuscaCidade(e.target.value)}
            placeholder="Digite o nome da cidade..."
            variant="outlined"
            disabled={disabled || !ufSelecionada}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              )
            }}
          />
        </Box>
      )}

      {/* Informações da seleção atual */}
      {(ufSelecionadaData || cidadeSelecionadaData) && (
        <Box sx={{ mt: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Seleção atual:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
            {ufSelecionadaData && (
              <Chip
                label={`${ufSelecionadaData.nome} (${ufSelecionadaData.sigla})`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {cidadeSelecionadaData && (
              <Chip
                label={cidadeSelecionadaData.nome}
                size="small"
                color="secondary"
                variant="outlined"
              />
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default UfCidadeDropdown;
