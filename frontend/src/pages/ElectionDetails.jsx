import React, { useState, useEffect } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import ElectionDetailsForm from '../components/ElectionDetailsForm';
import MainLayout from '../components/MainLayout';
import Sidebar from '../components/Sidebar';
import NotificationAlert from '../components/NotificationAlert';
import PageHeader from '../components/PageHeader';
import api from '../api';

export default function ElectionDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [election, setElection] = useState({
    nom: '',
    startdate: '',
    enddate: '',
    listeCandidats: { candidats: [] },
    allowed_voter_criteria: { classe: [], mention: [], activite: [], sport_type: [] },
    statut: 'ouvert',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteElectionId, setDeleteElectionId] = useState(null);
  const [notification, setNotification] = useState(null);
  const currentDate = new Date();

  useEffect(() => {
    const fetchElection = async () => {
      try {
        const response = await api.get(`/api/elections/${id}/`);
        const electionData = response.data;
        setElection({
          id: electionData.id,
          nom: electionData.nom || '',
          startdate: electionData.startdate || '',
          enddate: electionData.enddate || '',
          listeCandidats: electionData.listeCandidats || { candidats: [] },
          allowed_voter_criteria: {
            classe: electionData.allowed_voter_criteria?.classe || [],
            mention: electionData.allowed_voter_criteria?.mention || [],
            activite: electionData.allowed_voter_criteria?.activite || [],
            sport_type: electionData.allowed_voter_criteria?.sport_type || [],
          },
          statut: electionData.statut || 'ouvert',
        });
        if (!electionData.listeCandidats?.candidats?.length) {
          setNotification('Attention : Cette élection n’a aucun candidat associé.');
          setTimeout(() => setNotification(null), 5000);
        }
      } catch (error) {
        let errorMessage = `Erreur lors du chargement des détails de l’élection: ${error.response?.statusText || error.message}`;
        if (error.response?.status === 404 && error.response?.data?.error === 'Utilisateur non trouvé') {
          errorMessage = 'Utilisateur non associé à un profil électeur. Contactez l’administrateur.';
        }
        setNotification(errorMessage);
        setTimeout(() => setNotification(null), 5000);
      }
    };
    if (id) {
      fetchElection();
    } else {
      setNotification('ID d’élection invalide.');
      setTimeout(() => setNotification(null), 5000);
    }
  }, [id]);

  const handleEdit = () => {
    navigate(`/admin/gererelections/${id}/edit`);
  };

  const handleDeleteConfirm = (electionId) => {
    setDeleteElectionId(electionId);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/elections/${deleteElectionId}/`);
      setShowDeleteConfirm(false);
      navigate('/admin/gererelections', {
        state: { notification: 'Élection supprimée avec succès !' },
      });
    } catch (error) {
      setNotification(`Erreur lors de la suppression de l’élection: ${error.response?.statusText || error.message}`);
      setTimeout(() => setNotification(null), 5000);
    }
  };

 const isPublishable = (endDate, statut) => {
  if (!endDate || statut === 'ferme') return false;
  const parsedEndDate = new Date(endDate);
  const now = new Date();
  return parsedEndDate < now && !isNaN(parsedEndDate.getTime());
};

  const handlePublish = async (electionId, endDate, statut) => {
    if (!electionId || !endDate) {
      setNotification('Erreur : Données de l’élection manquent.');
      setTimeout(() => setNotification(null), 5000);
      return;
    }
    if (!election.listeCandidats?.candidats?.length) {
      setNotification('Erreur : Impossible de publier les résultats sans candidats.');
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
      <PageHeader title={`Détails de l’élection: ${election.nom || 'Chargement...'}`} />
      <ElectionDetailsForm
        election={election}
        handleEdit={handleEdit}
        onCancel={() => navigate('/admin/gererelections')}
        handleDeleteConfirm={handleDeleteConfirm}
        handlePublish={(electionId) => handlePublish(electionId, election.enddate, election.statut)}
      />
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ color: '#DC3545' }}>
            Êtes-vous sûr de vouloir supprimer {election.nom || 'cette élection'} ?
          </p>
          <p>Cette action ne peut pas être annulée.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Annuler</Button>
          <Button variant="danger" onClick={handleDelete}>Supprimer</Button>
        </Modal.Footer>
      </Modal>
      <style jsx>{`
        @media (max-width: 768px) {
          h2 {
            font-size: 1.8rem;
          }
          .btn {
            font-size: 0.9rem;
            padding: 0.5rem;
          }
          .form-group {
            margin-bottom: 1rem;
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