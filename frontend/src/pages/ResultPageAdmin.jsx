import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import NotificationAlert from '../components/NotificationAlert';
import PageHeader from '../components/PageHeader';
import api from '../api';
import { FaPoll } from 'react-icons/fa';

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

export default function ResultPageAdmin() {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [filteredElections, setFilteredElections] = useState([]);
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/api/elections/');
        const electionData = Array.isArray(response.data) ? response.data : [];
        console.log('Raw Elections Response:', electionData);
        setElections(electionData);
        setFilteredElections(electionData);
        if (electionData.length === 0) {
          setNotification('Aucune élection disponible.');
        }
      } catch (error) {
        console.error('Fetch Error:', error.response?.data || error.message);
        setNotification('Erreur lors du chargement des élections.');
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.clear();
          setTimeout(() => navigate('/login'), 3000);
        }
      } finally {
        setIsLoading(false);
        setTimeout(() => setNotification(null), 3000);
      }
    };
    fetchElections();
  }, [navigate]);

  useEffect(() => {
    setFilteredElections(
      elections.filter(e => e.nom?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, elections]);

  const publishResult = async (id) => {
    try {
      await api.post(`/api/elections/${id}/publier/`);
      setNotification('Résultats publiés avec succès !');
      const response = await api.get('/api/elections/');
      const electionData = Array.isArray(response.data) ? response.data : [];
      setElections(electionData);
      setFilteredElections(electionData);
    } catch (error) {
      console.error('Publish Error:', error.response?.data || error.message);
      setNotification('Erreur lors de la publication des résultats.');
    } finally {
      setTimeout(() => setNotification(null), 3000);
    }
  };

const isPublishable = (endDate, statut) => {
  if (!endDate || statut === 'ferme') return false;
  const parsedEndDate = new Date(endDate);
  const now = new Date();
  return parsedEndDate < now && !isNaN(parsedEndDate.getTime());
};

  return (
    <ErrorBoundary>
      <MainLayout sidebar={Sidebar}>
        <SearchBar
          placeholder="Rechercher élections..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <NotificationAlert
          message={notification}
          variant={notification?.includes('succès') ? 'success' : 'warning'}
          onClose={() => setNotification(null)}
        />
        <PageHeader title="Gérer les résultats" icon={FaPoll} />
        {isLoading ? (
          <div>Chargement des élections...</div>
        ) : (
          <div className="bg-white p-4 rounded shadow-sm">
            <h5 className="mb-3" style={{ color: '#0F83DA' }}>Élections disponibles</h5>
            {filteredElections.length === 0 ? (
              <p>Aucune élection disponible.</p>
            ) : (
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
                  {filteredElections.map(election => (
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
                          onClick={() => navigate(`/admin/results/${election.id}/details`)}
                        >
                          Détails
                        </Button>
                        <Button
                          variant={election.statut === 'ferme' ? 'success' : isPublishable(election.enddate, election.statut) ? 'success' : 'secondary'}
                          className="rounded-pill"
                          size="sm"
                          onClick={() => publishResult(election.id)}
                          disabled={election.statut === 'ferme' || !isPublishable(election.enddate, election.statut)}
                        >
                          {election.statut === 'ferme' ? 'Publié' : 'Publier résultat'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        )}
        <style jsx>{`
          .btn-primary:hover {
            background-color: #fff !important;
            color: #0F83DA !important;
            border-color: #0F83DA !important;
          }
          .btn-outline-primary:hover {
            background-color: #0F83DA !important;
            color: #fff !important;
          }
          .btn-success:hover {
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
    </ErrorBoundary>
  );
}