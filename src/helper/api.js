// helper/api.js
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export function useFetchWithAuth() {
  const navigate = useNavigate();

  return useCallback(async (url, options = {}) => {
    const token = localStorage.getItem('token');

    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      console.warn('Token scaduto o non valido, logout automatico');
      localStorage.removeItem('token');
      navigate('/login', { replace: true }); // reindirizza al login
      return null; // evita errori nella pagina chiamante
    }

    return response;
  }, [navigate]);
}
