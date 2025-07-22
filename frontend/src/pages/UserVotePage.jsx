import React, { useState, useEffect } from 'react';
import { Form, Button, Modal, Row, Col, Card, Badge, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import UserSidebar from '../components/UserSidebar';
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

export default function UserVotePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [election, setElection] = useState({ nom: '', listeCandidats: { candidats: [] }, allowed_voter_criteria: { classe: [], mention: [], activite: [], sport_type: [] }, can_vote: false });
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [notification, setNotification] = useState(null);
  const [show, setShow] = useState(false);
  const [isFingerprintValid, setIsFingerprintValid] = useState(false);
  const [fingerprintError, setFingerprintError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userId = parseInt(localStorage.getItem('user_id'));

  useEffect(() => {
    const fetchElection = async () => {
      try {
        if (!localStorage.getItem('access_token')) throw new Error('Veuillez vous connecter.');
        const [userResponse, electionResponse] = await Promise.all([
          api.get(`/api/users/by-user-id/${userId}/`),
          api.get(`/api/elections/${id}/`)
        ]);
        const userData = userResponse.data;
        const electionData = electionResponse.data;

        const classeCriteria = electionData.allowed_voter_criteria?.classe;
        const mentionCriteria = electionData.allowed_voter_criteria?.mention;
        const activiteCriteria = electionData.allowed_voter_criteria?.activite;
        const sportTypeCriteria = electionData.allowed_voter_criteria?.sport_type;

        const classeAllowed = Array.isArray(classeCriteria) && classeCriteria.length > 0
          ? classeCriteria.includes(String(userData.classe))
          : true;
        const mentionAllowed = Array.isArray(mentionCriteria) && mentionCriteria.length > 0
          ? mentionCriteria.includes(userData.mention)
          : true;
        const activiteAllowed = Array.isArray(activiteCriteria) && activiteCriteria.length > 0
          ? userData.activites.some(activite => activiteCriteria.includes(activite.nom))
          : true;
        const sportTypeAllowed = Array.isArray(sportTypeCriteria) && sportTypeCriteria.length > 0
          ? activiteAllowed && userData.activites.some(a => a.nom === 'SPORT') ? sportTypeCriteria.includes(userData.sport_type) : true
          : true;

        if (!classeAllowed || !mentionAllowed || !activiteAllowed || !sportTypeAllowed) {
          throw new Error('Vous n’êtes pas autorisé à voter dans cette élection.');
        }

        if (!electionData.can_vote) {
          throw new Error('Vous ne pouvez pas voter (déjà voté ou élection fermée).');
        }

        if (!electionData.listeCandidats?.candidats?.length) {
          throw new Error('Aucun candidat n’est disponible pour cette élection.');
        }

        setElection(electionData);
      } catch (error) {
        const errorMessage = error.response?.status === 401 || error.response?.status === 403
          ? 'Session invalide. Veuillez vous reconnecter.'
          : error.message || 'Erreur lors du chargement de l’élection.';
        setNotification(errorMessage);
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.clear();
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setTimeout(() => navigate('/elections'), 3000);
        }
      }
    };
    fetchElection();
  }, [id, navigate, userId]);

  const verifyFingerprint = async () => {
    setIsVerifying(true);
    try {
      const response = await api.post('/api/fingerprint/verify/', {});
      console.log('Fingerprint verification response:', response.data);
      if (response.data.message === 'Fingerprint verified') {
        setIsFingerprintValid(true);
        setFingerprintError('');
      } else {
        setFingerprintError('Empreinte digitale non valide.');
        setIsFingerprintValid(false);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Échec de la vérification de l’empreinte.';
      setFingerprintError(errorMsg);
      setIsFingerprintValid(false);
      console.error('Fingerprint verification error:', errorMsg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVoteSubmit = async () => {
    if (!selectedCandidate) {
      setNotification('Veuillez sélectionner un candidat.');
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    setShow(true);
    setIsFingerprintValid(false);
    setFingerprintError('');
    await verifyFingerprint();
  };

  const handleRetryVerification = async () => {
    await verifyFingerprint();
  };

  const handleConfirmVote = async () => {
    if (!isFingerprintValid) {
      setNotification('Veuillez vérifier votre empreinte digitale.');
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    setIsSubmitting(true);
    try {
      console.log('Submitting vote for candidate:', selectedCandidate);
      await api.post(`/api/elections/${id}/vote/`, { candidate: selectedCandidate });
      setShow(false);
      setNotification('Vote enregistré avec succès');
      setTimeout(() => navigate('/elections', { state: { notification: 'Vote enregistré avec succès' } }), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Erreur lors de l’enregistrement du vote.';
      setNotification(errorMsg);
      setTimeout(() => setNotification(null), 3000);
      console.error('Vote submission error:', errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to format class label
  const formatClasseLabel = (classe) => {
    const classeMap = {
      1: 'L1',
      2: 'L2',
      3: 'L3',
      4: 'M1',
      5: 'M2'
    };
    return classeMap[classe] || classe;
  };

  // Helper function to format mention label
  const formatMentionLabel = (mention) => {
    const mentionMap = {
      'INFO': 'Informatique',
      'SA': 'Sciences Agronomiques',
      'ECO': 'Économie et Commerce',
      'LEA': 'Langues Étrangères Appliquées',
      'ST': 'Sciences de la Terre',
      'DROIT': 'Droit'
    };
    return mentionMap[mention] || mention;
  };

  return (
    <ErrorBoundary>
      <MainLayout sidebar={UserSidebar}>
        <NotificationAlert
          message={notification}
          variant={notification?.includes('succès') ? 'success' : 'warning'}
          onClose={() => setNotification(null)}
        />
        <PageHeader title={`Voter dans l'élection: ${election.nom || 'Élection inconnue'}`} />
        <div className="p-4 bg-white rounded shadow-sm mb-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="mb-0" style={{ color: '#0F83DA' }}>Sélectionnez votre candidat</h5>
            <Badge bg={election.can_vote ? 'primary' : 'secondary'} style={{ backgroundColor: election.can_vote ? '#0F83DA' : '#6c757d' }}>
              {election.can_vote ? 'Élection ouverte' : 'Élection fermée'}
            </Badge>
          </div>
          <Row className="justify-content-center">
            {election.listeCandidats?.candidats?.length ? (
              election.listeCandidats.candidats.map(candidate => (
                <Col xs={12} sm={6} md={4} key={candidate.id} className="mb-3">
                  <Card
                    className={`candidate-card ${selectedCandidate === candidate.id.toString() ? 'selected' : ''}`}
                    onClick={() => setSelectedCandidate(candidate.id.toString())}
                    onKeyPress={(e) => e.key === 'Enter' && setSelectedCandidate(id.toString())}
                    tabIndex={0}
                    aria-label={`Sélectionner ${candidate.nom || 'Inconnu'}`}
                  >
                    <Card.Body className="text-center">
                      <div className="candidate-icon mb-2">
                        <i className="fas fa-user" style={{ fontSize: '2rem', color: '#0F83DA' }}></i>
                      </div>
                      <Card.Title className="mb-1" style={{ color: '#000000', fontSize: '1.2rem' }}>
                        {candidate.nom || 'Inconnu'}
                      </Card.Title>
                      <Card.Text className="text-muted" style={{ fontSize: '0.9rem' }}>
                        {formatMentionLabel(candidate.mention)} | {formatClasseLabel(candidate.classe)} | Matricule: {candidate.matricule}
                      </Card.Text>
                      {selectedCandidate === candidate.id.toString() && (
                        <i className="fas fa-check-circle mt-2" style={{ color: '#28a745' }}></i>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <p className="text-muted" style={{ color: '#000000' }}>Aucun candidat disponible.</p>
            )}
          </Row>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="secondary" class="rounded-pill" onClick={() => navigate('/elections')}>
              Annuler
            </Button>
            <Button
              variant="primary"
              className="rounded-pill"
              onClick={handleVoteSubmit}
              disabled={!selectedCandidate || isSubmitting}
            >
              Voter
            </Button>
          </div>
        </div>
        <Modal show={show} onHide={() => setShow(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title style={{ color: '#0F83DA' }}>Confirmez votre vote</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            <p style={{ color: '#000000' }}>
              Si vous êtes sûr de voter pour {election.listeCandidats?.candidats?.find(c => c.id === parseInt(selectedCandidate))?.nom || 'ce candidat'}, scannez votre empreinte digitale
            </p>
            <p style={{ color: '#DC3545' }}>Votre vote ne peut pas être annulé.</p>
            <div style={{ margin: '20px 0' }}>
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  background: isFingerprintValid ? '#28a745' : fingerprintError ? '#DC3545' : '#6c757d',
                  borderRadius: '10px',
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: !isFingerprintValid && !fingerprintError ? 'pulse 1.5s infinite' : 'none',
                }}
              >
                <i className="fas fa-fingerprint" style={{ fontSize: '50px', color: '#ffffff' }}></i>
              </div>
            </div>
            <p style={{ color: '#000000' }}>
              {isFingerprintValid
                ? 'Empreinte vérifiée'
                : fingerprintError
                ? `Vérification échouée. Réessayez.`
                : isVerifying
                ? 'Vérification en cours...'
                : 'Placez votre doigt sur le capteur...'}
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" className="rounded-pill" onClick={() => setShow(false)} disabled={isVerifying || isSubmitting}>
              Annuler
            </Button>
            {!isFingerprintValid && (
              <Button
                variant="outline-primary"
                className="rounded-pill"
                onClick={handleRetryVerification}
                disabled={isVerifying || isSubmitting}
              >
                Réessayer
              </Button>
            )}
            <Button
              variant="primary"
              className="rounded-pill"
              onClick={handleConfirmVote}
              disabled={!isFingerprintValid || isVerifying || isSubmitting}
            >
              {isSubmitting ? <Spinner animation="border" size="sm" /> : 'Voter'}
            </Button>
          </Modal.Footer>
        </Modal>
        <style jsx>{`
          .candidate-card {
            cursor: pointer;
            transition: transform 0.3s, border-color 0.3s;
            border: 2px solid #000000;
            border-radius: 10px;
            box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
            animation: fadeIn 0.5s ease-in;
          }
          .candidate-card:hover {
            transform: translateY(-5px);
            border-color: #0F83DA;
          }
          .candidate-card.selected {
            border-color: #28a745;
            background-color: #f8f9fa;
          }
          .candidate-details {
            display: flex;
            justify-content: center;
            gap: 10px;
            flex-wrap: wrap;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          @media (max-width: 768px) {
            h2 { font-size: 1.8rem; }
            h5 { font-size: 1.2rem; }
            .btn { font-size: 0.9rem; padding: 0.5rem 1rem; }
            .candidate-card { font-size: 0.9rem; }
            .candidate-details { font-size: 0.85rem; }
          }
          @media (max-width: 576px) {
            .form-control { font-size: 0.9rem; }
            .candidate-card { margin-bottom: 1rem; }
            .candidate-details { flex-direction: column; gap: 5px; }
          }
        `}</style>
      </MainLayout>
    </ErrorBoundary>
  );
}