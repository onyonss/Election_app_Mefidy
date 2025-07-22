import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend, TimeScale } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { FaVoteYea, FaUser, FaClock } from 'react-icons/fa';
import moment from 'moment';
import 'chartjs-adapter-moment';
import MainLayout from '../components/MainLayout';
import UserSidebar from '../components/UserSidebar';
import SearchBar from '../components/SearchBar';
import NotificationAlert from '../components/NotificationAlert';
import PageHeader from '../components/PageHeader';
import api from '../api';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend, TimeScale);

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

export default function UserDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [elections, setElections] = useState([]);
  const [filteredElections, setFilteredElections] = useState([]);
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState(location.state?.notification || null);
  const [countdown, setCountdown] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const userId = parseInt(localStorage.getItem('user_id'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) throw new Error('Utilisateur non connecté.');
        setIsLoading(true);
        const [userResponse, electionResponse] = await Promise.all([
          api.get(`/api/users/by-user-id/${userId}/`),
          api.get('/api/elections/')
        ]);
        setUser(userResponse.data);
        const userClasse = String(userResponse.data.classe);
        const filteredElections = electionResponse.data.filter(e => {
          const classeCriteria = e.allowed_voter_criteria && typeof e.allowed_voter_criteria === 'object' ? e.allowed_voter_criteria.classe : null;
          const isAllowed = Array.isArray(classeCriteria) && classeCriteria.length > 0
            ? classeCriteria.includes(userClasse)
            : true;
          const isValid = moment(e.startdate).isValid() && moment(e.enddate).isValid() && moment(e.enddate).isAfter(moment(e.startdate));
          return isAllowed && isValid;
        });
        filteredElections.sort((a, b) => {
          const aIsClosed = a.statut === 'ferme' ? 1 : 0;
          const bIsClosed = b.statut === 'ferme' ? 1 : 0;
          if (aIsClosed !== bIsClosed) {
            return aIsClosed - bIsClosed;
          }
          return new Date(b.startdate) - new Date(a.startdate);
        });
        setElections(filteredElections);
        setFilteredElections(filteredElections);
        if (filteredElections.length === 0) {
          setNotification('Aucune élection disponible pour votre classe.');
        }
      } catch (error) {
        const errorMessage = error.response?.status === 500
          ? 'Erreur serveur. Veuillez réessayer plus tard.'
          : error.response?.status === 401 || error.response?.status === 403
          ? 'Session invalide. Veuillez vous reconnecter.'
          : `Erreur: ${error.message || 'Chargement des données échoué.'}`;
        setNotification(errorMessage);
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.clear();
          setTimeout(() => navigate('/login'), 3000);
        }
      } finally {
        setIsLoading(false);
        setTimeout(() => setNotification(null), 3000);
      }
    };
    fetchData();
  }, [userId, navigate, location]);

  useEffect(() => {
    const upcomingElection = elections.find(e => moment(e.startdate).isAfter(moment()));
    if (upcomingElection) {
      const interval = setInterval(() => {
        const start = moment(upcomingElection.startdate);
        const now = moment();
        const duration = moment.duration(start.diff(now));
        setCountdown(`${duration.days()}j ${duration.hours()}h ${duration.minutes()}min ${duration.seconds()}s`);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCountdown('');
    }
  }, [elections]);

  useEffect(() => {
    setFilteredElections(
      elections.filter(e => e.nom?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, elections]);

  const getClasseLabel = (classe) => {
    const classes = { 1: 'L1', 2: 'L2', 3: 'L3', 4: 'M1', 5: 'M2' };
    return classes[classe] || 'Inconnue';
  };

  const isElectionOpen = (election) => {
    if (!election.startdate || !election.enddate) return false;
    const currentDate = moment();
    const startDate = moment(election.startdate);
    const endDate = moment(election.enddate);
    const isOpen = startDate.isValid() && endDate.isValid() && currentDate.isBetween(startDate, endDate, null, '[]');
    return isOpen;
  };

  const doughnutChartData = {
    labels: ['Voté', 'Non voté'],
    datasets: [{
      data: [
        elections.filter(e => e.can_vote === false || (Array.isArray(e.voters_who_voted) && e.voters_who_voted.includes(userId))).length,
        elections.filter(e => e.can_vote === true && (!Array.isArray(e.voters_who_voted) || !e.voters_who_voted.includes(userId))).length,
      ],
      backgroundColor: ['#28a745', '#dc3545'],
    }],
  };

  const timelineChartData = {
    labels: elections.map(e => e.nom),
    datasets: [{
      label: 'Durée',
      data: elections.map(e => ({
        x: [moment(e.startdate).toDate(), moment(e.enddate).toDate()],
        y: e.nom,
      })),
      backgroundColor: '#0d6efd',
    }],
  };

  const formatDuration = (start, end) => {
    const duration = moment.duration(moment(end).diff(moment(start)));
    const days = Math.floor(duration.asDays());
    if (days > 0) {
      return `${days} jour${days > 1 ? 's' : ''}`;
    }
    return `${duration.hours()}h ${duration.minutes()}min`;
  };

  return (
    <ErrorBoundary>
      <MainLayout sidebar={UserSidebar}>
        <NotificationAlert
          message={notification}
          variant={notification?.includes('succès') ? 'success' : 'warning'}
          onClose={() => setNotification(null)}
        />
        <SearchBar
          placeholder="Rechercher élections..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <PageHeader title={`Bienvenue, ${user?.username || 'Chargement...'}`} icon={FaUser} />
        {isLoading ? (
          <div className="text-center p-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Chargement...</span>
            </Spinner>
            <p className="mt-2">Chargement des données...</p>
          </div>
        ) : (
          <>
            {searchQuery ? (
              <div className="p-3 bg-white rounded shadow-sm">
                <h5 className="mb-3" style={{ color: '#0F83DA' }}>Résultats de la recherche</h5>
                {filteredElections.length === 0 ? (
                  <p>Aucune élection trouvée.</p>
                ) : (
                  filteredElections.map(election => (
                    <div key={election.id} className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-2">
                      <span>{election.nom} ({moment(election.startdate).format('DD/MM/YY HH:mm')} - {moment(election.enddate).format('DD/MM/YY HH:mm')})</span>
                      <div className="d-flex flex-wrap gap-2 mt-2 mt-md-0">
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => navigate(`/elections/${election.id}/details`)}
                        >
                          Détails
                        </Button>
                        {isElectionOpen(election) && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate(`/elections/${election.id}/vote`)}
                            disabled={election.can_vote === false || (Array.isArray(election.voters_who_voted) && election.voters_who_voted.includes(userId))}
                          >
                            Voter
                          </Button>
                        )}
                        {election.statut === 'ferme' && (
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => navigate(`/elections/${election.id}/resultats`)}
                          >
                            Voir résultats
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <>
                <Row className="mb-4">
                  <Col xs={12} md={6} className="mb-4 mb-md-0">
                    <div className="p-3 bg-white rounded shadow-sm">
                      <h5 style={{ color: '#0F83DA' }}>Participation aux élections</h5>
                      <div style={{ height: '200px' }}>
                        <Doughnut data={doughnutChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="p-3 bg-white rounded shadow-sm">
                      <h5 style={{ color: '#0F83DA' }}><FaUser className="me-2" />Informations utilisateur</h5>
                      <p><strong>Matricule:</strong> {user?.matricule || 'Non défini'}</p>
                      <p><strong>Prénom:</strong> {user?.username || 'Non défini'}</p>
                      <p><strong>Nom:</strong> {user?.nom || 'Non défini'}</p>
                      <p><strong>Classe:</strong> {getClasseLabel(user?.classe)}</p>
                      <p><strong>Mention:</strong> {user?.mention || 'Non défini'}</p>
                      <p><strong>Année universitaire:</strong> {user?.annee_universitaire || 'Non défini'}</p>
                    </div>
                  </Col>
                </Row>
                <Row className="mb-4">
                  <Col xs={12}>
                    <div className="p-3 bg-white rounded shadow-sm">
                      <h5 style={{ color: '#0F83DA' }}>Calendrier des élections</h5>
                      <div style={{ height: '300px' }}>
                        <Bar
                          data={timelineChartData}
                          options={{
                            indexAxis: 'y',
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              x: {
                                type: 'time',
                                time: { unit: 'day', displayFormats: { day: 'DD/MM/YY' } },
                                min: moment().startOf('month').toDate(),
                                max: moment().endOf('month').toDate(),
                              },
                            },
                            plugins: {
                              tooltip: {
                                callbacks: {
                                  label: (context) => {
                                    const election = elections[context.dataIndex];
                                    return `Durée: ${formatDuration(election.startdate, election.enddate)}`;
                                  },
                                },
                              },
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
                      <h5 style={{ color: '#0F83DA' }}><FaVoteYea className="me-2" />Élections disponibles</h5>
                      {filteredElections.length > 0 ? (
                        filteredElections.map(election => (
                          <div key={election.id} className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-2">
                            <span>{election.nom} ({moment(election.startdate).format('DD/MM/YY HH:mm')} - {moment(election.enddate).format('DD/MM/YY HH:mm')})</span>
                            <div className="d-flex flex-wrap gap-2 mt-2 mt-md-0">
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => navigate(`/elections/${election.id}/details`)}
                              >
                                Détails
                              </Button>
                              {isElectionOpen(election) && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => navigate(`/elections/${election.id}/vote`)}
                                  disabled={election.can_vote === false || (Array.isArray(election.voters_who_voted) && election.voters_who_voted.includes(userId))}
                                >
                                  Voter
                                </Button>
                              )}
                              {election.statut === 'ferme' && (
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => navigate(`/elections/${election.id}/resultats`)}
                                >
                                  Voir résultats
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p>Aucune élection disponible.</p>
                      )}
                      <Button variant="primary" className="rounded-pill mt-3" onClick={() => navigate('/elections')}>
                        Voir toutes les élections
                      </Button>
                    </div>
                  </Col>
                </Row>
                <Row className="mb-4">
                  <Col xs={12}>
                    <div className="p-3 bg-white rounded shadow-sm">
                      <h5 style={{ color: '#0F83DA' }}><FaClock className="me-2" />Prochaine élection</h5>
                      {elections.find(e => moment(e.startdate).isAfter(moment())) ? (
                        <div>
                          <p><strong>{elections.find(e => moment(e.startdate).isAfter(moment())).nom}</strong></p>
                          <p>Compte à rebours: {countdown}</p>
                        </div>
                      ) : (
                        <p>Aucune élection à venir.</p>
                      )}
                    </div>
                  </Col>
                </Row>
              </>
            )}
          </>
        )}
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
            h5 {
              font-size: 1rem;
            }
            .fs-4 {
              font-size: 1.5rem !important;
            }
            .btn {
              font-size: 0.9rem;
              padding: 0.5rem 1rem;
            }
            .progress-bar {
              font-size: 0.9rem;
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