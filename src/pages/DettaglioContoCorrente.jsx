import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Link,
  Modal,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  Select,
  MenuItem,
  TableContainer,
  TableHead,
  TablePagination,
  FormControl,
  InputLabel,
  TableRow,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CreditCard from '../components/CreditCard';
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

function DettaglioContoCorrente() {
  const location = useLocation();
  const { iban } = location.state || {};
  const navigate = useNavigate();

  const [conto, setConto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState([]);

  // 🔹 Stati filtri e gestione transazioni
  const [dataMin, setDataMin] = useState('');
  const [dataMax, setDataMax] = useState('');
  const [importoMin, setImportoMin] = useState('');
  const [importoMax, setImportoMax] = useState('');
  const [tipologiaFlusso, setTipologiaFlusso] = useState('');
  const [loadingTransazioni, setLoadingTransazioni] = useState(false);
  const [errorTransazioni, setErrorTransazioni] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [fieldToEdit, setFieldToEdit] = useState('');
  const [fieldValue, setFieldValue] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [carteAssociate, setCarteAssociate] = useState([]);
  const [loadingCarte, setLoadingCarte] = useState(true);
  const [errorCarte, setErrorCarte] = useState('');

  const fetchWithAuth = useFetchWithAuth();

  const [bonificoModalOpen, setBonificoModalOpen] = useState(false);
  const [richiediCartaModalOpen, setRichiediCartaModalOpen] = useState(false);
  const [ibanDestinatario, setIbanDestinatario] = useState('');
  const [importo, setImporto] = useState('');
  const [causale, setCausale] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const scrollRef = useRef(null);
  const scroll = (dir) => {
    if (scrollRef.current) {
      const amount = 300;
      scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    }
  };

  // --- FETCH CONTO ---
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

  // --- FETCH CARTE ASSOCIATE ---
  const fetchCarteAssociate = async () => {
    try {
      setLoadingCarte(true);
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/carte/iban/${iban}`);
      if (!response.ok) throw new Error(`Errore caricamento carte: ${response.status}`);
      const data = await response.json();
      setCarteAssociate(data);
    } catch (err) {
      console.error(err);
      setErrorCarte('Errore durante il recupero delle carte associate.');
    } finally {
      setLoadingCarte(false);
    }
  };

  // --- FETCH TRANSAZIONI (con filtri dataMin / dataMax) ---
  const fetchTransazioni = async ({
    dataMin: dMin = dataMin,
    dataMax: dMax = dataMax,
    importoMin: iMin = importoMin,
    importoMax: iMax = importoMax,
    tipologiaFlusso: tipo = tipologiaFlusso
  } = {}) => {
    try {
      setLoadingTransazioni(true);
      setErrorTransazioni('');

      let url = `${import.meta.env.VITE_API_BASE_URL}/cc/${iban}/transazioni`;
      const params = [];
      if (dMin) params.push(`dataCreazioneMin=${dMin}`);
      if (dMax) params.push(`dataCreazioneMax=${dMax}`);
      if (iMin) params.push(`importoMin=${iMin}`);
      if (iMax) params.push(`importoMax=${iMax}`);
      if (tipo) params.push(`tipologiaFlusso=${tipo}`);
      if (params.length > 0) url += '?' + params.join('&');

      const response = await fetchWithAuth(url);
      const data = await response.json();
      setTransactions(data.result);
    } catch (err) {
      console.log(err)
      setErrorTransazioni('Errore durante il recupero delle transazioni.');
    } finally {
      setLoadingTransazioni(false);
    }
  };


  // --- CARICAMENTO INIZIALE ---
  useEffect(() => {
    if (iban) {
      fetchConto();
      fetchCarteAssociate();
      fetchTransazioni(); // carica all'avvio
    } else {
      setError('IBAN non specificato.');
      setLoading(false);
    }
  }, [iban]);

  // --- MODIFICA SOGLIE ---
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
        body = { nuovaSoglia: parseInt(fieldValue, 10), iban: conto.iban };
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

  // --- BONIFICO ---
  const handleOpenBonificoModal = () => {
    setIbanDestinatario('');
    setImporto('');
    setCausale('');
    setFormErrors({});
    setBonificoModalOpen(true);
  };
  const handleOpenRichiediCartaModal = () => {
    setRichiediCartaModalOpen(true);
  };

  const handleCloseBonificoModal = () => setBonificoModalOpen(false);
  const handleCloseRichiediCartaModal = () => setRichiediCartaModalOpen(false);

  const validateBonificoForm = () => {
    const errors = {};
    const ibanRegex = /^IT\d{2}[A-Z0-9]{1,30}$/;

    if (!ibanDestinatario || !ibanRegex.test(ibanDestinatario)) {
      errors.ibanDestinatario = 'IBAN non valido (deve iniziare con IT...)';
    } else if (ibanDestinatario === iban) {
      errors.ibanDestinatario = "L'IBAN del destinatario non può essere uguale a quello del mittente";
    }
    if (!importo || isNaN(importo) || Number(importo) <= 0) {
      errors.importo = 'Inserire un importo valido maggiore di 0';
    }
    if (conto && Number(importo) > conto.saldoDisponibile) {
      errors.importo = 'Inserire un importo minore rispetto al saldo disponibile';
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
      ibanMittente: conto.iban,
      ibanDestinatario,
      importo: parseFloat(importo),
      causale,
    };

    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/cc/predisponi-bonifico`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error('Errore durante l’invio del bonifico');

      setSnackbar({ open: true, message: 'Bonifico inviato con successo.', severity: 'success' });

      handleCloseBonificoModal();
      fetchTransazioni(); // aggiorna la lista dopo un bonifico
    } catch (error) {
      setSnackbar({ open: true, message: 'Errore durante l\'invio del bonifico', severity: 'error' });
    }
  };

  const handleSubmitRichiestaCarta = async () => {
    const body = { iban: conto.iban };

    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/carte`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error('Errore durante la richiesta della nuova carta');

      setSnackbar({ open: true, message: 'Carta richiesta con successo.', severity: 'success' });
      handleCloseRichiediCartaModal();

      setTimeout(() => {
        fetchCarteAssociate();
      }, 1500);
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Errore durante la richiesta della nuova carta', severity: 'error' });
    }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // --- RENDER PRINCIPALE ---
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
  if (!conto)
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="info">Nessun dato del conto disponibile.</Alert>
      </Box>
    );

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* --- Saldi --- */}
      <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Saldo Disponibile</Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: 'bold', color: conto.saldoDisponibile >= 0 ? 'success.main' : 'error.main' }}
            >
              € {conto.saldoDisponibile?.toFixed(2) ?? 'N/D'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Saldo Contabile</Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: 'bold', color: conto.saldoContabile >= 0 ? 'success.main' : 'error.main' }}
            >
              € {conto.saldoContabile?.toFixed(2) ?? 'N/D'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* --- Dati tecnici --- */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        {[
          { label: 'IBAN', value: conto.iban },
          { label: 'NUMERO CONTO', value: conto.numeroConto },
          { label: 'BIC', value: conto.bic },
          { label: 'CAB', value: conto.cab },
          { label: 'ABI', value: conto.abi },
        ].map((item, index) => (
          <Grid container spacing={2} sx={{ mb: 2 }} key={index}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                {item.label}:
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1">{item.value ?? 'N/D'}</Typography>
            </Grid>
          </Grid>
        ))}
      </Paper>

      {/* --- Carte associate --- */}
      <Box sx={{ position: 'relative', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5">Carte associate</Typography>
          <Button variant="contained" color="primary" onClick={handleOpenRichiediCartaModal}>
            Richiedi carta
          </Button>
        </Box>
        {loadingCarte ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={32} />
          </Box>
        ) : errorCarte ? (
          <Alert severity="error">{errorCarte}</Alert>
        ) : carteAssociate.length > 0 ? (
          <>
            <IconButton
              onClick={() => scroll('left')}
              sx={{ position: 'absolute', left: -10, top: '45%', zIndex: 1, backgroundColor: 'background.paper' }}
            >
              <ChevronLeftIcon />
            </IconButton>

            <Box
              ref={scrollRef}
              sx={{
                display: 'flex',
                overflowX: 'auto',
                gap: 2,
                scrollBehavior: 'smooth',
                py: 2,
                px: 5,
                '&::-webkit-scrollbar': { height: 6 },
                '&::-webkit-scrollbar-thumb': { backgroundColor: '#888', borderRadius: 3 },
                '&::-webkit-scrollbar-thumb:hover': { backgroundColor: '#555' },
              }}
            >
              {carteAssociate.map((carta, index) => (
                <Box
                  key={index}
                  sx={{
                    flex: '0 0 auto',
                    minWidth: 280,
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    borderRadius: 2,
                    boxShadow: 2,
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: 6,
                      backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    },
                  }}
                  onClick={() => navigate(`/home/dettaglio-carta/${carta.numeroCarta}`)}
                >
                  <CreditCard
                    cardNumber={carta.numeroCarta}
                    cardHolder={`${carta.intestatario}`}
                    expiry={`${String(new Date(carta.dataScadenza).getMonth() + 1).padStart(2, '0')}/${String(
                      new Date(carta.dataScadenza).getFullYear()
                    ).slice(-2)}`}
                  />
                </Box>
              ))}
            </Box>

            <IconButton
              onClick={() => scroll('right')}
              sx={{ position: 'absolute', right: -10, top: '45%', zIndex: 1, backgroundColor: 'background.paper' }}
            >
              <ChevronRightIcon />
            </IconButton>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Nessuna carta associata a questo conto.
          </Typography>
        )}
      </Box>

      {/* --- Limiti Bonifico --- */}
      <Typography variant="h5" gutterBottom>
        Limiti Bonifico
      </Typography>
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography>Soglia giornaliera: {conto.sogliaBonificiGiornaliera}€</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Link
              component="button"
              variant="body2"
              onClick={() =>
                handleOpenModal('sogliaBonificiGiornaliera', conto.sogliaBonificiGiornaliera)
              }
            >
              Modifica
            </Link>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography>Soglia mensile: {conto.sogliaBonificiMensile}€</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Link
              component="button"
              variant="body2"
              onClick={() =>
                handleOpenModal('sogliaBonificiMensile', conto.sogliaBonificiMensile)
              }
            >
              Modifica
            </Link>
          </Grid>
        </Grid>
      </Paper>

      {/* --- Transazioni --- */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Transazioni</Typography>
        <Button variant="contained" color="primary" onClick={handleOpenBonificoModal}>
          Nuovo Bonifico
        </Button>
      </Box>

      {/* --- FILTRI TRANSAZIONI --- */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Data minima"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={dataMin}
              onChange={(e) => setDataMin(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Data massima"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={dataMax}
              onChange={(e) => setDataMax(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Importo minimo (€)"
              type="number"
              value={importoMin}
              onChange={(e) => setImportoMin(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Importo massimo (€)"
              type="number"
              value={importoMax}
              onChange={(e) => setImportoMax(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth sx={{ minWidth: 160 }}>
              <InputLabel id="flusso-select-label">Tipo</InputLabel>
              <Select
                labelId="flusso-select-label"
                label="Tipo"
                value={tipologiaFlusso}
                onChange={(e) => setTipologiaFlusso(e.target.value)}
              >
                <MenuItem value="">Tutti</MenuItem>
                <MenuItem value="ACCREDITO">Entrate</MenuItem>
                <MenuItem value="ADDEBITO">Uscite</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button variant="contained" color="primary" onClick={fetchTransazioni}>
              Applica filtri
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => {
                setDataMin('');
                setDataMax('');
                setImportoMin('');
                setImportoMax('');
                setTipologiaFlusso('');
                fetchTransazioni({
                  dataMin: '',
                  dataMax: '',
                  importoMin: '',
                  importoMax: '',
                  tipologiaFlusso: ''
                });
              }}
            >
              Reset
            </Button>
          </Grid>

        </Grid>
      </Paper>

      {/* --- TABELLA TRANSAZIONI --- */}
      {loadingTransazioni ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={32} />
        </Box>
      ) : errorTransazioni ? (
        <Alert severity="error">{errorTransazioni}</Alert>
      ) : transactions.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Nessuna transazione trovata per questo intervallo.
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID Operazione</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>IBAN</TableCell>
                <TableCell>Importo</TableCell>
                <TableCell>Causale</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((tx) => (
                  <TableRow key={tx.idOperazione}>
                    <TableCell>{tx.idOperazione}</TableCell>
                    <TableCell>{new Date(tx.dataCreazione).toLocaleDateString()}</TableCell>
                    <TableCell>{tx.iban}</TableCell>
                    <TableCell sx={{ color: tx.tipologiaFlusso === 'ACCREDITO' ? 'green' : 'red' }}>
                      {tx.importo.toFixed(2)}€
                    </TableCell>
                    <TableCell>{tx.causale}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={transactions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      )}

      {/* --- MODALE MODIFICA SOGLIA --- */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={styleModal}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Modifica {fieldToEdit === 'sogliaBonificiGiornaliera' ? 'Soglia Giornaliera' : 'Soglia Mensile'}
          </Typography>
          <TextField
            fullWidth
            label="Nuovo valore (€)"
            type="number"
            value={fieldValue}
            onChange={(e) => setFieldValue(e.target.value)}
            sx={{ mb: 3 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={handleCloseModal}>
              Annulla
            </Button>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Salva
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* --- MODALE NUOVO BONIFICO --- */}
      <Modal open={bonificoModalOpen} onClose={handleCloseBonificoModal}>
        <Box sx={styleModal}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Nuovo Bonifico
          </Typography>
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
            />
            <TextField
              label="Causale"
              value={causale}
              onChange={(e) => setCausale(e.target.value)}
              error={!!formErrors.causale}
              helperText={formErrors.causale}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
              <Button onClick={handleCloseBonificoModal} variant="outlined">
                Annulla
              </Button>
              <Button onClick={handleSubmitBonifico} variant="contained" color="primary">
                Invia Bonifico
              </Button>
            </Box>
          </Stack>
        </Box>
      </Modal>

      {/* --- MODALE RICHIESTA CARTA --- */}
      <Modal open={richiediCartaModalOpen} onClose={handleCloseRichiediCartaModal}>
        <Box sx={styleModal}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Richiedi nuova carta
          </Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>
            Confermi di voler richiedere una nuova carta associata al conto <b>{conto.iban}</b>?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={handleCloseRichiediCartaModal}>
              Annulla
            </Button>
            <Button variant="contained" color="primary" onClick={handleSubmitRichiestaCarta}>
              Conferma
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* --- SNACKBAR --- */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert elevation={6} variant="filled" severity={snackbar.severity}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}

export default DettaglioContoCorrente;
