import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Modal } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { FaFileExport, FaVoteYea, FaUsers, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import moment from 'moment';
import MainLayout from '../components/MainLayout';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import NotificationAlert from '../components/NotificationAlert';
import PageHeader from '../components/PageHeader';
import ActionButtonGroup from '../components/ActionButtonGroup';
import api from '../api';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [elections, setElections] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredElections, setFilteredElections] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showDeleteElectionConfirm, setShowDeleteElectionConfirm] = useState(false);
  const [showDeleteUserConfirm, setShowDeleteUserConfirm] = useState(false);
  const [deleteElectionId, setDeleteElectionId] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentElectionIndex, setCurrentElectionIndex] = useState(0);

  const fetchData = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('No user ID found in localStorage');
      const [userResponse, electionResponse, userListResponse] = await Promise.all([
        api.get(`/api/users/${userId}/`),
        api.get('/api/elections/'),
        api.get('/api/users/'),
      ]);
      const electionData = Array.isArray(electionResponse.data) ? electionResponse.data : [];
      electionData.sort((a, b) => new Date(b.startdate) - new Date(a.startdate));
      const userData = Array.isArray(userListResponse.data) ? userListResponse.data : [];
      setElections(electionData);
      setFilteredElections(electionData);
      setUsers(userData);
      setFilteredUsers(userData);
    } catch (error) {
      setNotification('Erreur de chargement des données.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  useEffect(() => {
    fetchData();
    if (location.state?.notification) {
      setNotification(location.state.notification);
      setTimeout(() => {
        setNotification(null);
        navigate(location.pathname, { replace: true, state: {} });
      }, 3000);
    }
  }, [location, navigate]);

  useEffect(() => {
    setFilteredElections(
      elections.filter(e => e.nom.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredUsers(
      users.filter(u => u.nom.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, elections, users]);

  const handleEditElection = (election) => navigate(`/admin/gererelections/${election.id}/edit`);
  const handleShowDetails = (election) => navigate(`/admin/gererelections/${election.id}/details`);
  const handleDeleteElectionConfirm = (id) => {
    setDeleteElectionId(id);
    setShowDeleteElectionConfirm(true);
  };
  const handleDeleteElection = async () => {
    try {
      await api.delete(`/api/elections/${deleteElectionId}/`);
      setElections(elections.filter(e => e.id !== deleteElectionId));
      setFilteredElections(filteredElections.filter(e => e.id !== deleteElectionId));
      setShowDeleteElectionConfirm(false);
      setNotification('Élection supprimée avec succès !');
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification('Erreur lors de la suppression de l’élection.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleEditUser = (user) => navigate(`/admin/users/${user.id}/edit`);
  const handleShowUserDetails = (user) => navigate(`/admin/users/${user.id}/details`);
  const handleDeleteUserConfirm = (id) => {
    setDeleteUserId(id);
    setShowDeleteUserConfirm(true);
  };
  const handleDeleteUser = async () => {
    try {
      await api.delete(`/api/users/${deleteUserId}/`);
      setUsers(users.filter(u => u.id !== deleteUserId));
      setFilteredUsers(filteredUsers.filter(u => u.id !== deleteUserId));
      setShowDeleteUserConfirm(false);
      setNotification('Utilisateur supprimé avec succès !');
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification('Erreur lors de la suppression de l’utilisateur.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const getTypeLabel = (classe) => {
    const classes = { 1: 'L1', 2: 'L2', 3: 'L3', 4: 'M1', 5: 'M2' };
    return classes[classe] || 'Inconnu';
  };

  const handleExportElections = async () => {
    try {
      const response = await api.get('/api/elections/export-excel/', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'elections.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setNotification('Erreur lors de l’exportation Excel.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleExportUsers = async () => {
    try {
      const response = await api.get('/api/users/export-excel/', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setNotification('Erreur lors de l’exportation Excel.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const pieChartData = {
    labels: ['Ouvert', 'Fermé'],
    datasets: [{
      data: [
        elections.filter(e => e.statut === 'ouvert').length,
        elections.filter(e => e.statut === 'ferme').length
      ],
      backgroundColor: ['#0d6efd', '#dc3545']
    }]
  };

  const currentElection = elections[currentElectionIndex] || {};
  const barChartData = {
    labels: [currentElection.nom || ''],
    datasets: [
      {
        label: 'Votants',
        data: [currentElection.voters_who_voted || 0],
        backgroundColor: '#0d6efd'
      },
      {
        label: 'Électeurs totaux',
        data: [currentElection.total_voters || 0],
        backgroundColor: '#28a745'
      }
    ]
  };

  const handlePreviousElection = () => {
    setCurrentElectionIndex((prev) => (prev === 0 ? elections.length - 1 : prev - 1));
  };

  const handleNextElection = () => {
    setCurrentElectionIndex((prev) => (prev === elections.length - 1 ? 0 : prev + 1));
  };

  return (
    <MainLayout sidebar={Sidebar}>
      <NotificationAlert message={notification} onClose={() => setNotification(null)} />
      <SearchBar
        placeholder="Rechercher élections ou utilisateurs..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />
      {searchQuery ? (
        <div>
          <h3 className="mb-4" style={{ color: '#0F83DA' }}>Résultats de la recherche</h3>
          <Row className="mb-4">
            <Col xs={12}>
              <div className="p-3 bg-white rounded shadow-sm mb-4">
                <h5 style={{ color: '#0F83DA' }}><FaVoteYea className="me-2" />Élections</h5>
                {filteredElections.length === 0 ? (
                  <p>Aucune élection trouvée.</p>
                ) : (
                  filteredElections.map(election => (
                    <div key={election.id} className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-2">
                      <span>{election.nom} ({moment(election.startdate).format('DD/MM/YY HH:mm')} - {moment(election.enddate).format('DD/MM/YY HH:mm')})</span>
                      <ActionButtonGroup
                        onDetails={() => handleShowDetails(election)}
                        onEdit={() => handleEditElection(election)}
                        onDelete={() => handleDeleteElectionConfirm(election.id)}
                      />
                    </div>
                  ))
                )}
              </div>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <div className="p-3 bg-white rounded shadow-sm">
                <h5 style={{ color: '#0F83DA' }}><FaUsers className="me-2" />Utilisateurs</h5>
                {filteredUsers.length === 0 ? (
                  <p>Aucun utilisateur trouvé.</p>
                ) : (
                  filteredUsers.map(user => (
                    <div key={user.id} className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-2">
                      <span>{user.nom} ({getTypeLabel(user.classe)})</span>
                      <ActionButtonGroup
                        onDetails={() => handleShowUserDetails(user)}
                        onEdit={() => handleEditUser(user)}
                        onDelete={() => handleDeleteUserConfirm(user.id)}
                      />
                    </div>
                  ))
                )}
              </div>
            </Col>
          </Row>
        </div>
      ) : (
        <>
          <PageHeader title="Bienvenue, Admin" icon={FaVoteYea} />
          <Row className="mb-4">
            <Col xs={12} sm={6} md={4} className="mb-3">
              <div className="p-3 bg-white rounded shadow-sm text-center">
                <h6 style={{ color: '#0F83DA' }}>Élections totales</h6>
                <p className="fs-4 fw-bold mb-0">{elections.length}</p>
              </div>
            </Col>
            <Col xs={12} sm={6} md={4} className="mb-3">
              <div className="p-3 bg-white rounded shadow-sm text-center">
                <h6 style={{ color: '#0F83DA' }}>Utilisateurs totaux</h6>
                <p className="fs-4">{users.length}</p>
              </div>
            </Col>
            <Col xs={12} sm={6} md={4} className="mb-3">
              <div className="p-3 bg-white rounded shadow-sm text-center">
                <h6 style={{ color: '#0F83DA' }}>Élections ouvertes</h6>
                <p className="fs-4 fw-bold mb-0">{elections.filter(e => e.statut === 'ouvert').length}</p>
              </div>
            </Col>
          </Row>
          <Row className="mb-4">
            <Col xs={12} md={6} className="mb-4 mb-md-0">
              <div className="p-3 bg-white rounded shadow-sm">
                <h5 style={{ color: '#0F83DA' }}>Statut des élections</h5>
                <div style={{ height: '250px' }}>
                  <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className="p-3 bg-white rounded shadow-sm">
                <h5 style={{ color: '#0F83DA' }}>Participation électorale</h5>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={handlePreviousElection}
                    disabled={elections.length <= 1}
                  >
                    <FaArrowLeft />
                  </Button>
                  <span>{currentElection.nom || 'Aucune élection'}</span>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={handleNextElection}
                    disabled={elections.length <= 1}
                  >
                    <FaArrowRight />
                  </Button>
                </div>
                <div style={{ height: '250px' }}>
                  <Bar
                    data={barChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: { beginAtZero: true },
                      },
                    }}
                  />
                </div>
              </div>
            </Col>
          </Row>
          <Row className="mb-4">
            <Col xs={12}>
              <div className="p-3 bg-white rounded shadow-sm">
                <h5 style={{ color: '#0F83DA' }}><FaVoteYea className="me-2" />Élections récentes</h5>
                {filteredElections.length === 0 ? (
                  <p>Aucune élection disponible.</p>
                ) : (
                  filteredElections.slice(0, 5).map(election => (
                    <div key={election.id} className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-2">
                      <span>{election.nom} </span>
                      <ActionButtonGroup
                        onDetails={() => handleShowDetails(election)}
                        onEdit={() => handleEditElection(election)}
                        onDelete={() => handleDeleteElectionConfirm(election.id)}
                      />
                    </div>
                  ))
                )}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 mt-3">
                  <Link to="/admin/gererelections">
                    <Button variant="primary" className="rounded-pill">Voir toutes les élections</Button>
                  </Link>
                  <Button variant="outline-secondary" size="sm" onClick={handleExportElections}>
                    <FaFileExport className="me-1" /> Exporter Excel
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
          <Row className="mb-4">
            <Col xs={12}>
              <div className="p-3 bg-white rounded shadow-sm">
                <h5 style={{ color: '#0F83DA' }}><FaUsers className="me-2" />Utilisateurs récents</h5>
                {filteredUsers.length === 0 ? (
                  <p>Aucun utilisateur disponible.</p>
                ) : (
                  filteredUsers.slice(0, 5).map(user => (
                    <div key={user.id} className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-2">
                      <span>{user.nom} ({getTypeLabel(user.classe)})</span>
                      <ActionButtonGroup
                        onDetails={() => handleShowUserDetails(user)}
                        onEdit={() => handleEditUser(user)}
                        onDelete={() => handleDeleteUserConfirm(user.id)}
                      />
                    </div>
                  ))
                )}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 mt-3">
                  <Link to="/admin/users">
                    <Button variant="primary" className="rounded-pill">Voir tous les utilisateurs</Button>
                  </Link>
                  <Button variant="outline-secondary" size="sm" onClick={handleExportUsers}>
                    <FaFileExport className="me-1" /> Exporter Excel
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
          <Modal show={showDeleteElectionConfirm} onHide={() => setShowDeleteElectionConfirm(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Confirmer la suppression</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p style={{ color: '#DC3545' }}>
                Êtes-vous sûr de vouloir supprimer {elections.find(e => e.id === deleteElectionId)?.nom || 'cette élection'} ?
              </p>
              <p>Cette action ne peut pas être annulée.</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDeleteElectionConfirm(false)}>Annuler</Button>
              <Button variant="danger" onClick={handleDeleteElection}>Supprimer</Button>
            </Modal.Footer>
          </Modal>
          <Modal show={showDeleteUserConfirm} onHide={() => setShowDeleteUserConfirm(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Confirmer la suppression</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p style={{ color: '#DC3545' }}>
                Êtes-vous sûr de vouloir supprimer {users.find(u => u.id === deleteUserId)?.nom || 'cet utilisateur'} ?
              </p>
              <p>Cette action ne peut pas être annulée.</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDeleteUserConfirm(false)}>Annuler</Button>
              <Button variant="danger" onClick={handleDeleteUser}>Supprimer</Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
      <style jsx>{`
        .btn-primary:hover {
          background-color: #005b99 !important;
          color: #fff !important;
        }
        .btn-outline-primary:hover {
          background-color: #0d6efd !important;
          color: #fff !important;
        }
        .btn-outline-secondary:hover {
          background-color: #6c757d !important;
          color: #fff !important;
        }
        .shadow-sm {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        @media (max-width: 768px) {
          h2 {
            font-size: 1.8rem;
          }
          h5 {
            font-size: 1.2rem;
          }
          .fs-4 {
            font-size: 1.5rem !important;
          }
          .btn {
            font-size: 0.9rem;
            padding: 0.5rem 1rem;
          }
          .d-flex.flex-md-row {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .gap-2 {
            gap: 0.5rem !important;
          }
        }
        @media (max-width: 576px) {
          .p-3 {
            padding: 1rem !important;
          }
          .mb-4 {
            margin-bottom: 1rem !important;
          }
        }
      `}</style>
    </MainLayout>
  );
}