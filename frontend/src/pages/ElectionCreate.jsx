import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ElectionForm from '../components/ElectionForm';
import MainLayout from '../components/MainLayout';
import Sidebar from '../components/Sidebar';
import NotificationAlert from '../components/NotificationAlert';
import PageHeader from '../components/PageHeader';
import api from '../api';
import moment from '../utils/momentConfig';

export default function ElectionCreate() {
  const navigate = useNavigate();
  const [candidateLists, setCandidateLists] = useState([]);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchCandidateLists = async () => {
      try {
        const response = await api.get('/api/listecandidats/');
        setCandidateLists(response.data);
      } catch (error) {
        console.error('Error fetching candidate lists:', error.response?.data || error);
        setNotification('Erreur lors du chargement des listes de candidats.');
        setTimeout(() => setNotification(null), 5000);
      }
    };
    fetchCandidateLists();
  }, []);

  const handleFormSubmit = async (electionData) => {
    try {
      const startdate = moment(electionData.startDate, 'DD/MM/YY HH:mm').toISOString();
      const enddate = moment(electionData.endDate, 'DD/MM/YY HH:mm').toISOString();

      if (!electionData.listeCandidats) {
        throw new Error('Veuillez sélectionner une liste de candidats.');
      }

      const allowed_voter_criteria = {
        classe: electionData.allowed_voter_criteria.classe.map(Number).filter(c => c),
        mention: electionData.allowed_voter_criteria.mention.filter(m => m),
      };

      if (electionData.allowed_voter_criteria.activite.length > 0) {
        allowed_voter_criteria.activite = electionData.allowed_voter_criteria.activite;
        if (allowed_voter_criteria.activite.includes('SPORT') && electionData.allowed_voter_criteria.sport_type.length > 0) {
          allowed_voter_criteria.sport_type = electionData.allowed_voter_criteria.sport_type;
        }
      }

      const response = await api.post('/api/elections/', {
        nom: electionData.nom,
        startdate,
        enddate,
        listeCandidats_id: parseInt(electionData.listeCandidats),
        allowed_voter_criteria,
      });
      navigate('/admin/gererelections?action=add', {
        state: { notification: 'Élection ajoutée avec succès !' },
      });
    } catch (error) {
      console.error('Error creating election:', error.response?.data || error);
      let errorMessage = 'Erreur lors de la création de l’élection.';
      if (error.response?.status === 403) {
        errorMessage = 'Vous n’êtes pas autorisé à créer une élection. Connectez-vous en tant qu’administrateur.';
      } else if (error.response?.data) {
        errorMessage = `Erreur: ${JSON.stringify(error.response.data)}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setNotification(errorMessage);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  return (
    <MainLayout sidebar={Sidebar}>
      <NotificationAlert message={notification} onClose={() => setNotification(null)} />
      <PageHeader title="Ajouter une élection" />
      <ElectionForm
        handleSubmit={handleFormSubmit}
        electionData={{
          nom: '',
          startDate: '',
          endDate: '',
          listeCandidats: '',
          allowed_voter_criteria: { classe: [], mention: [], activite: [], sport_type: [] },
        }}
        isEdit={false}
        candidateLists={candidateLists}
        onCancel={() => navigate('/admin/gererelections')}
      />
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