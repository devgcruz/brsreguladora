import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import { Save as SaveIcon, Add as AddIcon } from '@mui/icons-material';
import OptimizedSelect from '../components/OptimizedSelect';

const PrestadoresPage = () => {
  const [empresaData, setEmpresaData] = useState({
    nome: '',
    status: ''
  });

  const [loginData, setLoginData] = useState({
    prestador: '',
    nome: '',
    login: '',
    senha: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const statusOptions = ['Ativo', 'Inativo', 'Suspenso'];
  const prestadoresOptions = [
    'Auto Reparo Ltda',
    'Mecânica Central',
    'Oficina Premium',
    'Garagem Express',
    'Auto Service'
  ];

  const handleEmpresaChange = (field) => (event) => {
    setEmpresaData({
      ...empresaData,
      [field]: event.target.value
    });
  };

  const handleLoginChange = (field) => (event) => {
    setLoginData({
      ...loginData,
      [field]: event.target.value
    });
  };

  const handleSaveEmpresa = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Simula salvamento da empresa
      setTimeout(() => {
        setLoading(false);
        setSuccess('Empresa cadastrada com sucesso!');
        setEmpresaData({ nome: '', status: '' });
      }, 1000);
    } catch (err) {
      setError('Erro ao salvar empresa');
      setLoading(false);
    }
  };

  const handleSaveLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Simula salvamento do login
      setTimeout(() => {
        setLoading(false);
        setSuccess('Login cadastrado com sucesso!');
        setLoginData({ prestador: '', nome: '', login: '', senha: '' });
      }, 1000);
    } catch (err) {
      setError('Erro ao salvar login');
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Cadastro de Prestadores
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Card 1 - Cadastro de Empresa */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cadastro de Empresa
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nome da Empresa"
                    value={empresaData.nome}
                    onChange={handleEmpresaChange('nome')}
                  />
                </Grid>

                <Grid item xs={12}>
                  <OptimizedSelect
                    label="Status"
                    value={empresaData.status}
                    onChange={handleEmpresaChange('status')}
                    options={statusOptions.map(status => ({ value: status, label: status }))}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                    onClick={handleSaveEmpresa}
                    disabled={loading || !empresaData.nome || !empresaData.status}
                  >
                    {loading ? 'Salvando...' : 'Cadastrar Empresa'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 2 - Cadastro de Login */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cadastro de Login
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <OptimizedSelect
                    label="Prestador"
                    value={loginData.prestador}
                    onChange={handleLoginChange('prestador')}
                    options={prestadoresOptions.map(prestador => ({ value: prestador, label: prestador }))}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nome do Usuário"
                    value={loginData.nome}
                    onChange={handleLoginChange('nome')}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Login"
                    value={loginData.login}
                    onChange={handleLoginChange('login')}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Senha"
                    type="password"
                    value={loginData.senha}
                    onChange={handleLoginChange('senha')}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                    onClick={handleSaveLogin}
                    disabled={loading || !loginData.prestador || !loginData.nome || !loginData.login || !loginData.senha}
                  >
                    {loading ? 'Salvando...' : 'Cadastrar Login'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Lista de Prestadores Cadastrados */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Prestadores Cadastrados
        </Typography>

        <Grid container spacing={2}>
          {prestadoresOptions.map((prestador, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {prestador}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Status: Ativo
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Usuários: {Math.floor(Math.random() * 5) + 1}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default PrestadoresPage;


