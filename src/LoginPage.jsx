import { useState } from 'react';
import { Link } from 'react-router-dom'; // <--- IMPORT NECESSARIO

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const handleLogin = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Username obbligatorio';
    if (!password.trim()) newErrors.password = 'Password obbligatoria';

    setErrors(newErrors);
    setMessage('');

    if (Object.keys(newErrors).length > 0) return;

    // Simula credenziali corrette
    if (username === 'admin' && password === 'password') {
      setMessage('Login effettuato con successo!');
    } else {
      setMessage('Credenziali non valide.');
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2>Login</h2>
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setErrors(prev => ({ ...prev, username: '' }));
              }}
              style={{ 
                ...styles.input, 
                borderColor: errors.username ? 'red' : '#ccc' 
              }}
            />
            {errors.username && <span style={styles.errorText}>{errors.username}</span>}
          </div>

          <div style={styles.inputGroup}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors(prev => ({ ...prev, password: '' }));
              }}
              style={{ 
                ...styles.input, 
                borderColor: errors.password ? 'red' : '#ccc' 
              }}
            />
            {errors.password && <span style={styles.errorText}>{errors.password}</span>}
          </div>

          <button type="submit" style={styles.button}>Login</button>
        </form>
        {message && <p>{message}</p>}
        <p style={styles.registerText}>
          Non hai un account? <Link to="/sign" style={styles.link}>Registrati</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2'
  },
  container: {
    width: '300px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    fontFamily: 'Arial'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '10px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left'
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  errorText: {
    color: 'red',
    fontSize: '12px',
    marginTop: '4px'
  },
  button: {
    padding: '10px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  registerText: {
    marginTop: '10px',
    fontSize: '14px'
  },
  link: {
    color: '#007bff',
    textDecoration: 'none'
  }
};

export default LoginPage;
