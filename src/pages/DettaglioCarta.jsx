import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Link,
  Modal,
  TextField,
  Stack,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { useFetchWithAuth } from '../helper/api';

const styleModal = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 1,
  boxShadow: 24,
  p: 4,
};

function DettaglioCarta() {
  const { numeroCarta } = useParams();
  const fetchWithAuth = useFetchWithAuth();

  const [carta, setCarta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [fieldToEdit, setFieldToEdit] = useState('');
  const [fieldValue, setFieldValue] = useState('');

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // ✅ Conversione abilitazionePagamentiOnline da stringa → boolean
  const normalizeCarta = data => ({
    ...data,
    abilitazionePagamentiOnline: data.abilitazionePagamentiOnline === 'ATTIVATA',
  });

  const fetchCarta = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/carte/${numeroCarta}`);
      if (!response.ok) throw new Error('Errore durante il recupero della carta');
      const data = await response.json();
      setCarta(normalizeCarta(data));
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (numeroCarta) fetchCarta();
  }, [numeroCarta]);

  const handleOpenModal = (fieldName, currentValue) => {
    setFieldToEdit(fieldName);
    setFieldValue(currentValue ?? '');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setFieldToEdit('');
    setFieldValue('');
  };

  const handleSave = async () => {
    if (!fieldToEdit) return handleCloseModal();

    try {
      const isGiornaliero = fieldToEdit === 'limiteGiornaliero';
      const endpoint = isGiornaliero
        ? `${import.meta.env.VITE_API_BASE_URL}/carte/soglia-pagamenti-giornaliera`
        : `${import.meta.env.VITE_API_BASE_URL}/carte/soglia-pagamenti-mensile`;

      const body = { numeroCarta, iban: carta.iban, nuovaSoglia: parseInt(fieldValue, 10) };

      const response = await fetchWithAuth(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Errore aggiornamento limite');

      setCarta(prev => ({
        ...prev,
        [isGiornaliero ? 'sogliaPagamentiGiornaliera' : 'sogliaPagamentiMensile']: body.nuovaSoglia,
      }));

      setSnackbar({ open: true, message: 'Limite aggiornato con successo.', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: err, severity: 'error' });
    } finally {
      handleCloseModal();
    }
  };

  const handleToggleStatoCarta = async () => {
    const nuovoStato = carta.statoCarta === 'ATTIVA' ? 'BLOCCATA' : 'ATTIVA';
    const previous = carta.statoCarta;
    setCarta(prev => ({ ...prev, statoCarta: nuovoStato }));

    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/carte/stato-carta`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numeroCarta, iban: carta.iban, statoCarta: nuovoStato === 'ATTIVA' }),
      });

      if (!response.ok) throw new Error('Errore aggiornamento stato');
      setSnackbar({
        open: true,
        message: `Carta ${nuovoStato === 'ATTIVA' ? 'attivata' : 'bloccata'} con successo.`,
        severity: 'success',
      });
    } catch (err) {
      console.error(err);
      setCarta(prev => ({ ...prev, statoCarta: previous }));
      setSnackbar({ open: true, message: err, severity: 'error' });
    }
  };

  // ✅ Pagamenti online → invio booleano (true/false)
  const handleToggleAcquistiOnline = async () => {
    const nuovoValore = !carta.abilitazionePagamentiOnline;
    const previous = carta.abilitazionePagamentiOnline;
    setCarta(prev => ({ ...prev, abilitazionePagamentiOnline: nuovoValore }));

    try {
      const response = await fetchWithAuth(
        `${import.meta.env.VITE_API_BASE_URL}/carte/abilitazione-pagamenti-online`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            numeroCarta,
            iban: carta.iban,
            abilitazionePagamentiOnline: nuovoValore, // <-- ✅ booleano, non stringa
          }),
        }
      );

      if (!response.ok) throw new Error('Errore aggiornamento acquisti online');
      setSnackbar({
        open: true,
        message: `Pagamenti online ${nuovoValore ? 'abilitati' : 'disabilitati'} con successo.`,
        severity: 'success',
      });
    } catch (err) {
      console.error(err);
      setCarta(prev => ({ ...prev, abilitazionePagamentiOnline: previous }));
      setSnackbar({ open: true, message: err, severity: 'error' });
    }
  };

  const formatExpiry = dateString => {
    if (!dateString) return 'N/D';
    const data = new Date(dateString);
    if (isNaN(data)) return 'N/D';
    const mese = String(data.getMonth() + 1).padStart(2, '0');
    const anno = String(data.getFullYear()).slice(-2);
    return `${mese}/${anno}`;
  };

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );

  if (!carta)
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="info">Nessun dettaglio disponibile per questa carta.</Alert>
      </Box>
    );

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant="h4" gutterBottom>
        Dettaglio Carta
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Informazioni generali
        </Typography>

        <Typography>
          <strong>Numero carta:</strong> {carta.numeroCarta}
        </Typography>

        <Typography>
          <strong>Intestatario:</strong> {carta.intestatario}
        </Typography>

        <Typography sx={{ mt: 2 }}>
          <strong>Emissione:</strong>{' '}
          {carta.dataEmissione ? new Date(carta.dataEmissione).toLocaleDateString() : 'N/D'}
        </Typography>
        <Typography>
          <strong>Scadenza:</strong> {formatExpiry(carta.dataScadenza)}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <Typography sx={{ mr: 1 }}>
            <strong>Stato:</strong> {carta.statoCarta}
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={carta.statoCarta === 'ATTIVA'}
                onChange={handleToggleStatoCarta}
                color="primary"
              />
            }
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Typography sx={{ mr: 1 }}>
            <strong>Pagamenti online:</strong>
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={!!carta.abilitazionePagamentiOnline}
                onChange={handleToggleAcquistiOnline}
                color="primary"
              />
            }
          />
        </Box>
      </Paper>

      <Typography variant="h5" gutterBottom>
        Limiti Pagamenti
      </Typography>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography>Limite giornaliero: {carta.sogliaPagamentiGiornaliera}€</Typography>
          <Link
            component="button"
            variant="body2"
            onClick={() => handleOpenModal('limiteGiornaliero', carta.sogliaPagamentiGiornaliera)}
          >
            Modifica
          </Link>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography>Limite mensile: {carta.sogliaPagamentiMensile}€</Typography>
          <Link
            component="button"
            variant="body2"
            onClick={() => handleOpenModal('limiteMensile', carta.sogliaPagamentiMensile)}
          >
            Modifica
          </Link>
        </Box>
      </Paper>

      {/* Modal */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={styleModal}>
          <Typography variant="h6" gutterBottom>
            Modifica {fieldToEdit === 'limiteGiornaliero' ? 'limite giornaliero' : 'limite mensile'}
          </Typography>
          <TextField
            fullWidth
            label="Nuovo limite (€)"
            type="number"
            value={fieldValue}
            onChange={e => setFieldValue(e.target.value)}
          />
          <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'flex-end' }}>
            <Button onClick={handleCloseModal}>Annulla</Button>
            <Button variant="contained" onClick={handleSave}>
              Salva
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}

export default DettaglioCarta;
