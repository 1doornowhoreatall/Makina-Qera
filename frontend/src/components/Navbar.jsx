import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Avatar, Menu, MenuItem,
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Badge, Divider, Chip, useMediaQuery, useTheme
} from '@mui/material';
import {
  Menu as MenuIcon, DirectionsCar, Security, People, Receipt,
  Dashboard, Home, Person, History, Notifications, Logout,
  Assessment, Close, CarRental
} from '@mui/icons-material';
import NotificationBell from './NotificationBell';

const DRAWER_WIDTH = 260;

const Navbar = () => {
  const { perdoruesi, eshteAdmin, eshteHyrur, dalje } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleProfileMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);

  const handleDalje = () => {
    handleProfileMenuClose();
    dalje();
    navigate('/');
  };

  const adminMenuItems = [
    { text: 'Paneli', icon: <Dashboard />, path: '/admin' },
    { text: 'Automjete', icon: <DirectionsCar />, path: '/admin/automjete' },
    { text: 'Sigurime', icon: <Security />, path: '/admin/sigurime' },
    { text: 'Klientë', icon: <People />, path: '/admin/kliente' },
    { text: 'Qiradhënie', icon: <Receipt />, path: '/admin/qiradhenie' },
    { text: 'Raporte', icon: <Assessment />, path: '/admin/raporte' },
  ];

  const klientMenuItems = [
    { text: 'Kryefaqja', icon: <Home />, path: '/' },
    { text: 'Automjetet', icon: <DirectionsCar />, path: '/automjete' },
    { text: 'Qirat e mia', icon: <History />, path: '/qirat-e-mia' },
    { text: 'Profili', icon: <Person />, path: '/profili' },
  ];

  const menuItems = eshteAdmin ? adminMenuItems : klientMenuItems;

  const drawer = (
    <Box sx={{ width: DRAWER_WIDTH, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CarRental sx={{ fontSize: 32, color: '#6C63FF' }} />
          <Typography variant="h6" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #6C63FF, #00D9FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Makina Qera
          </Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={() => setDrawerOpen(false)} size="small">
            <Close />
          </IconButton>
        )}
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
      
      {eshteHyrur && (
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 38, height: 38, background: 'linear-gradient(135deg, #6C63FF, #00D9FF)', fontSize: '0.9rem', fontWeight: 700 }}>
            {perdoruesi?.emri?.[0]}{perdoruesi?.mbiemri?.[0]}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {perdoruesi?.emri} {perdoruesi?.mbiemri}
            </Typography>
            <Chip label={eshteAdmin ? 'Admin' : 'Klient'} size="small" sx={{ height: 20, fontSize: '0.65rem', mt: 0.3, background: eshteAdmin ? 'rgba(108,99,255,0.2)' : 'rgba(0,217,255,0.2)', color: eshteAdmin ? '#6C63FF' : '#00D9FF' }} />
          </Box>
        </Box>
      )}
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      <List sx={{ flex: 1, px: 1.5, py: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.3 }}>
              <ListItemButton
                onClick={() => { navigate(item.path); setDrawerOpen(false); }}
                sx={{
                  borderRadius: 2,
                  py: 1.2,
                  px: 2,
                  ...(isActive && {
                    background: 'rgba(108, 99, 255, 0.12)',
                    '& .MuiListItemIcon-root': { color: '#6C63FF' },
                    '& .MuiListItemText-primary': { color: '#6C63FF', fontWeight: 700 },
                  }),
                  '&:hover': { background: 'rgba(108, 99, 255, 0.08)' }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: '#9CA3AF' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isActive ? 700 : 500 }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
      <Box sx={{ p: 1.5 }}>
        <ListItemButton onClick={handleDalje} sx={{ borderRadius: 2, py: 1, color: '#EF4444', '&:hover': { background: 'rgba(239,68,68,0.1)' } }}>
          <ListItemIcon sx={{ minWidth: 40, color: '#EF4444' }}><Logout /></ListItemIcon>
          <ListItemText primary="Dilni" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {eshteHyrur && isMobile && (
            <IconButton edge="start" onClick={() => setDrawerOpen(true)} sx={{ mr: 1, color: '#F3F4F6' }}>
              <MenuIcon />
            </IconButton>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <CarRental sx={{ fontSize: 28, color: '#6C63FF' }} />
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '1rem', md: '1.15rem' }, background: 'linear-gradient(135deg, #6C63FF, #00D9FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Makina Qera
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {eshteHyrur ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationBell />
              <IconButton onClick={handleProfileMenuOpen} size="small">
                <Avatar sx={{ width: 34, height: 34, background: 'linear-gradient(135deg, #6C63FF, #00D9FF)', fontSize: '0.85rem', fontWeight: 700 }}>
                  {perdoruesi?.emri?.[0]}{perdoruesi?.mbiemri?.[0]}
                </Avatar>
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleProfileMenuClose}
                PaperProps={{ sx: { mt: 1, minWidth: 180, background: 'rgba(17,24,39,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' } }}>
                <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/profili'); }}>
                  <Person sx={{ mr: 1.5, fontSize: 20 }} /> Profili
                </MenuItem>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
                <MenuItem onClick={handleDalje} sx={{ color: '#EF4444' }}>
                  <Logout sx={{ mr: 1.5, fontSize: 20 }} /> Dilni
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" size="small" onClick={() => navigate('/hyrje')} sx={{ borderColor: 'rgba(108,99,255,0.5)', color: '#6C63FF', '&:hover': { borderColor: '#6C63FF', background: 'rgba(108,99,255,0.08)' } }}>
                Hyrje
              </Button>
              <Button variant="contained" size="small" onClick={() => navigate('/regjistrim')}>
                Regjistrim
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {eshteHyrur && (
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? drawerOpen : true}
          onClose={() => setDrawerOpen(false)}
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', mt: '64px', height: 'calc(100% - 64px)' },
          }}
        >
          {drawer}
        </Drawer>
      )}
    </>
  );
};

export default Navbar;
