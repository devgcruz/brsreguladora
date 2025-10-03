/**
 * Componente de debug para mostrar estatísticas do cache
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import cacheService from '../services/cacheService';
import optimizedUfCidadeService from '../services/optimizedUfCidadeService';

const CacheDebugPanel = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    try {
      const cacheStats = cacheService.getStats();
      const optimizedStats = optimizedUfCidadeService.getCacheStats();
      
      setStats({
        cache: cacheStats,
        optimized: optimizedStats,
        timestamp: new Date().toLocaleString()
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatAge = (timestamp) => {
    if (!timestamp) return 'N/A';
    const age = Date.now() - timestamp;
    const minutes = Math.floor(age / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const clearAllCache = async () => {
    try {
      cacheService.clearAll();
      optimizedUfCidadeService.clearCache();
      await loadStats();
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  };

  if (!stats) {
    return (
      <Card>
        <CardContent>
          <Typography>Carregando estatísticas...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StorageIcon />
          Cache Debug Panel
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadStats}
            disabled={loading}
            size="small"
          >
            Atualizar
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={clearAllCache}
            size="small"
          >
            Limpar Cache
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {/* Estatísticas Gerais */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <SpeedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Performance
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Cidades em Cache:</Typography>
                  <Chip
                    label={stats.cache?.cidades?.cached ? 'Sim' : 'Não'}
                    color={stats.cache?.cidades?.cached ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Colaboradores em Cache:</Typography>
                  <Chip
                    label={stats.cache?.colaboradores?.cached ? 'Sim' : 'Não'}
                    color={stats.cache?.colaboradores?.cached ? 'success' : 'default'}
                    size="small"
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Última Atualização:</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats.timestamp}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Detalhes do Cache */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <StorageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Detalhes do Cache
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Cidades:</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats.cache?.cidades?.count || 0} itens
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Colaboradores:</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats.cache?.colaboradores?.count || 0} itens
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Idade do Cache:</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatAge(stats.cache?.cidades?.age)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Informações Técnicas */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Informações Técnicas</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Status do Cache:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={`Cidades: ${stats.cache?.cidades?.cached ? 'Cache Hit' : 'Cache Miss'}`}
                      color={stats.cache?.cidades?.cached ? 'success' : 'warning'}
                      size="small"
                    />
                    <Chip
                      label={`Colaboradores: ${stats.cache?.colaboradores?.cached ? 'Cache Hit' : 'Cache Miss'}`}
                      color={stats.cache?.colaboradores?.cached ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Versão do Cache:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    v2 (com versionamento automático)
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Estratégia de Cache:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • UFs: Dados fixos (JSON local)<br/>
                    • Cidades: Cache local + API (carregamento único)<br/>
                    • Colaboradores: Cache local + API (24h TTL)
                  </Typography>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CacheDebugPanel;
