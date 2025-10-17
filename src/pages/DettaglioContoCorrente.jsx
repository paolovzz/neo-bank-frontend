import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { useFetchWithAuth } from '../helper/api';

function DettaglioContocorrentePage() {
  const location = useLocation();
  const { iban } = location.state || {};

  const [conto, setConto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWithAuth = useFetchWithAuth();

  const fetchConto = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/cc/${iban}`);
      if (!response) return;
      if (!response.ok) throw new Error(`Errore nella chiamata: ${response.status}`);
      const data = await response.json();
      setConto(data);
    } catch (err) {
      console.error(err);
      setError('Errore durante il recupero dei dati del conto.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (iban) {
      fetchConto();
    } else {
      setError('IBAN non specificato.');
      setLoading(false);
    }
  }, [fetchWithAuth, iban]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!conto) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="info">Nessun dato del conto disponibile.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant="h5" gutterBottom>
        Dettaglio Conto
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">
            IBAN
          </Typography>
          <Typography variant="body1">{conto.iban || 'N/D'}</Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Saldo Disponibile
          </Typography>
          <Typography variant="body1">
            € {conto.saldoDisponibile != null ? conto.saldoDisponibile.toFixed(2) : 'N/D'}
          </Typography>
        </Box>

        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Saldo Contabile
          </Typography>
          <Typography variant="body1">
            € {conto.saldoContabile != null ? conto.saldoContabile.toFixed(2) : 'N/D'}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default DettaglioContocorrentePage;
