// App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import DettaglioCliente from './pages/DettaglioCliente';
import DettaglioContoCorrente from './pages/DettaglioContoCorrente';
import ProtectedRoute from './components/ProtectedRoute';
import SignPage from './pages/SignPage';
import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useMemo, useState, useEffect } from 'react';
import DettaglioCarta from './pages/DettaglioCarta';

function App() {
  // Recupera il tema salvato al primo render
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // Aggiorna localStorage quando cambia il tema
  useEffect(() => {
    localStorage.setItem('theme', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign" element={<SignPage />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage toggleTheme={toggleTheme} mode={mode} />
            </ProtectedRoute>
          }
        >
          <Route path="profilo" element={<DettaglioCliente />} />
          <Route path="conto-corrente" element={<DettaglioContoCorrente />} />
          <Route path="dettaglio-carta/:numeroCarta" element={<DettaglioCarta />} />

        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
