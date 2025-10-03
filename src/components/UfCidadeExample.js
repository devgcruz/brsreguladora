/**
 * Exemplo de uso do componente UfCidadeDropdown
 * Demonstra todas as funcionalidades implementadas
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import UfCidadeDropdown from './UfCidadeDropdown';

const UfCidadeExample = () => {
  const [ufSelecionada, setUfSelecionada] = useState('');
  const [cidadeSelecionada, setCidadeSelecionada] = useState('');
  const [historico, setHistorico] = useState([]);

  const handleUfChange = (value) => {
    setUfSelecionada(value);
    setCidadeSelecionada(''); // Limpar cidade quando UF mudar
  };

  const handleCidadeChange = (value) => {
    setCidadeSelecionada(value);
    
    // Adicionar ao histórico
    if (value) {
      const novoItem = {
        id: Date.now(),
        uf: ufSelecionada,
        cidade: value,
        timestamp: new Date().toLocaleString()
      };
      setHistorico(prev => [novoItem, ...prev.slice(0, 4)]); // Manter apenas 5 itens
    }
  };

  const limparSelecoes = () => {
    setUfSelecionada('');
    setCidadeSelecionada('');
  };

  const resetarCidade = () => {
    setCidadeSelecionada('');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocationIcon color="primary" />
        Dropdown UF/Cidade - Exemplo de Uso
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Este exemplo demonstra todas as funcionalidades implementadas:
      </Typography>

      <Box component="ul" sx={{ mb: 3 }}>
        <li>✅ Dropdown de UF com todos os 27 estados brasileiros</li>
        <li>✅ Dropdown de cidades filtradas por UF selecionada</li>
        <li>✅ Fechamento automático ao clicar fora (sem necessidade de ESC)</li>
        <li>✅ Busca de cidades em tempo real</li>
        <li>✅ Interface responsiva e acessível</li>
      </Box>

      <Grid container spacing={3}>
        {/* Componente Principal */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Seletor UF/Cidade
              </Typography>
              
              <UfCidadeDropdown
                valueUf={ufSelecionada}
                valueCidade={cidadeSelecionada}
                onChangeUf={handleUfChange}
                onChangeCidade={handleCidadeChange}
                labelUf="Estado (UF)"
                labelCidade="Cidade"
                placeholderUf="Selecione um estado"
                placeholderCidade="Selecione uma cidade"
                showSearch={true}
                required={true}
                sx={{ mb: 2 }}
              />

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={limparSelecoes}
                  disabled={!ufSelecionada && !cidadeSelecionada}
                >
                  Limpar Tudo
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={resetarCidade}
                  disabled={!cidadeSelecionada}
                >
                  Limpar Cidade
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Informações da Seleção */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Seleção Atual
              </Typography>
              
              {ufSelecionada ? (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Estado:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {ufSelecionada}
                  </Typography>
                  
                  {cidadeSelecionada ? (
                    <>
                      <Typography variant="body2" color="text.secondary">
                        Cidade:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {cidadeSelecionada}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Nenhuma cidade selecionada
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nenhuma seleção feita
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Histórico */}
          {historico.length > 0 && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Histórico Recente
                </Typography>
                
                {historico.map((item) => (
                  <Box key={item.id} sx={{ mb: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {item.cidade}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.uf} • {item.timestamp}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Instruções de Uso */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Como Usar
          </Typography>
          
          <Box component="ol" sx={{ pl: 2 }}>
            <li>
              <Typography variant="body2" paragraph>
                <strong>Selecione um Estado:</strong> Clique no primeiro dropdown e escolha um dos 27 estados brasileiros.
              </Typography>
            </li>
            <li>
              <Typography variant="body2" paragraph>
                <strong>Selecione uma Cidade:</strong> Após escolher o estado, o segundo dropdown será habilitado com as cidades daquele estado.
              </Typography>
            </li>
            <li>
              <Typography variant="body2" paragraph>
                <strong>Busque uma Cidade:</strong> Use o campo de busca para encontrar cidades específicas mais rapidamente.
              </Typography>
            </li>
            <li>
              <Typography variant="body2" paragraph>
                <strong>Fechamento Automático:</strong> Os dropdowns fecham automaticamente ao clicar fora deles, sem necessidade de pressionar ESC.
              </Typography>
            </li>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UfCidadeExample;
