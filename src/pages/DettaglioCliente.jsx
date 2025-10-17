import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Box,
    Grid,
    Paper,
    Typography,
    CircularProgress,
    Alert,
    Link,
    Modal,
    TextField,
    Button,
    Stack,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    IconButton,
    Tooltip,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import AddCircleIcon from '@mui/icons-material/AddCircle';
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

const apiMap = {
    email: '/clienti/email',
    residenza: '/clienti/residenza',
    telefono: '/clienti/telefono',
};

function DettaglioCliente() {
    const location = useLocation();
    const { utente } = location.state || {};
    const fetchWithAuth = useFetchWithAuth();

    const [datiCliente, setDatiCliente] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [fieldToEdit, setFieldToEdit] = useState('');
    const [fieldValue, setFieldValue] = useState('');
    const [originalValue, setOriginalValue] = useState('');

    const [ibanList, setIbanList] = useState([]);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const showSnackbar = (message, severity = 'success') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    useEffect(() => {
        const fetchDati = async () => {
            try {
                const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/clienti`);
                if (!response.ok) throw new Error(`Errore fetching profilo: ${response.status}`);
                const data = await response.json();
                setDatiCliente(data);
            } catch (err) {
                console.error('Errore durante fetch profilo:', err);
                setError('Impossibile caricare i dati utente');
            } finally {
                setLoading(false);
            }
        };

        const fetchConti = async () => {
            try {
                const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/clienti/iban`);
                if (!response.ok) throw new Error(`Errore nel recupero IBAN: ${response.status}`);
                const ibanData = await response.json();
                setIbanList(ibanData);
            } catch (err) {
                console.error('Errore recupero IBAN:', err);
                showSnackbar('Errore nel recupero degli IBAN', 'error');
            }
        };

        fetchDati();
        fetchConti();
    }, [fetchWithAuth]);

    const handleOpenModal = (field) => {
        if (!datiCliente) return;
        setFieldToEdit(field);
        setFieldValue(datiCliente[field] || '');
        setOriginalValue(datiCliente[field] || '');
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setFieldToEdit('');
        setFieldValue('');
        setOriginalValue('');
    };

    const handleChange = (e) => {
        setFieldValue(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!apiMap[fieldToEdit]) {
            showSnackbar('Campo non modificabile via API', 'error');
            return;
        }

        try {
            const endpoint = `${import.meta.env.VITE_API_BASE_URL}${apiMap[fieldToEdit]}`;
            const response = await fetchWithAuth(endpoint, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [fieldToEdit]: fieldValue }),
            });

            if (!response.ok) {
                throw new Error(`Errore aggiornamento: ${response.status}`);
            }

            setDatiCliente(prev => ({ ...prev, [fieldToEdit]: fieldValue }));
            handleCloseModal();
            showSnackbar('Dati aggiornati con successo!', 'success');
        } catch (err) {
            console.error('Errore aggiornamento campo:', err);
            showSnackbar('Errore durante l’aggiornamento. Riprova.', 'error');
        }
    };

    const handleOpenNewAccountDialog = () => {
        setConfirmDialogOpen(true);
    };

    const handleCloseNewAccountDialog = () => {
        setConfirmDialogOpen(false);
    };

    const handleConfirmNewAccount = async () => {
        setConfirmDialogOpen(false);

        try {
            const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/cc`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response) {
                return;
            }

            if (!response.ok) {
                throw new Error(`Errore creazione conto: ${response.status}`);
            }

            showSnackbar('Conto corrente creato con successo.', 'success');

            setTimeout(() => {
                window.location.reload();
            }, 1500);

        } catch (err) {
            console.error('Errore creazione conto:', err);
            showSnackbar('Errore durante la creazione del conto.', 'error');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ mt: 4, mx: 2 }}>
                <Alert severity="error">Errore: {error}</Alert>
            </Box>
        );
    }

    if (!datiCliente) {
        return (
            <Box sx={{ mt: 4, mx: 2 }}>
                <Alert severity="info">Nessun dato disponibile</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 } }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary">Nome</Typography>
                        <Typography variant="body1">{datiCliente.nome}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary">Cognome</Typography>
                        <Typography variant="body1">{datiCliente.cognome}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary">Codice Fiscale</Typography>
                        <Typography variant="body1">{datiCliente.codiceFiscale}</Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                            <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                            <Typography variant="body1">{datiCliente.email}</Typography>
                        </Box>
                        <Link component="button" variant="body2" onClick={() => handleOpenModal('email')} sx={{ ml: 2 }}>
                            Modifica
                        </Link>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary">Data di Nascita</Typography>
                        <Typography variant="body1">{datiCliente.dataNascita}</Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                            <Typography variant="subtitle2" color="textSecondary">Residenza</Typography>
                            <Typography variant="body1">{datiCliente.residenza}</Typography>
                        </Box>
                        <Link component="button" variant="body2" onClick={() => handleOpenModal('residenza')} sx={{ ml: 2 }}>
                            Modifica
                        </Link>
                    </Grid>

                    <Grid item xs={12} sm={6} display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                            <Typography variant="subtitle2" color="textSecondary">Telefono</Typography>
                            <Typography variant="body1">{datiCliente.telefono}</Typography>
                        </Box>
                        <Link component="button" variant="body2" onClick={() => handleOpenModal('telefono')} sx={{ ml: 2 }}>
                            Modifica
                        </Link>
                    </Grid>
                </Grid>
            </Paper>

            <Box sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Conti Correnti</Typography>
                    <Tooltip title="Apri nuovo conto" arrow>
                        <IconButton
                            color="primary"
                            onClick={handleOpenNewAccountDialog}
                            aria-label="Richiedi nuovo conto"
                            sx={{ ml: 1 }}
                        >
                            <AddCircleIcon fontSize="large" />
                        </IconButton>
                    </Tooltip>
                </Box>

                <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                    {ibanList.length > 0 ? (
                        <Stack spacing={1}>
                            {ibanList.map((ibanStr, idx) => (
                                <Typography
                                    key={idx}
                                    variant="body1"
                                    sx={{ wordBreak: 'break-word', padding: '8px 0' }}
                                >
                                    {ibanStr}
                                </Typography>
                            ))}
                        </Stack>
                    ) : (
                        <Typography variant="body2">Nessun conto disponibile.</Typography>
                    )}
                </Paper>
            </Box>

            <Modal open={modalOpen} onClose={handleCloseModal} aria-labelledby="modal-title">
                <Box component="form" onSubmit={handleSubmit} sx={styleModal}>
                    <Typography id="modal-title" variant="h6" mb={2}>
                        Modifica {fieldToEdit.charAt(0).toUpperCase() + fieldToEdit.slice(1)}
                    </Typography>
                    <TextField
                        fullWidth
                        label={fieldToEdit.charAt(0).toUpperCase() + fieldToEdit.slice(1)}
                        value={fieldValue}
                        onChange={handleChange}
                        variant="outlined"
                        margin="normal"
                        required
                    />
                    <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
                        <Button onClick={handleCloseModal} color="secondary">Annulla</Button>
                        <Button type="submit" variant="contained" disabled={fieldValue === originalValue}>Salva</Button>
                    </Stack>
                </Box>
            </Modal>

            <Dialog open={confirmDialogOpen} onClose={handleCloseNewAccountDialog}>
                <DialogTitle>Conferma</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Sei sicuro di voler creare un nuovo conto corrente?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialogOpen(false)}>Annulla</Button>
                    <Button onClick={handleConfirmNewAccount} variant="contained" color="primary">
                        Conferma
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <MuiAlert
                    elevation={6}
                    variant="filled"
                    onClose={() => setSnackbarOpen(false)}
                    severity={snackbarSeverity}
                >
                    {snackbarMessage}
                </MuiAlert>
            </Snackbar>
        </Box>
    );
}

export default DettaglioCliente;
