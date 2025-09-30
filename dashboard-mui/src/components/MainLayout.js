// src/components/MainLayout.js

import React, { useState } from 'react';
// AQUI ESTÁ A CORREÇÃO: Adicionei 'Divider' de volta à lista de imports
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, AppBar, IconButton, Typography, Menu, MenuItem, Divider } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import MenuIcon from '@mui/icons-material/Menu';
import BarChartIcon from '@mui/icons-material/BarChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Logo from './assets/logosemnome.png';

const drawerWidthOpen = 240;
const drawerWidthClosed = 60;

const activeLinkStyle = {
  backgroundColor: 'rgba(0, 0, 0, 0.08)',
  color: 'primary.main',
  fontWeight: 'bold',
};

function MainLayout({ children }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => { setOpen(!open); };
  const handleMenu = (event) => { setAnchorEl(event.currentTarget); };
  const handleClose = () => { setAnchorEl(null); };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const menuItems = [
    { text: 'Home', path: '/', icon: <HomeIcon /> },
    { text: 'Análise de Sellout', path: '/sellout', icon: <BarChartIcon /> },
    { text: 'Análise Dinâmica', path: '/analise', icon: <TableChartIcon /> },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: "linear-gradient(90deg, rgba(106, 17, 203, 0.65)0%,rgba(37, 117, 252, 0.65)   100%)"
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Box
              component="img"
              src={Logo}
              alt="Logo Maridata"
              sx={{ height: 55 }}
          />
          <Box sx={{ flexGrow: 1 }} />
          {user && (
            <div>
              <IconButton size="large" onClick={handleMenu} color="inherit">
                <AccountCircleIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem disabled>
                  <Typography variant="body1" fontWeight="bold">
                    {user.username.toUpperCase()}
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>Sair</MenuItem>
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>

      {/* O resto do código do Drawer e do conteúdo principal está correto */}
      <Drawer
        variant="permanent"
        sx={{
          width: open ? drawerWidthOpen : drawerWidthClosed,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          transition: (theme) => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          '& .MuiDrawer-paper': {
            width: open ? drawerWidthOpen : drawerWidthClosed,
            overflowX: 'hidden',
            transition: (theme) => theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        <Toolbar />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                component={NavLink}
                to={item.path}
                style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
                sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5, }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

export default MainLayout;