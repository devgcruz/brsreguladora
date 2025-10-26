import React, { useState, useEffect, useMemo, memo } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer
} from 'recharts';
import dashboardService from '../services/dashboardService';

const DashboardPage = memo(() => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    montadoras: [],
    tipoServico: [],
    situacao: [],
    evolucaoEntradas: [],
    evolucaoHonorarios: [],
    evolucaoDespesas: []
  });

  // Cores para os gráficos
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#0088FE', '#00C49F', '#FFBB28'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const dashboardData = await dashboardService.getAllDashboardData();
        setData(dashboardData);
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
        setError('Erro ao carregar dados do dashboard. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Dados dos gráficos com cores aplicadas
  const dadosMontadoras = useMemo(() => 
    data.montadoras.map((item, index) => ({
      name: item.name,
      value: item.y,
      color: COLORS[index % COLORS.length]
    })), [data.montadoras]);

  const dadosTipoServico = useMemo(() => 
    data.tipoServico.map((item, index) => ({
      name: item.name,
      value: item.y,
      color: COLORS[index % COLORS.length]
    })), [data.tipoServico]);

  const dadosSituacao = useMemo(() => 
    data.situacao.map((item, index) => ({
      name: item.name,
      value: item.y,
      color: COLORS[index % COLORS.length]
    })), [data.situacao]);

  const dadosEvolucaoEntradas = useMemo(() => 
    data.evolucaoEntradas.map(item => ({
      mes: item.month,
      entradas: item.value
    })), [data.evolucaoEntradas]);

  const dadosEvolucaoHonorarios = useMemo(() => 
    data.evolucaoHonorarios.map(item => ({
      mes: item.month,
      honorarios: item.value
    })), [data.evolucaoHonorarios]);

  const dadosEvolucaoDespesas = useMemo(() => 
    data.evolucaoDespesas.map(item => ({
      mes: item.month,
      despesas: item.value
    })), [data.evolucaoDespesas]);


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }


  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard - Sistema BRS
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Indicadores e análises do sistema.
      </Typography>


      {/* Gráficos */}
      <Grid container spacing={3}>
        {/* Percentual de Veículos por Montadora - Gráfico de Pizza */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Percentual de Veículos por Montadora
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosMontadoras}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosMontadoras.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Percentual por Tipo de Serviço - Gráfico de Rosca */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Percentual por Tipo de Serviço
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosTipoServico}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dadosTipoServico.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Quantidade por Situação - Gráfico de Colunas */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Quantidade por Situação
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosSituacao}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Evolução Mensal de Entradas - Gráfico de Linha */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Evolução Mensal de Entradas
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dadosEvolucaoEntradas}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="entradas" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Evolução Mensal de Honorários - Gráfico de Colunas */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Evolução Mensal de Honorários
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosEvolucaoHonorarios}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Honorários']} />
                <Bar dataKey="honorarios" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Evolução Mensal de Despesas - Gráfico de Área */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Evolução Mensal de Despesas (Valor de Diligência)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dadosEvolucaoDespesas}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Despesas']} />
                <Area type="monotone" dataKey="despesas" stroke="#ffc658" fill="#ffc658" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
});

export default memo(DashboardPage);

