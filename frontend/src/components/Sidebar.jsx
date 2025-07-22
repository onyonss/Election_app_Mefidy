import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import vrailogologo from '../assets/vrailogologo.png';

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    navigate('/');
  };

  return (
    <Nav className="bg-info text-white d-flex flex-column p-3 text-center" style={{ backgroundColor: '#C9E4F9', minHeight: '100vh', width: '100%' }}>
      <Navbar.Brand as={NavLink} to="/dashboard-admin" className="d-flex align-items-center justify-content-center" style={{ marginBottom: '60px' }}>
        <img src={vrailogologo} alt="Logo" width="60" height="60" />
        <h3 style={{ color: '#000', margin: 0 }}>MEFIDY</h3>      
      </Navbar.Brand>
      <ul className="list-unstyled w-100">
        <li className="mb-5">
          <NavLink
            to="/dashboard-admin"
            className={({ isActive }) => `text-dark text-decoration-none menu-item d-flex align-items-center ${isActive ? 'active' : ''}`}
            style={{ fontWeight: 'bold' }}
          >
            <i className="fas fa-tachometer-alt me-2"></i> Tableau de bord
          </NavLink>
        </li>
        <li className="mb-5">
          <NavLink
            to="/admin/users"
            className={({ isActive }) => `text-dark text-decoration-none menu-item d-flex align-items-center ${isActive ? 'active' : ''}`}
            style={{ fontWeight: 'bold' }}
          >
            <i className="fas fa-user-cog me-2"></i> Gérer utilisateurs
          </NavLink>
        </li>
        <li className="mb-5">
          <NavLink
            to="/admin/gererelections"
            className={({ isActive }) => `text-dark text-decoration-none menu-item d-flex align-items-center ${isActive ? 'active' : ''}`}
            style={{ fontWeight: 'bold' }}
          >
            <i className="fas fa-vote-yea me-2"></i> Gérer élections
          </NavLink>
        </li>
        <li className="mb-5">
          <NavLink
            to="/admin/resultats"
            className={({ isActive }) => `text-dark text-decoration-none menu-item d-flex align-items-center ${isActive ? 'active' : ''}`}
            style={{ fontWeight: 'bold' }}
          >
            <i className="fas fa-poll me-2"></i> Gérer résultats
          </NavLink>
        </li>
      </ul>
      <div className="mt-auto">
        <NavLink
          to="/"
          className={({ isActive }) => `text-dark text-decoration-none menu-item d-flex align-items-center ${isActive ? 'active' : ''}`}
          style={{ fontWeight: 'bold' }}
          onClick={handleLogout}
        >
          <i className="fas fa-sign-out-alt me-2"></i> Déconnexion
        </NavLink>
      </div>
      <style jsx>{`
        .menu-item {
          transition: color 0.3s ease;
        }
        .menu-item:hover {
          color: #ffffff !important;
        }
        .menu-item:hover i {
          color: #ffffff !important;
        }
        .menu-item.active {
          color: #ffffff !important;
        }
        .menu-item.active i {
          color: #ffffff !important;
        }
      `}</style>
    </Nav>
  );
}