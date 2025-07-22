import React, { useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import vrailogologo from '../assets/vrailogologo.png';
import vrailogotext from '../assets/vrailogotext.png';
import loginImage from '../assets/login-people.jpg';
import api from '../api';

const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return { is_staff: false, is_superuser: false };
  }
};

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notification, setNotification] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/token/', { username, password });
      const { access, refresh, is_first_login } = response.data;
      if (!access || !refresh) {
        throw new Error('Missing tokens in response');
      }
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('username', username);
      const decoded = decodeToken(access);
      localStorage.setItem('user_id', decoded.user_id || '');
      if (is_first_login) {
        navigate('/first-login');
      } else {
        const isAdmin = decoded.is_staff || decoded.is_superuser;
        navigate(isAdmin ? '/dashboard-admin' : '/dashboard-user');
      }
    } catch (error) {
      console.error('Login error:', error);
      setNotification('Erreur de connexion. Vérifiez votre prénom et mot de passe.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <Container fluid className="vh-100 d-flex align-items-center justify-content-center p-0 position-relative" style={{ backgroundColor: '#fff', fontFamily: 'Arial Rounded MT' }}>
      <div style={{ position: 'absolute', top: '2%', left: '2%', zIndex: 1 }}>
        <div>
          <img src={vrailogologo} alt="Logo" width="40" height="40" className="me-2" />
          <img src={vrailogotext} alt="Mefidy" width="70" height="45" className="me-2" />
        </div>
      </div>
      <div className="d-flex align-items-center justify-content-center" style={{ width: '100%', maxWidth: '1200px' }}>
        <div style={{ marginRight: '5%', marginLeft: '60%' }}>
          {notification && (
            <div className="alert alert-warning d-flex justify-content-between align-items-center mb-4">
              {notification}
              <button type="button" className="btn-close" onClick={() => setNotification(null)}></button>
            </div>
          )}
          <div className="text-center mb-4">
            <h2 style={{ color: '#0F83DA', marginBottom: '10px' }}>Connectez-vous</h2>
            <hr style={{ borderColor: '#0F83DA', width: '150px', borderWidth: '2px', margin: '0 auto' }} />
          </div>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: 'bold', color: '#333' }}>Prénom</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Entrez votre prénom" 
                style={{ borderColor: '#0F83DA', borderRadius: '10px', padding: '10px', width: '400px' }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: 'bold', color: '#333' }}>Mot de passe</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="Mot de passe" 
                style={{ borderColor: '#0F83DA', borderRadius: '10px', padding: '10px', width: '400px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <div className="d-flex justify-content-center">
              <Button 
                variant="primary" 
                type="submit" 
                className="rounded-pill py-2"
                style={{ backgroundColor: '#0F83DA', borderColor: '#0F83DA', fontSize: '18px', color: '#fff', transition: 'all 0.3s ease', width: '200px' }}
              >
                Connexion
              </Button>
            </div>
            <style jsx>{`
              .btn-primary:hover {
                background-color: #fff !important;
                color: #0F83DA !important;
                border-color: #0F83DA !important;
              }
            `}</style>
          </Form>
        </div>
        <div style={{ marginLeft: '5%' }}>
          <img src={loginImage} alt="illustration" style={{ objectFit: 'cover', background: 'transparent', maxHeight: '70vh' }} />
        </div>
      </div>
    </Container>
  );
}