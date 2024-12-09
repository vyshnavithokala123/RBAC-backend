import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import axios from 'axios';

const App = () => {
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const login = async () => {
    const username = prompt('Enter Username');
    const password = prompt('Enter Password');
    try {
      const response = await axios.post('http://localhost:5000/login', { username, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      axios.defaults.headers['Authorization'] = `Bearer ${token}`;
    } catch (err) {
      alert('Login Failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <Router>
      <nav>
        <Link to="/admin">Admin</Link>
        <Link to="/user">User</Link>
        <Link to="/guest">Guest</Link>
        <button onClick={login}>Login</button>
        {token && <button onClick={logout}>Logout</button>}
      </nav>
      <Routes>
        <Route path="/admin" element={<ProtectedRoute role="admin" />} />
        <Route path="/user" element={<ProtectedRoute role="user" />} />
        <Route path="/guest" element={<ProtectedRoute role="guest" />} />
      </Routes>
    </Router>
  );
};

// Protected Route Component
const ProtectedRoute = ({ role }) => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios
      .get(`http://localhost:5000/${role}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then((response) => setMessage(response.data))
      .catch((err) => setMessage('Access Denied'));
  }, [role]);

  return <h1>{message}</h1>;
};

export default App;
