import React, { useState, useEffect } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import MainLayout from '../components/MainLayout';
import Sidebar from '../components/Sidebar';
import NotificationAlert from '../components/NotificationAlert';
import PageHeader from '../components/PageHeader';
import api from '../api';
import moment from 'moment';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

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

export default function ElectionResultDetails() {
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
    is_published: false,
  });
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentDate = new Date();

  useEffect(() => {
    const fetchElectionResults = async () => {
      if (!id || isNaN(parseInt(id))) {
        setNotification('ID d’élection invalide.');
        setIsLoading(false);
        setTimeout(() => setNotification(null), 3000);
        return;
      }

      try {
        setIsLoading(true);
        const response = await api.get(`/api/elections/${id}/resultats/`);
        setElection({
          ...response.data.election,
          allowed_voter_criteria: response.data.election.allowed_voter_criteria && typeof response.data.election.allowed_voter_criteria === 'object'
            ? {
                classe: Array.isArray(response.data.election.allowed_voter_criteria.classe) ? response.data.election.allowed_voter_criteria.classe : [],
                mention: Array.isArray(response.data.election.allowed_voter_criteria.mention) ? response.data.election.allowed_voter_criteria.mention : [],
                activite: Array.isArray(response.data.election.allowed_voter_criteria.activite) ? response.data.election.allowed_voter_criteria.activite : [],
                sport_type: Array.isArray(response.data.election.allowed_voter_criteria.sport_type) ? response.data.election.allowed_voter_criteria.sport_type : [],
              }
            : { classe: [], mention: [], activite: [], sport_type: [] },
          total_voters: response.data.total_voters || 0,
          voters_who_voted: response.data.voters_who_voted || 0,
          candidates: Array.isArray(response.data.candidates) ? response.data.candidates : [],
          is_published: response.data.is_published || false,
        });
        if (response.data.candidates.length === 0 && response.data.voters_who_voted === 0) {
          setNotification('Aucune donnée de vote ou de candidat.');
        }
      } catch (error) {
        setNotification('Erreur lors du chargement des résultats.');
        setIsLoading(false);
        setTimeout(() => setNotification(null), 3000);
      } finally {
        setIsLoading(false);
      }
    };
    fetchElectionResults();
  }, [id]);

  const totalVotes = election.candidates.reduce((sum, item) => sum + (item?.vote_count || 0), 0) || 0;
  const totalVoters = election.total_voters || 0;
  const turnoutPercentage = totalVoters > 0 ? ((totalVotes / totalVoters) * 100).toFixed(2) : 0;
  const isTerminated = election.enddate && new Date(election.enddate) < currentDate;
  const maxVotes = Math.max(...(election.candidates.map(c => c?.vote_count || 0) || [0]));
  const winners = election.candidates.filter(c => (c?.vote_count || 0) === maxVotes && maxVotes > 0) || [];

  const getTypeLabel = type => {
    const types = { 1: 'L1', 2: 'L2', 3: 'L3', 4: 'M1', 5: 'M2' };
    return types[type] || 'Inconnu';
  };

  const voteChartData = {
    labels: election.candidates.map(c => c?.nom || 'Inconnu') || [],
    datasets: [{
      label: 'Votes',
      data: election.candidates.map(c => c?.vote_count || 0) || [],
      backgroundColor: '#0F83DA',
      borderColor: '#0F83DA',
      borderWidth: 1,
    }],
  };

  return (
    <ErrorBoundary>
      <MainLayout sidebar={Sidebar}>
        <NotificationAlert
          message={notification}
          variant={notification?.includes('succès') ? 'success' : 'warning'}
          onClose={() => setNotification(null)}
        />
        <PageHeader title={`Résultats: ${election.nom || 'Élection inconnue'}`} />
        {isLoading ? (
          <div>Chargement des résultats...</div>
        ) : !election.id ? (
          <div>Aucune donnée disponible.</div>
        ) : (
          <div className="p-4 mb-4 shadow-sm" style={{ background: 'linear-gradient(135deg, #ffffff, #e8f0fe)', borderRadius: '15px' }}>
            <h5 className="mb-4 fw-bold" style={{ color: '#2c3e50', fontSize: '1.5rem' }}>Détails de l’élection</h5>
            <Row className="mb-4 justify-content-center">
              <Col xs={12} sm={6} md={3} className="mb-3">
                <div className="p-3 text-center stat-card" style={{ backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <h6 style={{ color: '#0F83DA', fontSize: '1.1rem' }}>Total des électeurs</h6>
                  <p className="fs-4 fw-bold mb-0">{totalVoters}</p>
                </div>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <div className="p-3 text-center stat-card" style={{ backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <h6 style={{ color: '#0F83DA', fontSize: '1.1rem' }}>Votants</h6>
                  <p className="fs-4 fw-bold mb-0">{totalVotes}</p>
                </div>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <div className="p-3 text-center stat-card" style={{ backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <h6 style={{ color: '#0F83DA', fontSize: '1.1rem' }}>Taux de participation</h6>
                  <p className="fs-4 fw-bold mb-0">{turnoutPercentage}%</p>
                </div>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <div className="p-3 text-center stat-card" style={{ backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <h6 style={{ color: '#0F83DA', fontSize: '1.1rem' }}>Statut</h6>
                  <p className="fs-4 fw-bold mb-0">{isTerminated ? 'Terminé' : 'En cours'}</p>
                </div>
              </Col>
            </Row>
            <h5 className="mb-4 fw-bold" style={{ color: '#2c3e50', fontSize: '1.5rem' }}>Résultats par candidat</h5>
            {election.candidates.length > 0 ? (
              <>
                <div className="mb-4 chart-container" style={{ height: '350px' }}>
                  <Bar
                    data={voteChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: { beginAtZero: true, title: { display: true, text: 'Nombre de votes', font: { size: 14 } } },
                        x: { title: { display: true, text: 'Candidats', font: { size: 14 } } },
                      },
                      plugins: {
                        legend: { labels: { font: { size: 12 } } },
                        tooltip: { bodyFont: { size: 12 } },
                      },
                    }}
                  />
                </div>
                <div className="p-4 bg-white rounded shadow-sm">
                  <h6 style={{ color: '#0F83DA', fontSize: '1.2rem' }}>Détails des votes</h6>
                  {election.candidates.map((candidate, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center mb-3">
                      <span style={{ fontSize: '1rem' }}>{candidate.nom || 'Inconnu'}</span>
                      <span style={{ fontSize: '1rem' }}>{candidate.vote_count || 0} votes</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p>Aucun résultat disponible pour cette élection pour le moment.</p>
            )}
            {winners.length > 0 && (
              <div className="mt-4 p-4 bg-white rounded shadow-sm">
                <h6 style={{ color: '#0F83DA', fontSize: '1.2rem' }}>Vainqueur(s)</h6>
                {winners.map((winner, index) => (
                  <p key={index} className="mb-0" style={{ fontSize: '1rem' }}>{winner.nom} ({winner.vote_count} votes)</p>
                ))}
              </div>
            )}
            <div className="mt-4">
              <h6 style={{ color: '#0F83DA', fontSize: '1.2rem' }}>Critères requis</h6>
              <div className="d-flex flex-wrap gap-4">
                <div>
                  <strong>Classes:</strong> {election.allowed_voter_criteria.classe.map(getTypeLabel).join(', ') || 'Aucune'}
                </div>
                <div>
                  <strong>Mentions:</strong> {election.allowed_voter_criteria.mention.join(', ') || 'Aucune'}
                </div>
                {election.allowed_voter_criteria.activite.length > 0 && (
                  <div>
                    <strong>Activités:</strong> {election.allowed_voter_criteria.activite.join(', ') || 'Aucune'}
                  </div>
                )}
                {election.allowed_voter_criteria.sport_type.length > 0 && (
                  <div>
                    <strong>Types de sport:</strong> {election.allowed_voter_criteria.sport_type.join(', ') || 'Aucune'}
                  </div>
                )}
              </div>
              <h6 style={{ color: '#0F83DA', fontSize: '1.2rem' }} className="mt-3">Date de début</h6>
              <p style={{ fontSize: '1rem' }}>{election.startdate ? moment(election.startdate).format('DD/MM/YY HH:mm') : 'Non défini'}</p>
              <h6 style={{ color: '#0F83DA', fontSize: '1.2rem' }} className="mt-3">Date de fin</h6>
              <p style={{ fontSize: '1rem' }}>{election.enddate ? moment(election.enddate).format('DD/MM/YY HH:mm') : 'Non défini'}</p>
            </div>
            <Button
              variant="secondary"
              className="mt-4 rounded-pill"
              style={{ fontSize: '1.1rem', padding: '10px 20px' }}
              onClick={() => navigate('/admin/resultats')}
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
          .d-flex.flex-wrap.gap-4 {
            gap: 1.5rem;
          }
          .chart-container {
            padding: 20px;
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          @media (max-width: 768px) {
            h2 {
              font-size: 1.8rem;
            }
            h5 {
              font-size: 1.2rem;
            }
            h6 {
              font-size: 1rem;
            }
            .fs-4 {
              font-size: 1.5rem !important;
            }
            .btn {
              font-size: 0.95rem;
              padding: 0.5rem 1rem;
            }
            .chart-container {
              height: 250px !important;
            }
            .d-flex.flex-wrap.gap-4 {
              flex-direction: column;
              gap: 0.75rem;
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