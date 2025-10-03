import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  AttachMoney as FinanceiroIcon,
  Gavel as JudicialIcon,
  Business as PrestadoresIcon,
  Assessment as RelatoriosIcon,
  People as UsuariosIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import useAuthStore from '../store/authStore';

const drawerWidth = 240;

const menuItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
    permission: 'dashboard'
  },
  {
    text: 'Registros de Entrada',
    icon: <AssignmentIcon />,
    path: '/dashboard/registrodeentrada',
    permission: 'registros'
  },
  {
    text: 'Financeiro',
    icon: <FinanceiroIcon />,
    path: '/dashboard/financeiro',
    permission: 'financeiro'
  },
  {
    text: 'Judicial',
    icon: <JudicialIcon />,
    path: '/dashboard/judicial',
    permission: 'judicial'
  },
  {
    text: 'Prestadores',
    icon: <PrestadoresIcon />,
    path: '/dashboard/prestadores',
    permission: 'prestadores'
  },
  {
    text: 'Relatórios',
    icon: <RelatoriosIcon />,
    path: '/dashboard/relatorios',
    permission: 'relatorios'
  },
  {
    text: 'Usuários',
    icon: <UsuariosIcon />,
    path: '/dashboard/usuarios',
    permission: 'usuarios'
  },
];

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleNavigation = (path) => {
    navigate(path);
    // Sempre fechar a sidebar após navegação
    if (onClose) {
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Drawer
      variant="temporary"
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
        hideBackdrop: true,
        disableEnforceFocus: true,
        disableAutoFocus: true,
        disableRestoreFocus: true,
      }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        zIndex: 1200,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          position: 'fixed',
          top: '64px',
          left: 0,
          height: 'calc(100vh - 64px)',
          zIndex: 1200,
          border: 'none',
          transition: 'transform 0.3s ease-in-out',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          filter: 'none',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" color="primary" fontWeight="bold">
          Sistema BRS
        </Typography>
        {user && (
          <Typography variant="body2" color="text.secondary">
            Bem-vindo, {user.name}
          </Typography>
        )}
      </Box>
      
      <Divider />
      
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'transparent',
                  color: 'black',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'black',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Sair" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;

