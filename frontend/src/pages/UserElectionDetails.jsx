import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import UserSidebar from '../components/UserSidebar';
import NotificationAlert from '../components/NotificationAlert';
import PageHeader from '../components/PageHeader';
import api from '../api';

export default function UserElectionDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [election, setElection] = useState({
    nom: '',
    startdate: '',
    enddate: '',
    listeCandidats: { nom: '', candidats: [] },
    allowed_voter_criteria: { classe: [], mention: [], activite: [], sport_type: [] },
    can_vote: false,
    statut: '',
  });
  const [notification, setNotification] = useState(null);
  const userId = parseInt(localStorage.getItem('user_id'));

  useEffect(() => {
    const fetchElection = async () => {
      try {
        if (!userId) throw new Error('Utilisateur non connecté.');
        const userResponse = await api.get(`/api/users/by-user-id/${userId}/`);
        const userData = userResponse.data;
        console.log('User Data:', userData);
        const response = await api.get(`/api/elections/${id}/`);
        const electionData = response.data;
        console.log('Election Data:', electionData);

        // Validate voter eligibility using allowed_voter_criteria.classe
        const classeCriteria = electionData.allowed_voter_criteria?.classe;
        const isAllowed = Array.isArray(classeCriteria) && classeCriteria.length > 0
          ? classeCriteria.includes(String(userData.classe))
          : true; // Allow if empty classe criteria

        if (!isAllowed) {
          throw new Error('Vous n’êtes pas autorisé à voir cette élection.');
        }

        setElection(electionData);
      } catch (error) {
        console.error('Fetch Error:', error);
        const errorMessage = error.response?.status === 401 || error.response?.status === 403
          ? 'Session invalide. Veuillez vous reconnecter.'
          : error.message || 'Erreur lors du chargement des détails de l’élection.';
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
  }, [id, userId, navigate]);

  const getTypeLabel = (classe) => {
    const classes = { 1: 'L1', 2: 'L2', 3: 'L3', 4: 'M1', 5: 'M2' };
    return classes[classe] || 'Inconnu';
  };

  return (
    <MainLayout sidebar={UserSidebar}>
      <NotificationAlert message={notification} onClose={() => setNotification(null)} />
      <PageHeader title={`Détails de l’élection: ${election.nom || 'Élection'}`} />
      <div className="p-3 bg-white rounded shadow-sm">
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nom de l’élection</Form.Label>
            <Form.Control type="text" value={election.nom || 'Non défini'} readOnly />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Date et heure de début</Form.Label>
            <Form.Control
              type="text"
              value={election.startdate ? new Date(election.startdate).toLocaleString('fr-FR') : 'Non défini'}
              readOnly
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Date et heure de fin</Form.Label>
            <Form.Control
              type="text"
              value={election.enddate ? new Date(election.enddate).toLocaleString('fr-FR') : 'Non défini'}
              readOnly
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Liste de candidats</Form.Label>
            <Form.Control
              type="text"
              value={election.listeCandidats?.nom || 'Aucun'}
              readOnly
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Classes autorisées</Form.Label>
            <Form.Control
              as="textarea"
              value={election.allowed_voter_criteria?.classe?.map(t => getTypeLabel(t)).join(', ') || 'Aucune'}
              readOnly
            />
          </Form.Group>
          <div className="d-flex flex-column flex-md-row justify-content-between gap-2">
            <Button variant="secondary" className="rounded-pill" onClick={() => navigate('/elections')}>
              Retour
            </Button>
            <div className="d-flex flex-column flex-sm-row gap-2">
              <Button
                variant="primary"
                className="rounded-pill"
                onClick={() => navigate(`/elections/${id}/vote`)}
                disabled={!election.can_vote}
              >
                Voter
              </Button>
              <Button
                variant="success"
                className="rounded-pill"
                onClick={() => navigate(`/elections/${id}/resultats`)}
                disabled={election.statut !== 'ferme'}
              >
                Voir résultats
              </Button>
            </div>
          </div>
        </Form>
      </div>
      <style jsx>{`
        .btn-primary:hover {
          background-color: #005b99 !important;
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
          .form-control {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </MainLayout>
  );
}