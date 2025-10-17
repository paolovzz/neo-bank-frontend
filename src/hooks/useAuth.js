export function useAuth() {
  const [authenticated, setAuthenticated] = useState(null); // <--- null, non false

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthenticated(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        setAuthenticated(false);
      } else {
        setAuthenticated(true);
      }
    } catch (e) {
      localStorage.removeItem('token');
      setAuthenticated(false);
    }
  }, []);

  return authenticated;
}
