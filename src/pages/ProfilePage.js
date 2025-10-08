import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  InputAdornment,
  Divider,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PhotoCamera,
  Save,
  Lock
} from '@mui/icons-material';
import useAuthStore from '../store/authStore';
import authService from '../services/authService';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser, loading } = useAuthStore();
  
  const [profileData, setProfileData] = useState({
    nome: '',
    email: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        nome: user.nome || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleProfileChange = (field) => (event) => {
    setProfileData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePasswordChange = (field) => (event) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    
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

  const validateProfile = () => {
    const newErrors = {};

    if (!profileData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!profileData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.current_password) {
      newErrors.current_password = 'Senha atual é obrigatória';
    }

    if (!passwordData.new_password) {
      newErrors.new_password = 'Nova senha é obrigatória';
    } else if (passwordData.new_password.length < 8) {
      newErrors.new_password = 'Nova senha deve ter pelo menos 8 caracteres';
    }

    if (!passwordData.new_password_confirmation) {
      newErrors.new_password_confirmation = 'Confirmação de senha é obrigatória';
    } else if (passwordData.new_password !== passwordData.new_password_confirmation) {
      newErrors.new_password_confirmation = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateProfile()) {
      return;
    }

    setLoadingProfile(true);
    setSuccess('');

    try {
      const data = {
        ...profileData,
        profile_photo: profilePhoto
      };

      const result = await authService.updateProfile(data);
      
      if (result.success) {
        setSuccess('Perfil atualizado com sucesso!');
        updateUser(result.data);
        setProfilePhoto(null);
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    
    if (!validatePassword()) {
      return;
    }

    setLoadingPassword(true);
    setSuccess('');

    try {
      const result = await authService.changePassword(passwordData);
      
      if (result.success) {
        setSuccess('Senha alterada com sucesso!');
        setPasswordData({
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        });
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      setErrors({ password: error.message });
    } finally {
      setLoadingPassword(false);
    }
  };

  const getProfilePhotoUrl = () => {
    if (profilePhoto) {
      return URL.createObjectURL(profilePhoto);
    }
    if (user?.profile_photo_path) {
      return `http://localhost:8000/storage/${user.profile_photo_path}`;
    }
    return null;
  };

  const getInitials = () => {
    if (user?.nome) {
      return user.nome
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Meu Perfil
        </Typography>
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Informações do Perfil */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhotoCamera sx={{ mr: 1 }} />
                  Informações Pessoais
                </Typography>

                <Box component="form" onSubmit={handleProfileSubmit}>
                {/* Foto de Perfil */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    sx={{ width: 100, height: 100, mb: 2 }}
                    src={getProfilePhotoUrl()}
                  >
                    {getInitials()}
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
                  value={profileData.nome}
                  onChange={handleProfileChange('nome')}
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
                  value={profileData.email}
                  onChange={handleProfileChange('email')}
                  error={!!errors.email}
                  helperText={errors.email}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loadingProfile}
                  startIcon={loadingProfile ? <CircularProgress size={20} /> : <Save />}
                >
                  {loadingProfile ? 'Salvando...' : 'Salvar Perfil'}
                </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Alterar Senha */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Lock sx={{ mr: 1 }} />
                  Alterar Senha
                </Typography>

                <Box component="form" onSubmit={handlePasswordSubmit}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="current_password"
                    label="Senha Atual"
                    type={showCurrentPassword ? 'text' : 'password'}
                    id="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange('current_password')}
                    error={!!errors.current_password}
                    helperText={errors.current_password}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            edge="end"
                          >
                            {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="new_password"
                    label="Nova Senha"
                    type={showNewPassword ? 'text' : 'password'}
                    id="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange('new_password')}
                    error={!!errors.new_password}
                    helperText={errors.new_password}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            edge="end"
                          >
                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="new_password_confirmation"
                    label="Confirmar Nova Senha"
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="new_password_confirmation"
                    value={passwordData.new_password_confirmation}
                    onChange={handlePasswordChange('new_password_confirmation')}
                    error={!!errors.new_password_confirmation}
                    helperText={errors.new_password_confirmation}
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

                  {errors.password && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {errors.password}
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    disabled={loadingPassword}
                    startIcon={loadingPassword ? <CircularProgress size={20} /> : <Lock />}
                  >
                    {loadingPassword ? 'Alterando...' : 'Alterar Senha'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ProfilePage;
