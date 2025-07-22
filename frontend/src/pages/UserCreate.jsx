import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Sidebar from '../components/Sidebar';
import NotificationAlert from '../components/NotificationAlert';
import PageHeader from '../components/PageHeader';
import UserForm from '../components/UserForm';
import api from '../api';

export default function UserCreate() {
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);

  const handleFormSubmit = async (userData) => {
    try {
      await api.post('/api/users/create/', {
        nom: userData.nom,
        username: userData.username,
        matricule: userData.matricule,
        annee_universitaire: userData.annee_universitaire,
        classe: parseInt(userData.classe),
        mention: userData.mention,
        activite_ids: userData.activite_ids,
        sport_type: userData.activite_ids.includes(2) ? userData.sport_type : null, // ID 2 correspond à 'SPORT'
        fingerprint: userData.fingerprint || btoa('SampleFingerprint6069'),
      });
      navigate('/admin/users', {
        state: { notification: 'Utilisateur ajouté avec succès !' },
      });
    } catch (error) {
      let errorMessage = 'Erreur lors de la création de l’utilisateur.';
      if (error.response?.status === 403) {
        errorMessage = 'Vous n’êtes pas autorisé à créer un utilisateur.';
      } else if (error.response?.data) {
        errorMessage = `Erreur: ${JSON.stringify(error.response.data)}`;
      }
      setNotification(errorMessage);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  return (
    <MainLayout sidebar={Sidebar}>
      <NotificationAlert message={notification} onClose={() => setNotification(null)} />
      <PageHeader title="Ajouter un utilisateur" />
      <div className="p-3 bg-white rounded shadow-sm">
        <UserForm
          handleSubmit={handleFormSubmit}
          userData={{
            nom: '',
            username: '',
            matricule: '',
            annee_universitaire: '2024-2025',
            classe: 1,
            mention: 'INFO',
            activite_ids: [],
            sport_type: null,
          }}
          isEdit={false}
          onCancel={() => navigate('/admin/users')}
        />
      </div>
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