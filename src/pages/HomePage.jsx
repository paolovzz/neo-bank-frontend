import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  CssBaseline,
  Box,
  Button,
  useMediaQuery,
  Switch,
  FormControlLabel,
  Badge
} from '@mui/material';

import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';

import { useFetchWithAuth } from './../helper/api';

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function HomePage({ toggleTheme, mode }) {
  const fetchWithAuth = useFetchWithAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));

  const [username, setUsername] = useState('');
  const [ibanMenuItems, setIbanMenuItems] = useState([]);
  const [selectedIban, setSelectedIban] = useState(localStorage.getItem('selectedIban') || null);

  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
  const [ibanMenuAnchorEl, setIbanMenuAnchorEl] = useState(null);

  const userMenuOpen = Boolean(userMenuAnchorEl);
  const ibanMenuOpen = Boolean(ibanMenuAnchorEl);

  // 🔔 Stato per contatore notifiche
  const [unreadCount, setUnreadCount] = useState(0);

  // Recupero username dal token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = parseJwt(token);
      setUsername(decoded?.preferred_username || 'Utente');
    } else {
      setUsername('Utente');
    }
  }, []);

  // Fetch IBAN e notifiche
  useEffect(() => {
    const fetchIbans = async () => {
      try {
        const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/clienti/iban`);
        if (!response) return;
        if (!response.ok) throw new Error('Errore nel recupero degli IBAN');
        const data = await response.json();
        setIbanMenuItems(data);

        // 🔹 Se non c'è un IBAN salvato, selezioniamo il primo
        if (data.length > 0 && !localStorage.getItem('selectedIban')) {
          localStorage.setItem('selectedIban', data[0]);
          setSelectedIban(data[0]);
          navigate('conto-corrente', { state: { iban: data[0] } });
        }
      } catch (error) {
        console.error('Errore nel recupero degli IBAN:', error);
        setIbanMenuItems([]);
      }
    };
    fetchIbans();

    // Simulazione fetch notifiche
    const fetchNotifiche = async () => {
      try {
        setUnreadCount(3);
      } catch (err) {
        console.error('Errore nel recupero notifiche:', err);
      }
    };
    fetchNotifiche();
  }, [fetchWithAuth, navigate]);

  // Gestione selezione/deselezione IBAN in base alla pagina
  useEffect(() => {
    const ibanSalvato = localStorage.getItem('selectedIban');

    if (location.pathname.includes('conto-corrente')) {
      setSelectedIban(ibanSalvato);
    } else {
      setSelectedIban(null);
    }
  }, [location.pathname]);

  // Menu user
  const handleUserMenuOpen = (event) => setUserMenuAnchorEl(event.currentTarget);
  const handleUserMenuClose = () => setUserMenuAnchorEl(null);

  // Menu IBAN
  const handleIbanMenuOpen = (event) => setIbanMenuAnchorEl(event.currentTarget);
  const handleIbanMenuClose = () => setIbanMenuAnchorEl(null);

  const handleProfile = () => {
    handleUserMenuClose();
    navigate('profilo', { state: { utente: username } });
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response && !response.ok) console.warn('Logout fallita sul server:', response.status);
    } catch (error) {
      console.error('Errore di rete durante il logout:', error);
    } finally {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const handleSelectIban = (iban) => {
    localStorage.setItem('selectedIban', iban);
    setSelectedIban(iban);
    handleIbanMenuClose();
    navigate('conto-corrente', { state: { iban } });
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      <CssBaseline />

      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          {/* Icona menu per mobile */}
          <IconButton color="inherit" aria-label="menu" edge="start" sx={{ mr: 2, display: { sm: 'none' } }}>
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Box
            component="img"
            sx={{ width: '90px', cursor: 'pointer' }}
            alt="Logo"
            src="/src/assets/logo.png"
            onClick={() => navigate('/home')}
          />

          {/* Nome NEO BANK */}
          <Typography variant="h6" noWrap sx={{ ml: 2 }}>NEO BANK</Typography>

          {/* Menu IBAN */}
          <Button color="inherit" onClick={handleIbanMenuOpen} sx={{ ml: 3, textTransform: 'none' }}>
            {selectedIban || 'Seleziona conto'}
          </Button>

          <Menu anchorEl={ibanMenuAnchorEl} open={ibanMenuOpen} onClose={handleIbanMenuClose}>
            {ibanMenuItems.length > 0 ? (
              ibanMenuItems.map((iban, idx) => (
                <MenuItem key={idx} onClick={() => handleSelectIban(iban)}>
                  {iban}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>Nessun conto disponibile</MenuItem>
            )}
          </Menu>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Tema switch */}
          <FormControlLabel
            control={<Switch checked={mode === 'dark'} onChange={toggleTheme} color="default" />}
            label={mode === 'dark' ? 'Dark' : 'Light'}
            sx={{ mr: 2 }}
          />

          {/* Username */}
          <Typography variant="body2" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
            {username}
          </Typography>

          {/* Icona utente */}
          <IconButton size="large" onClick={handleUserMenuOpen} color="inherit">
            <AccountCircle />
          </IconButton>

          <Menu anchorEl={userMenuAnchorEl} open={userMenuOpen} onClose={handleUserMenuClose}>
            <MenuItem onClick={handleProfile}>Visualizza profilo</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Contenuto principale */}
      <Box component="main" sx={{ flexGrow: 1, mt: '64px', overflowY: 'auto', p: 2 }}>
        <Outlet />
      </Box>
    </Box>
  );
}

export default HomePage;
