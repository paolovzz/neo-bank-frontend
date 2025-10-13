import { useState } from 'react';
import { Link } from 'react-router-dom';

function SignPage() {
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    username: '',
    dataNascita: '',
    luogoNascita: '',
    residenza: '',
    telefono: '',
    email: '',
    codiceFiscale: '',
    password: '',
    confermaPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setErrors(prev => ({
      ...prev,
      [e.target.name]: ''
    }));
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

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSuccess(false);
      return;
    }

    console.log('Registrazione riuscita:', formData);
    setSuccess(true);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2>Registrazione</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            <Input name="nome" label="Nome" value={formData.nome} onChange={handleChange} error={errors.nome} />
            <Input name="cognome" label="Cognome" value={formData.cognome} onChange={handleChange} error={errors.cognome} />

            <Input name="username" label="Username" value={formData.username} onChange={handleChange} error={errors.username} />
            <Input name="dataNascita" label="Data di nascita" type="date" value={formData.dataNascita} onChange={handleChange} error={errors.dataNascita} />

            <Input name="luogoNascita" label="Luogo di nascita" value={formData.luogoNascita} onChange={handleChange} error={errors.luogoNascita} />
            <Input name="residenza" label="Residenza" value={formData.residenza} onChange={handleChange} error={errors.residenza} />

            <Input name="telefono" label="Telefono" value={formData.telefono} onChange={handleChange} error={errors.telefono} />
            <Input name="email" label="Email" type="email" value={formData.email} onChange={handleChange} error={errors.email} />

            <Input name="codiceFiscale" label="Codice Fiscale" value={formData.codiceFiscale} onChange={handleChange} error={errors.codiceFiscale} />
          </div>

          <div style={styles.passwordContainer}>
            <Input
              name="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              style={styles.passwordInput}
            />
            <Input
              name="confermaPassword"
              label="Conferma Password"
              type="password"
              value={formData.confermaPassword}
              onChange={handleChange}
              error={errors.confermaPassword}
              style={styles.passwordInput}
            />
          </div>

          <button type="submit" style={styles.button}>Registrati</button>

          <div style={styles.loginLinkContainer}>
            <Link to="/login" style={styles.loginLink}>
              Hai già un account? Accedi qui
            </Link>
          </div>
        </form>

        {success && <p style={{ color: 'green', marginTop: '10px' }}>Registrazione completata con successo!</p>}
      </div>
    </div>
  );
}

function Input({ name, label, type = 'text', value, onChange, error, style }) {
  return (
    <div style={{ ...styles.inputGroup, ...style }}>
      <input
        name={name}
        type={type}
        placeholder={label}
        value={value}
        onChange={onChange}
        style={{
          ...styles.input,
          borderColor: error ? 'red' : '#ccc'
        }}
      />
      {error && <span style={styles.errorText}>{error}</span>}
    </div>
  );
}

const styles = {
  wrapper: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    fontFamily: 'Arial'
  },
  container: {
    width: '800px',
    padding: '30px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  passwordContainer: {
    display: 'flex',
    gap: '20px',
    marginTop: '30px',
    justifyContent: 'center'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
    flex: 1
  },
  input: {
    padding: '10px',
    fontSize: '14px',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  errorText: {
    color: 'red',
    fontSize: '12px',
    marginTop: '4px'
  },
  button: {
    marginTop: '20px',
    padding: '12px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  loginLinkContainer: {
    marginTop: '15px',
    textAlign: 'center'
  },
  loginLink: {
    color: '#007BFF',
    textDecoration: 'none',
    fontSize: '14px',
    cursor: 'pointer'
  }
};

export default SignPage;
