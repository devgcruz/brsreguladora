import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Grid,
  Alert,
  Chip,
  Divider,
  Button
} from '@mui/material';
import { validatePlaca, validPlacaExamples, invalidPlacaExamples } from '../utils/placaValidator';

const PlacaValidatorDemo = () => {
  const [inputPlaca, setInputPlaca] = useState('');
  const [validationResult, setValidationResult] = useState(null);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputPlaca(value);
    
    if (value.trim()) {
      const result = validatePlaca(value);
      setValidationResult(result);
    } else {
      setValidationResult(null);
    }
  };

  const testExamplePlaca = (placa) => {
    setInputPlaca(placa);
    const result = validatePlaca(placa);
    setValidationResult(result);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🚗 Validador de Placas - Demo
      </Typography>
      
      <Typography variant="body1" paragraph>
        Este componente demonstra a validação de placas que aceita tanto o padrão antigo brasileiro (ABC-1234) 
        quanto o padrão Mercosul (ABC1D23).
      </Typography>

      {/* Campo de teste */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Teste sua placa:
        </Typography>
        
        <TextField
          fullWidth
          label="Placa"
          placeholder="Digite uma placa (ABC-1234 ou ABC1D23)..."
          value={inputPlaca}
          onChange={handleInputChange}
          variant="outlined"
          error={validationResult?.isValid === false}
          helperText={
            validationResult 
              ? validationResult.message 
              : 'Aceita padrão antigo (ABC-1234) ou Mercosul (ABC1D23)'
          }
          sx={{ mb: 2 }}
        />

        {validationResult && (
          <Alert 
            severity={validationResult.isValid ? 'success' : 'error'}
            sx={{ mb: 2 }}
          >
            <Typography variant="subtitle2">
              {validationResult.isValid ? '✅ Placa Válida' : '❌ Placa Inválida'}
            </Typography>
            <Typography variant="body2">
              {validationResult.message}
            </Typography>
            {validationResult.format && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Formato detectado:</strong> {validationResult.format === 'old_brazilian' ? 'Padrão Antigo Brasileiro' : 'Mercosul'}
              </Typography>
            )}
          </Alert>
        )}
      </Paper>

      {/* Exemplos válidos */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          📋 Exemplos de Placas Válidas
        </Typography>
        
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Padrão Antigo Brasileiro (ABC-1234):
        </Typography>
        <Box sx={{ mb: 2 }}>
          {validPlacaExamples.old_brazilian.map((placa, index) => (
            <Chip
              key={index}
              label={placa}
              onClick={() => testExamplePlaca(placa)}
              color="primary"
              variant="outlined"
              sx={{ mr: 1, mb: 1, cursor: 'pointer' }}
            />
          ))}
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Padrão Mercosul (ABC1D23):
        </Typography>
        <Box sx={{ mb: 2 }}>
          {validPlacaExamples.mercosul.map((placa, index) => (
            <Chip
              key={index}
              label={placa}
              onClick={() => testExamplePlaca(placa)}
              color="secondary"
              variant="outlined"
              sx={{ mr: 1, mb: 1, cursor: 'pointer' }}
            />
          ))}
        </Box>
      </Paper>

      {/* Exemplos inválidos */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          ❌ Exemplos de Placas Inválidas
        </Typography>
        
        <Grid container spacing={1}>
          {invalidPlacaExamples.slice(0, 12).map((placa, index) => (
            <Grid item key={index}>
              <Chip
                label={placa || '(vazia)'}
                onClick={() => testExamplePlaca(placa)}
                color="error"
                variant="outlined"
                size="small"
                sx={{ cursor: 'pointer' }}
              />
            </Grid>
          ))}
        </Grid>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Clique em qualquer placa acima para testá-la
        </Typography>
      </Paper>

      {/* Informações técnicas */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          ℹ️ Informações Técnicas
        </Typography>
        
        <Typography variant="body2" paragraph>
          <strong>Padrão Antigo Brasileiro:</strong> 3 letras + hífen + 4 números (ex: ABC-1234)
        </Typography>
        
        <Typography variant="body2" paragraph>
          <strong>Padrão Mercosul:</strong> 3 letras + 1 número + 1 letra + 2 números (ex: ABC1D23)
        </Typography>
        
        <Typography variant="body2" paragraph>
          <strong>Funcionalidades:</strong>
        </Typography>
        <ul>
          <li>✅ Conversão automática para maiúsculas</li>
          <li>✅ Remoção de espaços extras</li>
          <li>✅ Aceita hífen opcional no padrão antigo</li>
          <li>✅ Validação em tempo real</li>
          <li>✅ Mensagens de erro informativas</li>
        </ul>
      </Paper>
    </Box>
  );
};

export default PlacaValidatorDemo;
