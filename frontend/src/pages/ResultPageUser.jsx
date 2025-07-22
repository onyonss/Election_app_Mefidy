import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import UserSidebar from '../components/UserSidebar';
import SearchBar from '../components/SearchBar';
import NotificationAlert from '../components/NotificationAlert';
import PageHeader from '../components/PageHeader';
import api from '../api';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <div>Une erreur s'est produite : {this.state.error.message}</div>;
    }
    return this.props.children;
  }
}

export default function ResultPageUser() {
  const navigate = useNavigate();
  const location = useLocation();
  const [elections, setElections] = useState([]);
  const [filteredElections, setFilteredElections] = useState([]);
  const [notification, setNotification] = useState(location.state?.notification || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const userId = parseInt(localStorage.getItem('user_id'));

  useEffect(() => {
    const fetchElections = async () => {
      try {
        if (!userId) throw new Error('Utilisateur non connecté.');
        setIsLoading(true);
        const userResponse = await api.get(`/api/users/by-user-id/${userId}/`);
        console.log('User Response:', userResponse.data);
        const userClasse = userResponse.data.classe;
        console.log('userClasse:', userClasse, typeof userClasse);
        const response = await api.get('/api/elections/');
        console.log('Raw Elections Response:', response.data);
        const filteredByClasse = response.data.filter(e => {
          const classeCriteria = e.allowed_voter_criteria && typeof e.allowed_voter_criteria === 'object'
            ? e.allowed_voter_criteria.classe
            : null;
          const isAllowed = Array.isArray(classeCriteria) && classeCriteria.length > 0
            ? classeCriteria.includes(String(userClasse))
            : true;
          console.log(`Election ${e.nom} (id=${e.id}) classeCriteria=${JSON.stringify(classeCriteria)}, isAllowed=${isAllowed}`);
          return isAllowed;
        });
        console.log('Filtered Elections:', filteredByClasse);
        setElections(filteredByClasse);
        setFilteredElections(filteredByClasse);
        if (filteredByClasse.length === 0) {
          setNotification('Aucune élection disponible pour votre classe.');
        }
      } catch (error) {
        console.error('Fetch Error:', error.response?.data || error.message);
        const errorMessage = error.response?.status === 403
          ? 'Accès non autorisé. Veuillez vous reconnecter.'
          : `Erreur: ${error.message || 'Chargement des élections échoué.'}`;
        setNotification(errorMessage);
        if (error.response?.status === 403 || error.response?.status === 401) {
          localStorage.clear();
          setTimeout(() => navigate('/login'), 3000);
        }
      } finally {
        setIsLoading(false);
        setTimeout(() => setNotification(null), 3000);
      }
    };
    fetchElections();
    if (location.state?.notification) {
      setNotification(location.state.notification);
      setTimeout(() => navigate('/resultats', { replace: true, state: {} }), 3000);
    }
  }, [location, navigate, userId]);

  useEffect(() => {
    setFilteredElections(
      elections.filter(e => e.nom?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, elections]);

  return (
    <ErrorBoundary>
      <MainLayout sidebar={UserSidebar}>
        <SearchBar
          placeholder="Rechercher des élections..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <NotificationAlert
          message={notification}
          variant={notification?.includes('succès') ? 'success' : 'warning'}
          onClose={() => setNotification(null)}
        />
        <PageHeader title="Résultats des élections" />
        {isLoading ? (
          <div>Chargement des élections...</div>
        ) : (
          <div className="bg-white p-4 rounded shadow-sm">
            <h5 className="mb-3" style={{ color: '#0F83DA' }}>Élections disponibles</h5>
            {filteredElections.length > 0 ? (
              <Table hover style={{ border: 'none' }}>
                <thead>
                  <tr>
                    <th style={{ border: 'none' }}>Nom de l’élection</th>
                    <th style={{ border: 'none' }}>Date de fin</th>
                    <th style={{ border: 'none' }}>Statut</th>
                    <th style={{ border: 'none' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredElections.map((election) => (
                    <tr key={election.id} style={{ border: 'none' }}>
                      <td style={{ border: 'none' }}>{election.nom || 'Sans nom'}</td>
                      <td style={{ border: 'none' }}>
                        {election.enddate ? new Date(election.enddate).toLocaleString('fr-FR') : 'Non défini'}
                      </td>
                      <td style={{ border: 'none' }}>{election.statut}</td>
                      <td style={{ border: 'none' }}>
                        <Button
                          variant="outline-primary"
                          className="rounded-pill me-2"
                          size="sm"
                          onClick={() => navigate(`/elections/${election.id}/details`)}
                        >
                          Détails
                        </Button>
                        <Button
                          variant="outline-success"
                          className="rounded-pill"
                          size="sm"
                          onClick={() => navigate(`/elections/${election.id}/resultats`)}
                          disabled={election.statut !== 'ferme'}
                        >
                          Voir résultats
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p>Aucune élection disponible pour le moment.</p>
            )}
          </div>
        )}
        <style jsx>{`
          .btn-outline-primary:hover {
            background-color: #0F83DA !important;
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
    </ErrorBoundary>
  );
}