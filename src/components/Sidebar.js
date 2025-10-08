import React, { useState } from 'react';
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
  Divider,
  Collapse
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  AttachMoney as FinanceiroIcon,
  Gavel as JudicialIcon,
  Business as PrestadoresIcon,
  Assessment as RelatoriosIcon,
  People as UsuariosIcon,
  PersonAdd as ColaboradorIcon,
  Work as WorkIcon,
  DirectionsCar as CarIcon,
  Security as SecurityIcon,
  Logout as LogoutIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import useAuthStore from '../store/authStore';

const drawerWidth = 240;

// Itens principais do menu
const mainMenuItems = [
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
  }
];

// Sub-itens da seção "Gerenciar"
const gerenciarSubItems = [
  {
    text: 'Colaboradores',
    icon: <ColaboradorIcon />,
    path: '/colaboradores',
    permission: 'colaboradores'
  },
  {
    text: 'Posições',
    icon: <WorkIcon />,
    path: '/posicoes',
    permission: 'posicoes'
  },
  {
    text: 'Marcas',
    icon: <CarIcon />,
    path: '/marcas',
    permission: 'marcas'
  },
  {
    text: 'Seguradoras',
    icon: <SecurityIcon />,
    path: '/seguradoras',
    permission: 'seguradoras'
  }
];

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [gerenciarExpanded, setGerenciarExpanded] = useState(false);

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

  const handleGerenciarToggle = () => {
    setGerenciarExpanded(!gerenciarExpanded);
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Se for administrador, dar acesso total
    if (user.nivel >= 3) {
      return true;
    }
    
    // Verificar permissões específicas
    return user.permissoes && user.permissoes.includes(permission);
  };

  const isGerenciarPath = (path) => {
    return gerenciarSubItems.some(item => item.path === path);
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
        {/* Itens principais do menu */}
        {mainMenuItems.map((item) => (
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

        {/* Seção Gerenciar */}
        <ListItem disablePadding>
          <ListItemButton onClick={handleGerenciarToggle}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Gerenciar" />
            {gerenciarExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItemButton>
        </ListItem>
        
        <Collapse in={gerenciarExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {gerenciarSubItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    pl: 4, // Indentação para sub-itens
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
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>
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

