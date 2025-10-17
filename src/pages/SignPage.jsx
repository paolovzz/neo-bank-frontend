import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Link,
} from '@mui/material';

function SignPage() {
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    username: '',
    dataNascita: '',
    residenza: '',
    telefono: '',
    email: '',
    codiceFiscale: '',
    password: '',
    confermaPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
    setMessage('');
  };

  const validate = () => {
    const newErrors = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (!value.trim()) {
        newErrors[key] = 'Campo obbligatorio';
      }
    });

    if (formData.password !== formData.confermaPassword) {
      newErrors.confermaPassword = 'Le password non coincidono';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Email non valida';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSuccess(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessage(errorData.message || 'Errore durante la registrazione.');
        setSuccess(false);
      } else {
        setMessage('Registrazione completata con successo!');
        setSuccess(true);
        setFormData({
          nome: '',
          cognome: '',
          username: '',
          dataNascita: '',
          residenza: '',
          telefono: '',
          email: '',
          codiceFiscale: '',
          password: '',
          confermaPassword: ''
        });
        // eventualmente redirect dopo registrazione, se vuoi:
        // navigate('/login')
      }
    } catch (err) {
      console.error('Errore di rete:', err);
      setMessage('Errore di rete. Riprova più tardi.');
      setSuccess(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Registrazione
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              fullWidth
              name="nome"
              label="Nome"
              value={formData.nome}
              onChange={handleChange}
              error={Boolean(errors.nome)}
              helperText={errors.nome}
            />
            <TextField
              fullWidth
              name="cognome"
              label="Cognome"
              value={formData.cognome}
              onChange={handleChange}
              error={Boolean(errors.cognome)}
              helperText={errors.cognome}
            />
            <TextField
              fullWidth
              name="username"
              label="Username"
              value={formData.username}
              onChange={handleChange}
              error={Boolean(errors.username)}
              helperText={errors.username}
            />
            <TextField
              fullWidth
              name="dataNascita"
              label="Data di Nascita"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.dataNascita}
              onChange={handleChange}
              error={Boolean(errors.dataNascita)}
              helperText={errors.dataNascita}
            />
            <TextField
              fullWidth
              name="residenza"
              label="Residenza"
              value={formData.residenza}
              onChange={handleChange}
              error={Boolean(errors.residenza)}
              helperText={errors.residenza}
            />
            <TextField
              fullWidth
              name="telefono"
              label="Telefono"
              value={formData.telefono}
              onChange={handleChange}
              error={Boolean(errors.telefono)}
              helperText={errors.telefono}
            />
            <TextField
              fullWidth
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={Boolean(errors.email)}
              helperText={errors.email}
            />
            <TextField
              fullWidth
              name="codiceFiscale"
              label="Codice Fiscale"
              value={formData.codiceFiscale}
              onChange={handleChange}
              error={Boolean(errors.codiceFiscale)}
              helperText={errors.codiceFiscale}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              name="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={Boolean(errors.password)}
              helperText={errors.password}
            />
            <TextField
              fullWidth
              name="confermaPassword"
              label="Conferma Password"
              type="password"
              value={formData.confermaPassword}
              onChange={handleChange}
              error={Boolean(errors.confermaPassword)}
              helperText={errors.confermaPassword}
            />
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
          >
            Registrati
          </Button>

          {message && (
            <Typography
              variant="body2"
              align="center"
              color={success ? 'success.main' : 'error'}
              sx={{ mt: 2 }}
            >
              {message}
            </Typography>
          )}

          <Typography variant="body2" align="center" sx={{ mt: 3 }}>
            Hai già un account?{' '}
            <Link component={RouterLink} to="/login">
              Accedi qui
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default SignPage;
