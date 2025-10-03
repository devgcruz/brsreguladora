import React, { useState, useMemo, memo } from 'react';
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
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  AttachMoney as AttachMoneyIcon,
  DirectionsCar as DirectionsCarIcon,
  Schedule as ScheduleIcon
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

const DashboardPage = memo(() => {
  const [loading, setLoading] = useState(false);

  // Dados dos gráficos memoizados para performance
  const dadosMontadoras = useMemo(() => [
    { name: 'Toyota', value: 35, color: '#8884d8' },
    { name: 'Honda', value: 25, color: '#82ca9d' },
    { name: 'Volkswagen', value: 20, color: '#ffc658' },
    { name: 'Ford', value: 12, color: '#ff7300' },
    { name: 'Chevrolet', value: 8, color: '#00ff00' }
  ], []);

  const dadosTipoServico = useMemo(() => [
    { name: 'Colisão', value: 45, color: '#8884d8' },
    { name: 'Roubo', value: 25, color: '#82ca9d' },
    { name: 'Incêndio', value: 15, color: '#ffc658' },
    { name: 'Furto', value: 10, color: '#ff7300' },
    { name: 'Enchente', value: 5, color: '#00ff00' }
  ], []);

  const dadosSituacao = useMemo(() => [
    { name: 'Em análise', value: 8, color: '#8884d8' },
    { name: 'Em reparo', value: 12, color: '#82ca9d' },
    { name: 'Aguardando peças', value: 5, color: '#ffc658' },
    { name: 'Finalizado', value: 15, color: '#ff7300' },
    { name: 'Aguardando liberação', value: 3, color: '#00ff00' }
  ], []);

  const dadosEvolucaoEntradas = useMemo(() => [
    { mes: 'Jan', entradas: 15 },
    { mes: 'Fev', entradas: 18 },
    { mes: 'Mar', entradas: 22 },
    { mes: 'Abr', entradas: 19 },
    { mes: 'Mai', entradas: 25 },
    { mes: 'Jun', entradas: 28 }
  ], []);

  const dadosEvolucaoHonorarios = useMemo(() => [
    { mes: 'Jan', honorarios: 45000 },
    { mes: 'Fev', honorarios: 52000 },
    { mes: 'Mar', honorarios: 48000 },
    { mes: 'Abr', honorarios: 55000 },
    { mes: 'Mai', honorarios: 62000 },
    { mes: 'Jun', honorarios: 58000 }
  ], []);

  const dadosEvolucaoDespesas = useMemo(() => [
    { mes: 'Jan', despesas: 12000 },
    { mes: 'Fev', despesas: 15000 },
    { mes: 'Mar', despesas: 18000 },
    { mes: 'Abr', despesas: 14000 },
    { mes: 'Mai', despesas: 20000 },
    { mes: 'Jun', despesas: 22000 }
  ], []);

  // Dados dos cards de estatísticas
  const dashboardStats = useMemo(() => ({
    totalVeiculos: 156,
    emAnalise: 23,
    finalizados: 89,
    pendentes: 44,
    honorariosMes: 99999,
    despesasMes: 44444,
    lucroMes: 99999
  }), []);


  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard - Sistema BRS
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Indicadores e análises do sistema.
      </Typography>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-card" sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <DirectionsCarIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {dashboardStats.totalVeiculos}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total de Veículos
                  </Typography>
                </Box>
              </Box>
              <Chip 
                icon={<TrendingUpIcon />} 
                label="+12% este mês" 
                color="success" 
                size="small" 
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-card" sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <ScheduleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {dashboardStats.emAnalise}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Em Análise
                  </Typography>
                </Box>
              </Box>
              <Chip 
                icon={<TrendingDownIcon />} 
                label="-5% esta semana" 
                color="error" 
                size="small" 
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-card" sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <AssessmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {dashboardStats.finalizados}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Finalizados
                  </Typography>
                </Box>
              </Box>
              <Chip 
                icon={<TrendingUpIcon />} 
                label="+8% este mês" 
                color="success" 
                size="small" 
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-card" sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <AttachMoneyIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    R$ {dashboardStats.lucroMes.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lucro do Mês
                  </Typography>
                </Box>
              </Box>
              <Chip 
                icon={<TrendingUpIcon />} 
                label="+15% este mês" 
                color="success" 
                size="small" 
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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

