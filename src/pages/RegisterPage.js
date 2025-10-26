import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Avatar,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PhotoCamera,
  PersonAdd
} from '@mui/icons-material';
import useAuthStore from '../store/authStore';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loading, error } = useAuthStore();
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    senha_confirmation: ''
  });
  
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePhoto(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 8) {
      newErrors.senha = 'Senha deve ter pelo menos 8 caracteres';
    }

    if (!formData.senha_confirmation) {
      newErrors.senha_confirmation = 'Confirmação de senha é obrigatória';
    } else if (formData.senha !== formData.senha_confirmation) {
      newErrors.senha_confirmation = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const userData = {
        ...formData,
        profile_photo: profilePhoto
      };

      const result = await register(userData);
      
      if (result.success) {
        navigate('/login', { 
          state: { 
            message: 'Conta criada com sucesso! Faça login para continuar.' 
          }
        });
      }
    } catch (error) {
      console.error('Erro no registro:', error);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <PersonAdd />
          </Avatar>
          
          <Typography component="h1" variant="h5" gutterBottom>
            Criar Conta
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            {/* Foto de Perfil */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{ width: 80, height: 80, mb: 2 }}
                src={profilePhoto ? URL.createObjectURL(profilePhoto) : null}
              >
                <PhotoCamera />
              </Avatar>
              
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="profile-photo-input"
                type="file"
                onChange={handlePhotoChange}
              />
              <label htmlFor="profile-photo-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoCamera />}
                  size="small"
                >
                  {profilePhoto ? 'Alterar Foto' : 'Adicionar Foto'}
                </Button>
              </label>
            </Box>

            <TextField
              margin="normal"
              required
              fullWidth
              id="nome"
              label="Nome Completo"
              name="nome"
              autoComplete="name"
              autoFocus
              value={formData.nome}
              onChange={handleInputChange('nome')}
              error={!!errors.nome}
              helperText={errors.nome}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={!!errors.email}
              helperText={errors.email}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="senha"
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              id="senha"
              autoComplete="new-password"
              value={formData.senha}
              onChange={handleInputChange('senha')}
              error={!!errors.senha}
              helperText={errors.senha}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="senha_confirmation"
              label="Confirmar Senha"
              type={showConfirmPassword ? 'text' : 'password'}
              id="senha_confirmation"
              value={formData.senha_confirmation}
              onChange={handleInputChange('senha_confirmation')}
              error={!!errors.senha_confirmation}
              helperText={errors.senha_confirmation}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                'Criar Conta'
              )}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2">
                Já tem uma conta?{' '}
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  Faça login aqui
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;











