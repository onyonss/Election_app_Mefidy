import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import UserSidebar from '../components/UserSidebar';
import SearchBar from '../components/SearchBar';
import NotificationAlert from '../components/NotificationAlert';
import PageHeader from '../components/PageHeader';
import api from '../api';
import moment from 'moment';

export default function UserElectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [elections, setElections] = useState([]);
  const [filteredElections, setFilteredElections] = useState([]);
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const userId = parseInt(localStorage.getItem('user_id'));
        if (!userId) throw new Error('Utilisateur non connecté.');
        const userResponse = await api.get(`/api/users/by-user-id/${userId}/`);
        const userClasse = userResponse.data.classe;
        const response = await api.get('/api/elections/');
        const filteredByClasse = response.data.filter(e => {
          const classeCriteria = e.allowed_voter_criteria?.classe;
          const isAllowed = Array.isArray(classeCriteria) && classeCriteria.length > 0
            ? classeCriteria.includes(String(userClasse))
            : true;
          return isAllowed;
        });
        setElections(filteredByClasse);
        setFilteredElections(filteredByClasse);
        if (filteredByClasse.length === 0) {
          setNotification('Aucune élection disponible pour votre classe.');
          setTimeout(() => setNotification(null), 3000);
        }
      } catch (error) {
        const errorMessage = error.response?.status === 403
          ? 'Accès non autorisé. Veuillez vous reconnecter.'
          : `Erreur: ${error.message || 'Chargement des élections échoué.'}`;
        setNotification(errorMessage);
        if (error.response?.status === 403) {
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setTimeout(() => setNotification(null), 3000);
        }
      }
    };
    fetchElections();
    if (location.state?.notification) {
      setNotification(location.state.notification);
      setTimeout(() => navigate('/elections', { replace: true, state: {} }), 3000);
    }
  }, [location, navigate]);

  useEffect(() => {
    setFilteredElections(
      elections.filter(e => e.nom.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, elections]);

  const isElectionOpen = (election) => {
    const currentDate = new Date();
    return new Date(election.startdate) <= currentDate && new Date(election.enddate) >= currentDate;
  };

  return (
    <MainLayout sidebar={UserSidebar}>
      <SearchBar
        placeholder="Rechercher des élections..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />
      <NotificationAlert
        message={notification}
        variant={notification === 'Vote enregistré avec succès' ? 'success' : 'warning'}
        onClose={() => setNotification(null)}
      />
      <PageHeader title="Élections disponibles" />
      <div className="bg-white p-4 rounded shadow-sm">
        <h5 className="mb-3" style={{ color: '#0F83DA' }}>Liste des élections</h5>
        {filteredElections.length > 0 ? (
          <Table hover style={{ border: 'none' }}>
            <thead>
              <tr>
                <th style={{ border: 'none' }}>Élection</th>
                <th style={{ border: 'none' }}>Date de début</th>
                <th style={{ border: 'none' }}>Date de fin</th>
                <th style={{ border: 'none' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredElections.map((election) => (
                <tr key={election.id} style={{ border: 'none' }}>
                  <td style={{ border: 'none' }}>{election.nom || 'Sans nom'}</td>
                  <td style={{ border: 'none' }}>{election.startdate ? moment(election.startdate).format('DD/MM/YY HH:mm') : 'Non défini'}</td>
                  <td style={{ border: 'none' }}>{election.enddate ? moment(election.enddate).format('DD/MM/YY HH:mm') : 'Non défini'}</td>
                  <td style={{ border: 'none' }}>
                    <Button
                      variant="outline-warning"
                      className="rounded-pill me-2"
                      size="sm"
                      onClick={() => navigate(`/elections/${election.id}/details`)}
                    >
                      Détails
                    </Button>
                    <Button
                      variant="primary"
                      className="rounded-pill me-2"
                      size="sm"
                      onClick={() => navigate(`/elections/${election.id}/vote`)}
                      disabled={!election.can_vote || !isElectionOpen(election)}
                    >
                      Voter
                    </Button>
                    {election.statut === 'ferme' && (
                      <Button
                        variant="outline-success"
                        className="rounded-pill"
                        size="sm"
                        onClick={() => navigate(`/elections/${election.id}/resultats`)}
                      >
                        Voir résultats
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p>Aucune élection disponible pour le moment.</p>
        )}
      </div>
      <style jsx>{`
        .btn-primary:hover:not(:disabled) {
          background-color: #005b99 !important;
          color: #fff !important;
        }
        .btn-outline-warning:hover {
          background-color: #ffc107 !important;
          color: #fff !important;
        }
        .btn-outline-success:hover {
          background-color: #28a745 !important;
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
          .table-responsive {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </MainLayout>
  );
}