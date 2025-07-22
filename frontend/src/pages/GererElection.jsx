import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Modal, Table } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaFileExport, FaVoteYea } from 'react-icons/fa';
import moment from 'moment';
import MainLayout from '../components/MainLayout';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import NotificationAlert from '../components/NotificationAlert';
import PageHeader from '../components/PageHeader';
import ActionButtonGroup from '../components/ActionButtonGroup';
import api from '../api';

export default function GererElection() {
  const navigate = useNavigate();
  const location = useLocation();
  const [elections, setElections] = useState([]);
  const [filteredElections, setFilteredElections] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteElectionId, setDeleteElectionId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await api.get('/api/elections/');
        const electionData = Array.isArray(response.data) ? response.data : [];
        electionData.sort((a, b) => new Date(b.startdate) - new Date(a.startdate));
        setElections(electionData);
        setFilteredElections(electionData);
      } catch (error) {
        setNotification('Erreur de chargement des élections.');
        setTimeout(() => setNotification(null), 3000);
      }
    };
    fetchElections();
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
  }, [searchQuery, elections]);

  const handleEdit = (election) => navigate(`/admin/gererelections/${election.id}/edit`);
  const handleShowDetails = (election) => navigate(`/admin/gererelections/${election.id}/details`);
  const handleDeleteConfirm = (id) => {
    setDeleteElectionId(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/elections/${deleteElectionId}/`);
      setElections(elections.filter(e => e.id !== deleteElectionId));
      setFilteredElections(filteredElections.filter(e => e.id !== deleteElectionId));
      setShowDeleteConfirm(false);
      setNotification('Élection supprimée avec succès !');
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification('Erreur lors de la suppression de l’élection.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const getClasseLabel = (classe) => {
    const classes = { 1: 'L1', 2: 'L2', 3: 'L3', 4: 'M1', 5: 'M2' };
    return classes[classe] || 'Inconnu';
  };

  const getMentionLabel = (mention) => {
    const mentions = {
      INFO: 'Informatique',
      SA: 'Sciences Agronomiques',
      ECO: 'Économie et Commerce',
      LEA: 'Langues Étrangères Appliquées',
      ST: 'Sciences de la Terre',
      DROIT: 'Droit',
    };
    return mentions[mention] || 'Inconnu';
  };

  const getActiviteLabel = (activite) => {
    const activites = {
      DANSE: 'Danse',
      SPORT: 'Sport',
      CHANT: 'Chant',
      DESSIN: 'Dessin',
      SLAM: 'Slam',
    };
    return activites[activite] || 'Inconnu';
  };

  const getSportTypeLabel = (sport_type) => {
    const sports = {
      FOOT: 'Football',
      BASKET: 'Basketball',
      VOLLEY: 'Volleyball',
      PET: 'Pétanque',
    };
    return sports[sport_type] || 'Aucun';
  };

  const exportToExcel = async () => {
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

  return (
    <MainLayout sidebar={Sidebar}>
      <SearchBar
        placeholder="Rechercher élections..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />
      <NotificationAlert message={notification} onClose={() => setNotification(null)} />
      <PageHeader title="Gérer les élections" icon={FaVoteYea} />
      <div className="bg-white p-4 rounded shadow-sm">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3 gap-2">
          <div className="d-flex flex-column flex-md-row gap-2">
            <Link to="/admin/gererelections/create">
              <Button
                variant="primary"
                className="rounded-pill py-2"
                style={{ backgroundColor: '#0F83DA', borderColor: '#0F83DA', fontSize: '1rem' }}
              >
                Ajouter une élection
              </Button>
            </Link>
            <Link to="/admin/listecandidats/create">
              <Button
                variant="primary"
                className="rounded-pill py-2"
                style={{ backgroundColor: '#0F83DA', borderColor: '#0F83DA', fontSize: '1rem' }}
              >
                Créer une liste de candidats
              </Button>
            </Link>
          </div>
          <Button variant="outline-secondary" size="sm" onClick={exportToExcel}>
            <FaFileExport className="me-1" /> Exporter Excel
          </Button>
        </div>
        <h5 className="mb-3" style={{ color: '#0F83DA' }}>Élections disponibles</h5>
        {filteredElections.length === 0 ? (
          <p>Aucune élection trouvée.</p>
        ) : (
          <Table hover style={{ border: 'none' }}>
            <thead>
              <tr>
                <th style={{ border: 'none' }}>Nom</th>
                <th style={{ border: 'none' }}>Date de début</th>
                <th style={{ border: 'none' }}>Date de fin</th>
                <th style={{ border: 'none' }}>Statut</th>
                <th style={{ border: 'none' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredElections.map(election => (
                <tr key={election.id} style={{ border: 'none' }}>
                  <td style={{ border: 'none' }}>{election.nom}</td>
                  <td style={{ border: 'none' }}>{moment(election.startdate).format('DD/MM/YYYY HH:mm')}</td>
                  <td style={{ border: 'none' }}>{moment(election.enddate).format('DD/MM/YYYY HH:mm')}</td>
                  <td style={{ border: 'none' }}>{election.statut}</td>
                  <td style={{ border: 'none' }}>
                    <Button
                      variant="outline-primary"
                      className="rounded-pill me-2"
                      size="sm"
                      onClick={() => handleShowDetails(election)}
                    >
                      Détails
                    </Button>
                    <Button
                      variant="outline-warning"
                      className="rounded-pill me-2"
                      size="sm"
                      onClick={() => handleEdit(election)}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="outline-danger"
                      className="rounded-pill"
                      size="sm"
                      onClick={() => handleDeleteConfirm(election.id)}
                    >
                      Supprimer
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
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
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Annuler</Button>
          <Button variant="danger" onClick={handleDelete}>Supprimer</Button>
        </Modal.Footer>
      </Modal>
      <style jsx>{`
        .btn-primary:hover {
          background-color: #fff !important;
          color: #0F83DA !important;
          border-color: #0F83DA !important;
        }
        .btn-outline-secondary:hover {
          background-color: #6c757d !important;
          color: #fff !important;
        }
        @media (max-width: 768px) {
          h2 {
            font-size: 1.8rem;
          }
          .btn {
            font-size: 0.9rem;
            padding: 0.5rem 1rem;
          }
        }
        @media (max-width: 576px) {
          .d-flex {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .gap-2 {
            gap: 0.5rem !important;
          }
        }
      `}</style>
    </MainLayout>
  );
}