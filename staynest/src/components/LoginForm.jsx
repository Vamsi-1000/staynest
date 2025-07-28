import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate,Link } from 'react-router-dom';

const LoginForm = ({ setCurrentUser }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const storedUser = localStorage.getItem('staynest_user');
      if (storedUser) {
        try {
          const res = await axios.get('https://staynest-backend-thd5.onrender.com/api/auth/check', {
            withCredentials: true,
          });
          if (res.data.user) {
            setCurrentUser(res.data.user);
            navigate('/listings');
          } else {
            localStorage.removeItem('staynest_user');
          }
        } catch {
          localStorage.removeItem('staynest_user');
        }
      }
    };
    checkSession();
  }, [navigate, setCurrentUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        'https://staynest-backend-thd5.onrender.com/api/auth/login',
        formData,
        { withCredentials: true }
      );
      localStorage.setItem('staynest_user', JSON.stringify(res.data.user));
      setCurrentUser(res.data.user);
      navigate('/listings', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '450px' }}>
      <div className="card shadow p-4">
        <h3 className="mb-4 text-center">Login</h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              id="email"
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
          </div>

          <button type="submit" className="btn btn-success w-100">Login</button>
        </form>

        <p className="mt-3 text-center small">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
