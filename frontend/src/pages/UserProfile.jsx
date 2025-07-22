import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import UserSidebar from '../components/UserSidebar';
import NotificationAlert from '../components/NotificationAlert';
import PageHeader from '../components/PageHeader';
import api from '../api';

export default function UserProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({
    nom: '',
    username: '',
    matricule: '',
    annee_universitaire: '2025-2026',
    classe: 1,
    mention: 'INFO',
    activites: [],
    sport_type: null,
  });
  const [notification, setNotification] = useState(location.state?.notification || null);
  const userId = parseInt(localStorage.getItem('user_id'));

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!userId) throw new Error('Utilisateur non connecté.');
        const userResponse = await api.get(`/api/users/by-user-id/${userId}/`);
        setUser(userResponse.data);
      } catch (error) {
        console.error('Fetch Error:', error.response?.data || error.message);
        const errorMessage = error.response?.status === 401 || error.response?.status === 403
          ? 'Session invalide. Veuillez vous reconnecter.'
          : `Erreur: ${error.message || 'Chargement des données échoué.'}`;
        setNotification(errorMessage);
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.clear();
          setTimeout(() => navigate('/login'), 3000);
        }
      }
      setTimeout(() => setNotification(null), 3000);
    };
    fetchUserData();
  }, [userId, navigate]);

  const getClasseLabel = (classe) => {
    const classes = { 1: 'L1', 2: 'L2', 3: 'L3', 4: 'M1', 5: 'M2' };
    return classes[classe] || 'Inconnu';
  };

  const getMentionLabel = (mention) => {
    const mentions = {
      INFO: 'Informatique',
      SA: 'Sciences Agronomiques',
      ECO: 'Économie et Commerce',
      LEA: 'Langues Étrangères Appliquées',
      ST: 'Sciences de la Terre',
      DROIT: 'Droit',
    };
    return mentions[mention] || 'Inconnu';
  };

  const getActivitesLabel = (activites) => {
    const activitesMap = {
      DANSE: 'Danse',
      SPORT: 'Sport',
      CHANT: 'Chant',
      DESSIN: 'Dessin',
      SLAM: 'Slam',
    };
    return activites && activites.length > 0
      ? activites.map(a => activitesMap[a.nom] || 'Inconnu').join(', ')
      : 'Aucune';
  };

  const getSportTypeLabel = (sport_type) => {
    const sports = {
      FOOT: 'Football',
      BASKET: 'Basketball',
      VOLLEY: 'Volleyball',
      PET: 'Pétanque',
    };
    return sports[sport_type] || 'Aucun';
  };

  return (
    <MainLayout sidebar={UserSidebar}>
      <NotificationAlert
        message={notification}
        variant="warning"
        onClose={() => setNotification(null)}
      />
      <PageHeader title={`Profil de ${user.username || 'Chargement...'}`} />
      <div className="p-3 bg-white rounded shadow-sm">
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nom</Form.Label>
            <Form.Control type="text" value={user.nom || 'Non défini'} readOnly />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Prénom</Form.Label>
            <Form.Control type="text" value={user.username || 'Non défini'} readOnly />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Matricule</Form.Label>
            <Form.Control type="text" value={user.matricule || 'Non défini'} readOnly />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Année universitaire</Form.Label>
            <Form.Control type="text" value={user.annee_universitaire || 'Non défini'} readOnly />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Classe</Form.Label>
            <Form.Control type="text" value={getClasseLabel(user.classe)} readOnly />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Mention</Form.Label>
            <Form.Control type="text" value={getMentionLabel(user.mention)} readOnly />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Activités</Form.Label>
            <Form.Control type="text" value={getActivitesLabel(user.activites)} readOnly />
          </Form.Group>
          {user.activites.some(a => a.nom === 'SPORT') && (
            <Form.Group className="mb-3">
              <Form.Label>Type de sport</Form.Label>
              <Form.Control type="text" value={getSportTypeLabel(user.sport_type)} readOnly />
            </Form.Group>
          )}
        </Form>
      </div>
      <style jsx>{`
        .btn-primary:hover {
          background-color: #005b99 !important;
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