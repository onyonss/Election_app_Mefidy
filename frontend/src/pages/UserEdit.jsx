import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Sidebar from '../components/Sidebar';
import NotificationAlert from '../components/NotificationAlert';
import PageHeader from '../components/PageHeader';
import UserForm from '../components/UserForm';
import api from '../api';

export default function UserEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState({
    id: null,
    nom: '',
    username: '',
    matricule: '',
    annee_universitaire: '2025-2026',
    classe: 1,
    mention: 'INFO',
    activites: [],
    activite_ids: [],
    sport_type: null,
  });
  const [notification, setNotification] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/api/users/${id}/`);
        setUser({
          id: response.data.id,
          nom: response.data.nom || '',
          username: response.data.username || '',
          matricule: response.data.matricule || '',
          annee_universitaire: response.data.annee_universitaire || '2025-2026',
          classe: response.data.classe || 1,
          mention: response.data.mention || 'INFO',
          activites: response.data.activites || [],
          activite_ids: response.data.activites ? response.data.activites.map(a => a.id) : [],
          sport_type: response.data.sport_type || null,
        });
      } catch (error) {
        setNotification('Erreur lors du chargement des détails de l’utilisateur.');
        setTimeout(() => setNotification(null), 3000);
      }
    };
    if (id) {
      fetchUser();
    } else {
      setNotification('ID utilisateur invalide.');
      setTimeout(() => setNotification(null), 3000);
    }
  }, [id]);

  const handleFormSubmit = async (userData) => {
    try {
      const payload = {
        nom: userData.nom,
        username: userData.username,
        matricule: userData.matricule,
        annee_universitaire: userData.annee_universitaire,
        classe: parseInt(userData.classe),
        mention: userData.mention,
        activite_ids: userData.activite_ids,
        sport_type: userData.activites.some(a => a.nom === 'SPORT') ? userData.sport_type : null,
      };
      if (userData.password) payload.password = userData.password;
      if (userData.fingerprint) payload.fingerprint = userData.fingerprint;
      await api.put(`/api/users/${id}/`, payload);
      navigate('/admin/users', {
        state: { notification: 'Utilisateur modifié avec succès !' },
      });
    } catch (error) {
      let errorMessage = 'Erreur lors de la modification de l’utilisateur.';
      if (error.response?.status === 403) {
        errorMessage = 'Vous n’êtes pas autorisé à modifier cet utilisateur.';
      } else if (error.response?.data) {
        errorMessage = `Erreur: ${JSON.stringify(error.response.data)}`;
      }
      setNotification(errorMessage);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/users/${id}/`);
      setShowDeleteConfirm(false);
      navigate('/admin/users', {
        state: { notification: 'Utilisateur supprimé avec succès !' },
      });
    } catch (error) {
      setNotification('Erreur lors de la suppression de l’utilisateur.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <MainLayout sidebar={Sidebar}>
      <NotificationAlert message={notification} onClose={() => setNotification(null)} />
      <PageHeader title={`Modifier l'utilisateur: ${user.nom || 'Chargement...'}`} />
      <div className="p-3 bg-white rounded shadow-sm">
        {user.id && (
          <UserForm
            handleSubmit={handleFormSubmit}
            userData={user}
            isEdit={true}
            onCancel={() => navigate('/admin/users')}
            handleDeleteConfirm={handleDeleteConfirm}
          />
        )}
      </div>
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ color: '#DC3545' }}>
            Êtes-vous sûr de vouloir supprimer {user.nom || 'cet utilisateur'} ?
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