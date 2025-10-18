import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Link,
  Modal,
  TextField,
  Button,
  Stack,
  Snackbar,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from '@mui/material';
import { useFetchWithAuth } from '../helper/api';
import MuiAlert from '@mui/material/Alert';

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

function DettaglioContocorrentePage() {
  const location = useLocation();
  const { iban } = location.state || {};

  const [conto, setConto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [fieldToEdit, setFieldToEdit] = useState('');
  const [fieldValue, setFieldValue] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fetchWithAuth = useFetchWithAuth();

  // Stato per il modal bonifico
  const [bonificoModalOpen, setBonificoModalOpen] = useState(false);
  const [ibanDestinatario, setIbanDestinatario] = useState('');
  const [importo, setImporto] = useState('');
  const [causale, setCausale] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const fetchConto = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/cc/${iban}`);
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
      setTransactions([
        {
          idOperazione: 'OP-001',
          dataOperazione: '2025-10-01',
          iban: 'IT12AAAA1234567890123456789',
          importo: 150.5,
          causale: 'Pagamento bolletta',
        },
        {
          idOperazione: 'OP-002',
          dataOperazione: '2025-10-05',
          iban: 'IT34BBBB2345678901234567890',
          importo: -78.9,
          causale: 'Bonifico amico',
        },
        {
          idOperazione: 'OP-003',
          dataOperazione: '2025-10-08',
          iban: 'IT56CCCC3456789012345678901',
          importo: 230.0,
          causale: 'Acquisto online',
        },
        {
          idOperazione: 'OP-004',
          dataOperazione: '2025-10-10',
          iban: 'IT78DDDD4567890123456789012',
          importo: -45.25,
          causale: 'Rimborso',
        },
        {
          idOperazione: 'OP-005',
          dataOperazione: '2025-10-12',
          iban: 'IT90EEEE5678901234567890123',
          importo: 500.0,
          causale: 'Stipendio',
        },
        {
          idOperazione: 'OP-006',
          dataOperazione: '2025-10-15',
          iban: 'IT11FFFF6789012345678901234',
          importo: -60.0,
          causale: 'Pagamento servizio',
        },
      ]);
    } else {
      setError('IBAN non specificato.');
      setLoading(false);
    }
  }, [iban]);

  const handleOpenModal = (fieldName, currentValue) => {
    setFieldToEdit(fieldName);
    setFieldValue(currentValue != null ? currentValue : '');
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
      let endpoint = '';
      let body = {};

      if (fieldToEdit === 'sogliaBonificiGiornaliera') {
        endpoint = `${import.meta.env.VITE_API_BASE_URL}/cc/soglia-bonifico-giornaliera`;
        body = { nuovaSoglia: parseInt(fieldValue, 10), iban: conto.iban};
      } else if (fieldToEdit === 'sogliaBonificiMensile') {
        endpoint = `${import.meta.env.VITE_API_BASE_URL}/cc/soglia-bonifico-mensile`;
        body = { nuovaSoglia: parseInt(fieldValue, 10), iban: conto.iban };
      }

      const response = await fetchWithAuth(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Errore aggiornamento soglia');

      setConto(prev => ({ ...prev, [fieldToEdit]: body.nuovaSoglia }));
      setSnackbar({ open: true, message: 'Soglia aggiornata con successo.', severity: 'success' });
    } catch (err) {
      console.error('Errore nella modifica:', err);
      setSnackbar({ open: true, message: 'Errore durante l’aggiornamento della soglia.', severity: 'error' });
    } finally {
      handleCloseModal();
    }
  };

  const handleOpenBonificoModal = () => {
    setIbanDestinatario('');
    setImporto('');
    setCausale('');
    setFormErrors({});
    setBonificoModalOpen(true);
  };

  const handleCloseBonificoModal = () => {
    setBonificoModalOpen(false);
  };

  const validateBonificoForm = () => {
    const errors = {};
    const ibanRegex = /^IT\d{2}[A-Z0-9]{1,30}$/;

    if (!ibanDestinatario || !ibanRegex.test(ibanDestinatario)) {
      errors.ibanDestinatario = 'IBAN non valido (deve iniziare con IT...)';
    } else if (ibanDestinatario === iban) {
      errors.ibanDestinatario = 'L\'IBAN del destinatario non può essere uguale a quello del mittente';
    }

    if (!importo || isNaN(importo) || Number(importo) <= 0) {
      errors.importo = 'Inserire un importo valido maggiore di 0';
    }

    if (Number(importo) > conto.saldoDisponibile) {
      errors.importo = "Inserire un importo minore rispetto al saldo disponibile ";
    }

    if (!causale || causale.length < 2) {
      errors.causale = 'Inserire una causale valida';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitBonifico = async () => {
    if (!validateBonificoForm()) return;

    const body = {
      ibanMittente: conto.iban, // l'iban del conto corrente visualizzato
      ibanDestinatario,
      importo: parseFloat(importo),
      causale,
    };

    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/cc/predisponi-bonifico`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Errore durante l’invio del bonifico');

      setSnackbar({
        open: true,
        message: 'Bonifico inviato con successo.',
        severity: 'success',
      });

      // Aggiorna transazioni localmente (opzionale)
      const nuovaTransazione = {
        idOperazione: `OP-${transactions.length + 1}`,
        dataOperazione: new Date().toISOString().split('T')[0],
        iban: ibanDestinatario,
        importo: -parseFloat(importo),
        causale,
      };

      setTransactions(prev => [nuovaTransazione, ...prev]);

      handleCloseBonificoModal();
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: 'Errore durante l’invio del bonifico.',
        severity: 'error',
      });
    }
  };


  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Box>;
  if (!conto) return <Box sx={{ mt: 4 }}><Alert severity="info">Nessun dato del conto disponibile.</Alert></Box>;

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Pulsante per Nuovo Bonifico */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" color="primary" onClick={handleOpenBonificoModal}>
          Nuovo Bonifico
        </Button>
      </Box>

      {/* Dettagli Tecnici */}
      <Typography variant="h5" gutterBottom>Dettagli Tecnici</Typography>
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">IBAN</Typography>
            <Typography>{conto.iban || 'N/D'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Numero Conto</Typography>
            <Typography>{conto.numeroConto}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">BIC</Typography>
            <Typography>{conto.bic}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">CAB</Typography>
            <Typography>{conto.cab}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">ABI</Typography>
            <Typography>{conto.abi}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Dati Conto e Soglie */}
      <Typography variant="h5" gutterBottom>Dati Conto & Soglie</Typography>
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">Saldo Disponibile</Typography>
              <Typography>€ {conto.saldoDisponibile?.toFixed(2) ?? 'N/D'}</Typography>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">Saldo Contabile</Typography>
              <Typography>€ {conto.saldoContabile?.toFixed(2) ?? 'N/D'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Box display="flex" alignItems="center">
                <Typography variant="subtitle2" color="text.secondary">Limite Bonifici Giornaliero</Typography>
                <Link component="button" variant="body2" onClick={() => handleOpenModal('sogliaBonificiGiornaliera', conto.sogliaBonificiGiornaliera)} sx={{ ml: 2 }}>Modifica</Link>
              </Box>
              <Typography>€ {conto.sogliaBonificiGiornaliera?.toFixed(2) ?? 'N/D'}</Typography>
            </Box>
            <Box>
              <Box display="flex" alignItems="center">
                <Typography variant="subtitle2" color="text.secondary">Limite Bonifici Mensile</Typography>
                <Link component="button" variant="body2" onClick={() => handleOpenModal('sogliaBonificiMensile', conto.sogliaBonificiMensile)} sx={{ ml: 2 }}>Modifica</Link>
              </Box>
              <Typography>€ {conto.sogliaBonificiMensile?.toFixed(2) ?? 'N/D'}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Transazioni Recenti */}
      <Typography variant="h5" gutterBottom>Transazioni</Typography>
      <Paper elevation={2}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID Operazione</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>IBAN Bonifico</TableCell>
                <TableCell>Importo (€)</TableCell>
                <TableCell>Causale</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((tx) => (
                <TableRow key={tx.idOperazione}>
                  <TableCell>{tx.idOperazione}</TableCell>
                  <TableCell>{tx.dataOperazione}</TableCell>
                  <TableCell>{tx.iban}</TableCell>
                  <TableCell sx={{ color: tx.importo >= 0 ? 'green' : 'red', fontWeight: 'bold' }}>
                    {tx.importo >= 0 ? '+' : '-'}€ {Math.abs(tx.importo).toFixed(2)}
                  </TableCell>
                  <TableCell>{tx.causale}</TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Nessuna transazione disponibile
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={transactions.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* Modal Modifica Soglie */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={styleModal}>
          <Typography variant="h6" gutterBottom>
            Modifica {fieldToEdit === 'sogliaBonificiGiornaliera' ? 'Limite Giornaliero' : 'Limite Mensile'}
          </Typography>
          <TextField
            label="Nuova soglia (€)"
            type="number"
            fullWidth
            value={fieldValue}
            onChange={(e) => setFieldValue(e.target.value)}
            inputProps={{ min: 0 }}
            sx={{ mb: 3 }}
          />
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={handleCloseModal}>Annulla</Button>
            <Button variant="contained" onClick={handleSave} disabled={fieldValue === '' || isNaN(Number(fieldValue))}>
              Salva
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Modal Nuovo Bonifico */}
      <Modal open={bonificoModalOpen} onClose={handleCloseBonificoModal}>
        <Box sx={styleModal}>
          <Typography variant="h6" gutterBottom>Nuovo Bonifico</Typography>
          <Stack spacing={2}>
            <TextField
              label="IBAN Destinatario"
              value={ibanDestinatario}
              onChange={(e) => setIbanDestinatario(e.target.value)}
              error={!!formErrors.ibanDestinatario}
              helperText={formErrors.ibanDestinatario}
            />
            <TextField
              label="Importo (€)"
              type="number"
              value={importo}
              onChange={(e) => setImporto(e.target.value)}
              error={!!formErrors.importo}
              helperText={formErrors.importo}
              InputProps={{
                inputMode: 'decimal',
                inputProps: { min: 0 }
              }}
            />

            <TextField
              label="Causale"
              value={causale}
              onChange={(e) => setCausale(e.target.value)}
              error={!!formErrors.causale}
              helperText={formErrors.causale}
            />
            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button onClick={handleCloseBonificoModal}>Annulla</Button>
              <Button variant="contained" onClick={handleSubmitBonifico}>Invia</Button>
            </Stack>
          </Stack>
        </Box>
      </Modal>

      {/* Snackbar notifiche */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}

export default DettaglioContocorrentePage;
