import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import ElectionForm from '../components/ElectionForm';
import MainLayout from '../components/MainLayout';
import Sidebar from '../components/Sidebar';
import NotificationAlert from '../components/NotificationAlert';
import PageHeader from '../components/PageHeader';
import api from '../api';
import moment from '../utils/momentConfig';

export default function ElectionEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [election, setElection] = useState({
    id: null,
    nom: '',
    startDate: '',
    endDate: '',
    listeCandidats: null,
    allowed_voter_criteria: { classe: [], mention: [], activite: [], sport_type: [] },
    statut: 'ouvert',
  });
  const [candidateLists, setCandidateLists] = useState([]);
  const [notification, setNotification] = useState(null);
  const currentDate = moment();

  useEffect(() => {
    const fetchElection = async () => {
      try {
        const response = await api.get(`/api/elections/${id}/`);
        const electionData = response.data;
        setElection({
          id: electionData.id,
          nom: electionData.nom || '',
          startDate: electionData.startdate ? moment(electionData.startdate).format('DD/MM/YY HH:mm') : '',
          endDate: electionData.enddate ? moment(electionData.enddate).format('DD/MM/YY HH:mm') : '',
          listeCandidats: electionData.listeCandidats?.id || null,
          allowed_voter_criteria: {
            classe: electionData.allowed_voter_criteria?.classe?.map(String) || [],
            mention: electionData.allowed_voter_criteria?.mention || [],
            activite: electionData.allowed_voter_criteria?.activite || [],
            sport_type: electionData.allowed_voter_criteria?.sport_type || [],
          },
          statut: electionData.statut || 'ouvert',
        });
      } catch (error) {
        console.error('Error fetching election:', error.response?.data || error);
        let errorMessage = `Erreur lors du chargement des détails de l’élection: ${error.response?.statusText || error.message}`;
        if (error.response?.status === 404 && error.response?.data?.error === 'Utilisateur non trouvé') {
          errorMessage = 'Utilisateur non associé à un profil électeur. Contactez l’administrateur.';
        }
        setNotification(errorMessage);
        setTimeout(() => setNotification(null), 5000);
      }
    };

    const fetchCandidateLists = async () => {
      try {
        const response = await api.get('/api/listecandidats/');
        setCandidateLists(response.data);
      } catch (error) {
        console.error('Error fetching candidate lists:', error.response?.data || error);
        setNotification(`Erreur lors du chargement des listes de candidats: ${error.response?.statusText || error.message}`);
        setTimeout(() => setNotification(null), 5000);
      }
    };

    if (id) {
      fetchElection();
      fetchCandidateLists();
    } else {
      setNotification('ID d’élection invalide.');
      setTimeout(() => setNotification(null), 5000);
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      navigate('/admin/gererelections', {
        state: { notification: 'ID d’élection invalide.' },
      });
    }
  }, [id, navigate]);

  const handleFormSubmit = async (electionData) => {
    try {
      const startdate = moment(electionData.startDate, 'DD/MM/YY HH:mm').toISOString();
      const enddate = moment(electionData.endDate, 'DD/MM/YY HH:mm').toISOString();

      if (!electionData.listeCandidats) {
        throw new Error('Veuillez sélectionner une liste de candidats.');
      }

      const payload = {
        nom: electionData.nom,
        startdate,
        enddate,
        listeCandidats_id: parseInt(electionData.listeCandidats),
        allowed_voter_criteria: {
          classe: electionData.allowed_voter_criteria.classe.map(String),
          mention: electionData.allowed_voter_criteria.mention,
          activite: electionData.allowed_voter_criteria.activite,
          sport_type: electionData.allowed_voter_criteria.sport_type,
        },
        statut: electionData.statut || election.statut,
      };

      await api.put(`/api/elections/${id}/`, payload);
      navigate('/admin/gererelections', {
        state: { notification: 'Élection modifiée avec succès !' },
      });
    } catch (error) {
      console.error('Error updating election:', error.response?.data || error);
      let errorMessage = 'Erreur lors de la modification de l’élection.';
      if (error.response?.status === 403) {
        errorMessage = 'Vous n’êtes pas autorisé à modifier cette élection.';
      } else if (error.response?.data) {
        errorMessage = `Erreur: ${JSON.stringify(error.response.data)}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setNotification(errorMessage);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const isPublishable = (endDate, statut) => {
    if (!endDate) return false;
    const parsedEndDate = moment(endDate, 'DD/MM/YY HH:mm');
    return parsedEndDate.isValid() && parsedEndDate.isBefore(currentDate) && statut !== 'ferme';
  };

  const handlePublish = async (electionId, endDate, statut) => {
    if (!electionId || !endDate) {
      setNotification('Erreur : Données de l’élection manquent.');
      setTimeout(() => setNotification(null), 5000);
      return;
    }
    if (isPublishable(endDate, statut)) {
      try {
        await api.post(`/api/elections/${electionId}/resultats/`);
        navigate('/admin/gererelections', {
          state: { notification: 'Résultats publiés avec succès !' },
        });
      } catch (error) {
        console.error('Error publishing results:', error.response?.data || error);
        setNotification(`Erreur lors de la publication des résultats: ${error.response?.statusText || error.message}`);
        setTimeout(() => setNotification(null), 5000);
      }
    } else {
      setNotification('Les résultats ne peuvent pas être publiés avant la fin de l’élection ou si déjà publiés.');
      setTimeout(() => setNotification(null), 5000);
    }
  };

  if (!election.id && notification) {
    return (
      <MainLayout sidebar={Sidebar}>
        <NotificationAlert message={notification} variant="danger" onClose={() => setNotification(null)} />
        <Button variant="secondary" onClick={() => navigate('/admin/gererelections')}>
          Retour
        </Button>
      </MainLayout>
    );
  }

  return (
    <MainLayout sidebar={Sidebar}>
      <NotificationAlert message={notification} onClose={() => setNotification(null)} />
      <PageHeader title={`Modifier l’élection : ${election.nom || 'Chargement...'}`} />
      {election.id && (
        <ElectionForm
          handleSubmit={handleFormSubmit}
          electionData={election}
          isEdit={true}
          candidateLists={candidateLists}
          onCancel={() => navigate('/admin/gererelections')}
          handlePublish={() => handlePublish(election.id, election.endDate, election.statut)}
        />
      )}
      <style jsx>{`
        @media (max-width: 768px) {
          h2 {
            font-size: 1.8rem;
          }
          .btn {
            font-size: 0.9rem;
            padding: 0.5rem 1rem;
          }
        }
      `}</style>
    </MainLayout>
  );
}