import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Alert
} from '@mui/material';

/**
 * Componente de teste para demonstrar as correções do MUI Select
 * Implementa a validação: options.includes(selected) ? selected : ""
 */
const SelectTestExample = () => {
  const [formData, setFormData] = useState({
    marca: 'Ford', // Valor que existe nas opções
    seguradora: 'Bradesco Seguros', // Valor que existe nas opções
    status: 'FINALIZADO', // Valor que existe nas opções
    cargo: 'ADM', // Valor que NÃO existe nas opções (deve ser corrigido)
    uf: 'SP', // Valor que existe nas opções
    cidade: 'Avaré' // Valor que NÃO existe nas opções (deve ser corrigido)
  });

  // Arrays de opções
  const marcas = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Volkswagen'];
  const seguradoras = ['Porto Seguro', 'Bradesco Seguros', 'SulAmérica', 'Allianz'];
  const statusOptions = ['PENDENTE', 'EM_ANALISE', 'FINALIZADO', 'CANCELADO'];
  const cargos = ['Administrador', 'Analista', 'Operador', 'Consultor'];
  const ufs = ['SP', 'RJ', 'MG', 'RS', 'PR'];
  const cidades = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Porto Alegre'];

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleTestInvalidValues = () => {
    // Simula valores inválidos vindos de uma API
    setFormData({
      marca: 'MarcaInexistente',
      seguradora: 'SeguradoraInexistente',
      status: 'STATUS_INEXISTENTE',
      cargo: 'CargoInexistente',
      uf: 'UF_INEXISTENTE',
      cidade: 'CidadeInexistente'
    });
  };

  const handleTestValidValues = () => {
    // Simula valores válidos
    setFormData({
      marca: 'Toyota',
      seguradora: 'Porto Seguro',
      status: 'PENDENTE',
      cargo: 'Administrador',
      uf: 'RJ',
      cidade: 'Rio de Janeiro'
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Teste de Correção MUI Select
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Este componente demonstra como as correções previnem erros de "out-of-range value".
        Todos os Select usam a validação: <code>options.includes(selected) ? selected : ""</code>
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel>Marca</InputLabel>
            <Select
              value={marcas.includes(formData.marca) ? formData.marca : ""}
              label="Marca"
              onChange={handleInputChange('marca')}
            >
              {marcas.map((marca) => (
                <MenuItem key={marca} value={marca}>
                  {marca}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel>Seguradora</InputLabel>
            <Select
              value={seguradoras.includes(formData.seguradora) ? formData.seguradora : ""}
              label="Seguradora"
              onChange={handleInputChange('seguradora')}
            >
              {seguradoras.map((seguradora) => (
                <MenuItem key={seguradora} value={seguradora}>
                  {seguradora}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusOptions.includes(formData.status) ? formData.status : ""}
              label="Status"
              onChange={handleInputChange('status')}
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel>Cargo</InputLabel>
            <Select
              value={cargos.includes(formData.cargo) ? formData.cargo : ""}
              label="Cargo"
              onChange={handleInputChange('cargo')}
            >
              {cargos.map((cargo) => (
                <MenuItem key={cargo} value={cargo}>
                  {cargo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel>UF</InputLabel>
            <Select
              value={ufs.includes(formData.uf) ? formData.uf : ""}
              label="UF"
              onChange={handleInputChange('uf')}
            >
              {ufs.map((uf) => (
                <MenuItem key={uf} value={uf}>
                  {uf}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel>Cidade</InputLabel>
            <Select
              value={cidades.includes(formData.cidade) ? formData.cidade : ""}
              label="Cidade"
              onChange={handleInputChange('cidade')}
            >
              {cidades.map((cidade) => (
                <MenuItem key={cidade} value={cidade}>
                  {cidade}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          color="error"
          onClick={handleTestInvalidValues}
        >
          Testar Valores Inválidos
        </Button>
        
        <Button 
          variant="contained" 
          color="success"
          onClick={handleTestValidValues}
        >
          Testar Valores Válidos
        </Button>
      </Box>

      <Paper sx={{ mt: 3, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Estado Atual do Formulário:
        </Typography>
        <pre>{JSON.stringify(formData, null, 2)}</pre>
      </Paper>
    </Box>
  );
};

export default SelectTestExample;
