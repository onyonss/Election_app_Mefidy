import React, { useState } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import vrailogologo from '../assets/vrailogologo.png';
import vrailogotext from '../assets/vrailogotext.png';
import firstlogin from '../assets/firstlogin.jpg';
import api from '../api';

export default function FirstLogin() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/first-login/', {
        new_password: newPassword,
      });
      setSuccess('Mot de passe et empreinte digitale mis à jour avec succès');
      setIsLoading(false);
      setTimeout(() => {
        navigate('/dashboard-user');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  return (
    <Container fluid className="vh-100 d-flex align-items-center justify-content-center p-0 position-relative" style={{ backgroundColor: '#fff', fontFamily: 'Arial Rounded MT' }}>
      <div style={{ position: 'absolute', top: '2%', left: '2%', zIndex: 1 }}>
        <div>
          <img src={vrailogologo} alt="Logo" width="50" height="50" className="me-2" />
          <img src={vrailogotext} alt="Mefidy" width="80" height="55" className="me-2" />
        </div>
      </div>
      <div className="d-flex align-items-center justify-content-center" style={{ width: '100%', maxWidth: '1400px' }}>
        <div style={{ marginLeft: '15%', flex: '0 0 auto' }}>
          <img src={firstlogin} alt="First Login" style={{ objectFit: 'cover', background: 'transparent', maxHeight: '75vh', width: '100%', maxWidth: '500px' }} />
        </div>
        <div style={{ marginLeft: '5%', width: '700px', padding: '20px' }}>
          <div className="alert-container" style={{ minHeight: '70px', marginBottom: '20px' }}>
            {error && (
              <Alert variant="danger" className="d-flex justify-content-between align-items-center">
                {error}
                <button type="button" className="btn-close" onClick={() => setError(null)}></button>
              </Alert>
            )}
            {success && (
              <Alert variant="success" className="d-flex justify-content-between align-items-center">
                {success}
                <button type="button" className="btn-close" onClick={() => setSuccess(null)}></button>
              </Alert>
            )}
            {isLoading && (
              <Alert variant="info" className="d-flex justify-content-between align-items-center">
                Placez votre doigt sur le capteur lorsque le voyant s'allume, retirez-le quand il s'éteint.
                <Spinner animation="border" size="sm" />
              </Alert>
            )}
          </div>
          <div className="text-center" style={{width: '100%'}}>
            <h2 style={{ color: '#0F83DA', marginBottom: '15px', fontSize: '2.2rem' }}>Première connexion</h2>
            <hr style={{ borderColor: '#0F83DA', width: '200px', borderWidth: '2px', margin: '0 auto' }} />
            <p style={{ color: '#333', fontSize: '1rem', marginTop: '15px', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
              Pour sécuriser votre compte MEFIDY, veuillez définir un nouveau mot de passe et placer votre doigt sur le capteur d’empreinte digitale lorsque demandé.
            </p>
          </div>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: 'bold', color: '#333', fontSize: '1.1rem' }}>Nouveau mot de passe</Form.Label>
              <Form.Control
                type="password"
                placeholder="Entrez votre nouveau mot de passe"
                style={{ borderColor: '#0F83DA', borderRadius: '12px', padding: '12px', fontSize: '1rem', width: '100%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: 'bold', color: '#333', fontSize: '1.1rem' }}>Confirmer le mot de passe</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirmez votre mot de passe"
                style={{ borderColor: '#0F83DA', borderRadius: '12px', padding: '12px', fontSize: '1rem', width: '100%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </Form.Group>
            <div className="d-flex justify-content-center">
              <Button
                variant="primary"
                type="submit"
                className="rounded-pill py-2"
                style={{ backgroundColor: '#0F83DA', borderColor: '#0F83DA', fontSize: '1.1rem', color: '#fff', transition: 'all 0.3s ease', width: '250px', padding: '12px' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Enregistrement...
                  </>
                ) : (
                  'Mettre à jour'
                )}
              </Button>
            </div>
          </Form>
        </div>
      </div>
      <style jsx>{`
        .alert-container {
          min-height: 70px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .alert {
          font-size: 0.9rem;
          padding: 12px;
          margin: 0;
          max-width: 500px;
          border-radius: 8px;
        }
        .form-control {
          transition: all 0.3s ease;
        }
        .form-control:focus {
          border-color: #0F83DA;
          box-shadow: 0 0 8px rgba(15, 131, 218, 0.3);
        }
        .btn-primary:hover {
          background-color: #fff !important;
          color: #0F83DA !important;
          border-color: #0F83DA !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        @media (max-width: 767px) {
          .d-flex {
            flex-direction: column !important;
          }
          div[style*="marginLeft: '20%'"] {
            margin-left: 0 !important;
            width: 100% !important;
            padding: 0 15px;
          }
          div[style*="marginLeft: '5%'"] {
            margin-left: 0 !important;
            margin-bottom: 1.5rem !important;
            width: 100% !important;
            padding: 15px;
          }
          .alert-container {
            min-height: 80px;
            padding: 0 15px;
          }
          .alert {
            font-size: 0.85rem;
            max-width: 100%;
          }
          .form-control {
            width: 100% !important;
            font-size: 0.95rem;
          }
          img[alt="First Login"] {
            width: 100% !important;
            max-height: 35vh !important;
          }
          h2 {
            font-size: 1.8rem;
          }
          p {
            font-size: 0.95rem;
          }
          .btn-primary {
            width: 100% !important;
            font-size: 1rem;
          }
        }
      `}</style>
    </Container>
  );
}