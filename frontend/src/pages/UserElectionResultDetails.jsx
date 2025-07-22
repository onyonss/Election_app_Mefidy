import React, { useState, useEffect } from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import MainLayout from '../components/MainLayout';
import UserSidebar from '../components/UserSidebar';
import NotificationAlert from '../components/NotificationAlert';
import PageHeader from '../components/PageHeader';
import api from '../api';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

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

export default function UserElectionResultDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [election, setElection] = useState({
    id: null,
    nom: '',
    startdate: null,
    enddate: null,
    statut: '',
    listeCandidats: { candidats: [] },
    allowed_voter_criteria: { classe: [], mention: [], activite: [], sport_type: [] },
    total_voters: 0,
    voters_who_voted: 0,
    candidates: [],
  });
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const userId = parseInt(localStorage.getItem('user_id'));

  useEffect(() => {
    const fetchElectionResults = async () => {
      try {
        if (!userId) throw new Error('Utilisateur non connecté.');
        setIsLoading(true);
        const userResponse = await api.get(`/api/users/by-user-id/${userId}/`);
        console.log('User Data:', userResponse.data);
        const userData = userResponse.data;

        // Fetch election results
        const response = await api.get(`/api/elections/${id}/resultats/`);
        const electionData = response.data.election;
        console.log('Election Result Data:', electionData);

        // Validate voter eligibility
        const classeCriteria = electionData.allowed_voter_criteria && typeof electionData.allowed_voter_criteria === 'object'
          ? electionData.allowed_voter_criteria.classe
          : null;
        const isAllowed = Array.isArray(classeCriteria) && classeCriteria.length > 0
          ? classeCriteria.includes(String(userData.classe))
          : true;
        console.log(`Election ${electionData.nom} (id=${id}) classeCriteria=${JSON.stringify(classeCriteria)}, isAllowed=${isAllowed}`);

        if (!isAllowed) {
          throw new Error('Vous n’êtes pas autorisé à voir ces résultats.');
        }

        setElection({
          ...electionData,
          total_voters: response.data.total_voters || 0,
          voters_who_voted: response.data.voters_who_voted || 0,
          candidates: response.data.candidates || [],
        });
      } catch (error) {
        console.error('Fetch Results Error:', error.response?.data || error.message);
        try {
          // Fallback to basic election data
          const basicResponse = await api.get(`/api/elections/${id}/`);
          const basicElectionData = basicResponse.data;
          console.log('Basic Election Data:', basicElectionData);

          const classeCriteria = basicElectionData.allowed_voter_criteria && typeof basicElectionData.allowed_voter_criteria === 'object'
            ? basicElectionData.allowed_voter_criteria.classe
            : null;
          const isAllowed = Array.isArray(classeCriteria) && classeCriteria.length > 0
            ? classeCriteria.includes(String(userData.classe))
            : true;

          if (!isAllowed) {
            throw new Error('Vous n’êtes pas autorisé à voir cette élection.');
          }

          setElection({
            ...basicElectionData,
            total_voters: basicElectionData.total_voters || 0,
            voters_who_voted: 0,
            candidates: [],
          });
          setNotification('Les résultats ne sont pas encore publiés.');
        } catch (basicError) {
          console.error('Basic Fetch Error:', basicError.response?.data || basicError.message);
          setNotification('Erreur lors du chargement des détails de l’élection.');
        }
      } finally {
        setIsLoading(false);
        setTimeout(() => setNotification(null), 3000);
      }
    };
    fetchElectionResults();
  }, [id, userId, navigate]);

  const totalVotes = election.candidates.reduce((sum, candidate) => sum + (candidate.vote_count || 0), 0);
  const totalVoters = election.total_voters || 0;
  const turnoutPercentage = totalVoters > 0 ? ((totalVotes / totalVoters) * 100).toFixed(2) : 0;
  const isTerminated = election.enddate && new Date(election.enddate) < new Date();
  const maxVotes = Math.max(...election.candidates.map((c) => c.vote_count || 0), 0);
  const winners = election.candidates.filter((c) => c.vote_count === maxVotes && maxVotes > 0);

  const getTypeLabel = (classe) => {
    const classes = { 1: 'L1', 2: 'L2', 3: 'L3', 4: 'M1', 5: 'M2' };
    return classes[classe] || 'Inconnu';
  };

  const voteChartData = {
    labels: election.candidates.map(c => c.nom || 'Inconnu'),
    datasets: [{
      label: 'Nombre de votes',
      data: election.candidates.map(c => c.vote_count || 0),
      backgroundColor: '#0d6efd',
      borderColor: '#0d6efd',
      borderWidth: 1,
    }],
  };

  return (
    <ErrorBoundary>
      <MainLayout sidebar={UserSidebar}>
        <NotificationAlert message={notification} onClose={() => setNotification(null)} />
        <PageHeader title={`Résultats: ${election.nom || 'Élection inconnue'}`} />
        {isLoading ? (
          <div>Chargement des résultats...</div>
        ) : !election.id ? (
          <div>Aucune donnée disponible.</div>
        ) : (
          <div className="p-3 mb-4 shadow-sm" style={{ background: 'linear-gradient(135deg, #ffffff, #e8f0fe)', borderRadius: '15px' }}>
            <h5 className="mb-4 fw-bold" style={{ color: '#2c3e50' }}>Détails de l’élection</h5>
            <Row className="mb-4 justify-content-center">
              <Col xs={12} sm={6} md={3} className="mb-3">
                <div className="p-3 text-center stat-card" style={{ backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>

                  <h6 style={{ color: '#0F83DA' }}>Électeurs inscrits</h6>
                  <p className="fs-4 fw-bold mb-0">{totalVoters}</p>
                </div>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <div className="p-3 text-center stat-card" style={{ backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <h6 style={{ color: '#0F83DA' }}>Nombre de votes</h6>
                  <p className="fs-4 fw-bold mb-0">{totalVotes}</p>
                </div>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <div className="p-3 text-center stat-card" style={{ backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <h6 style={{ color: '#0F83DA' }}>Taux de participation</h6>
                  <p className="fs-4 fw-bold mb-0">{turnoutPercentage}%</p>
                </div>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <div className="p-3 text-center stat-card" style={{ backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <h6 style={{ color: '#0F83DA' }}>Statut</h6>
                  <p className="fs-4 fw-bold mb-0">{isTerminated ? 'Terminé' : 'En cours'}</p>
                </div>
              </Col>
            </Row>
            <h5 className="mb-4 fw-bold" style={{ color: '#2c3e50' }}>Résultats des votes</h5>
            {election.candidates.length > 0 ? (
              <>
                <div className="mb-4 chart-container" style={{ height: '300px' }}>
                  <Bar
                    data={voteChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: { beginAtZero: true, title: { display: true, text: 'Nombre de votes' } },
                        x: { title: { display: true, text: 'Candidats' } },
                      },
                    }}
                  />
                </div>
                <div className="p-3 bg-white rounded shadow-sm">
                  <h6 style={{ color: '#0F83DA' }}>Détails des votes</h6>
                  {election.candidates.map((candidate, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                      <span>{candidate.nom || 'Inconnu'}</span>
                      <span>{candidate.vote_count || 0} votes</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p>Aucun vote enregistré pour cette élection.</p>
            )}
            {winners.length > 0 && (
              <div className="mt-4 p-3 bg-white rounded shadow-sm">
                <h6 style={{ color: '#0F83DA' }}>Vainqueur(s)</h6>
                {winners.map((winner, index) => (
                  <p key={index} className="mb-0">{winner.nom} ({winner.vote_count} votes)</p>
                ))}
              </div>
            )}
            <div className="mt-4">
              <h6 style={{ color: '#0F83DA' }}>Classes autorisées</h6>
              <p>{election.allowed_voter_criteria?.classe?.map(getTypeLabel).join(', ') || 'Aucune'}</p>
              <h6 style={{ color: '#0F83DA' }}>Date de début</h6>
              <p>{election.startdate ? new Date(election.startdate).toLocaleString('fr-FR') : 'Non défini'}</p>
              <h6 style={{ color: '#0F83DA' }}>Date de fin</h6>
              <p>{election.enddate ? new Date(election.enddate).toLocaleString('fr-FR') : 'Non défini'}</p>
            </div>
            <Button
              variant="secondary"
              className="mt-3"
              onClick={() => navigate('/user/resultats')}
            >
              Retour
            </Button>
          </div>
        )}
        <style jsx>{`
          .stat-card {
            transition: transform 0.2s;
          }
          .stat-card:hover {
            transform: translateY(-5px);
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
            .chart-container {
              height: 200px !important;
            }
          }
          @media (max-width: 576px) {
            .stat-card {
              min-width: 100% !important;
            }
            .mb-4 {
              margin-bottom: 1rem !important;
            }
          }
        `}</style>
      </MainLayout>
    </ErrorBoundary>
  );
}