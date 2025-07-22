import React, { useState, useEffect } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import MainLayout from '../components/MainLayout';
import Sidebar from '../components/Sidebar';
import NotificationAlert from '../components/NotificationAlert';
import PageHeader from '../components/PageHeader';
import api from '../api';

export default function ListeCandidatsCreate() { 
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({ nom: '', candidats: [] });
  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await api.get('/api/users/');
        setCandidates(response.data);
      } catch (error) {
        console.error('Erreur API:', error);
        setNotification('Erreur lors du chargement des candidats.');
        setTimeout(() => setNotification(null), 5000);
      }
    };
    fetchCandidates();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: '' });
  };

  const handleCheckboxChange = (id) => {
    const updatedCandidats = formData.candidats.includes(id)
      ? formData.candidats.filter(candidatId => candidatId !== id)
      : [...formData.candidats, id];
    setFormData({ ...formData, candidats: updatedCandidats });
    setFormErrors({ ...formErrors, candidats: '' });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.nom.trim()) {
      errors.nom = 'Le nom de la liste est requis.';
    }
    if (formData.candidats.length === 0) {
      errors.candidats = 'Veuillez sélectionner au moins un candidat.';
    }
    return errors;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await api.post('/api/listecandidats/create/', {
        nom: formData.nom,
        candidate_ids: formData.candidats,
      });
      navigate('/admin/gererelections?action=add', {
        state: { notification: 'Liste de candidats ajoutée avec succès !' },
      });
    } catch (error) {
      let errorMessage = 'Erreur lors de la création de la liste de candidats.';
      if (error.response?.status === 403) {
        errorMessage = 'Vous n’êtes pas autorisé à créer une liste de candidats.';
      } else if (error.response?.data) {
        errorMessage = `Erreur: ${JSON.stringify(error.response.data)}`;
      }
      setNotification(errorMessage);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleCancel = () => {
    navigate('/admin/gererelections');
  };

  const getClasseLabel = (classe) => {
    const classes = { 1: 'L1', 2: 'L2', 3: 'L3', 4: 'M1', 5: 'M2' };
    return classes[classe] || 'Inconnue';
  };

  const getMentionLabel = (mention) => {
    const mentions = {
      'INFO': 'Informatique',
      'SA': 'Sciences Agronomiques',
      'ECO': 'Économie et Commerce',
      'LEA': 'Langues Étrangères Appliquées',
      'ST': 'Sciences de la Terre',
      'DROIT': 'Droit'
    };
    return mentions[mention] || 'Inconnue';
  };

  const getActivitesLabel = (activites) => {
    if (!activites || activites.length === 0) return 'Aucune';
    const activiteMap = {
      'DANSE': 'Danse',
      'SPORT': 'Sport',
      'CHANT': 'Chant',
      'DESSIN': 'Dessin',
      'SLAM': 'Slam'
    };
    return activites.map(a => activiteMap[a.nom] || a.nom).join(', ');
  };

  const getSportTypeLabel = (sport_type) => {
    const sports = {
      'FOOT': 'Football',
      'BASKET': 'Basketball',
      'VOLLEY': 'Volleyball',
      'PET': 'Pétanque'
    };
    return sports[sport_type] || 'Aucun';
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.activites.some(a => a.nom.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <MainLayout sidebar={Sidebar}>
      <NotificationAlert
        message={notification}
        variant={notification?.includes('succès') ? 'success' : 'warning'}
        onClose={() => setNotification(null)}
      />
      <PageHeader title="Ajouter une liste de candidats" />
      <div className="p-4 bg-white rounded shadow-sm">
        <Form onSubmit={handleFormSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nom de la liste</Form.Label>
            <Form.Control
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleInputChange}
              isInvalid={!!formErrors.nom}
              placeholder="Entrez le nom de la liste"
              style={{ borderColor: '#0F83DA', fontFamily: '"Arial Rounded MT", Arial, sans-serif' }}
            />
            <Form.Control.Feedback type="invalid">{formErrors.nom}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Sélectionner les candidats</Form.Label>
            <InputGroup className="mb-2 search-bar-container">
              <InputGroup.Text
                style={{ backgroundColor: '#fff', border: 'none', padding: '0.5rem' }}
              >
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Rechercher par nom, matricule ou activité"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ border: 'none', fontFamily: '"Arial Rounded MT", Arial, sans-serif' }}
              />
            </InputGroup>
            <div className="candidate-list">
              {filteredCandidates.length === 0 ? (
                <p className="text-muted text-center my-3">Aucun candidat trouvé.</p>
              ) : (
                filteredCandidates.map((candidate, index) => (
                  <div
                    key={candidate.id}
                    className={`candidate-item d-flex align-items-center p-2 ${index % 2 === 0 ? 'bg-light' : ''}`}
                  >
                    <Form.Check
                      type="checkbox"
                      id={`candidate-${candidate.id}`}
                      checked={formData.candidats.includes(candidate.id)}
                      onChange={() => handleCheckboxChange(candidate.id)}
                      className="me-2"
                    />
                    <label
                      htmlFor={`candidate-${candidate.id}`}
                      className="candidate-label flex-grow-1"
                    >
                      <span className="fw-bold">{candidate.nom}</span>
                      <span className="text-muted ms-1">
                        ({getMentionLabel(candidate.mention)}, {getClasseLabel(candidate.classe)}, Matricule: {candidate.matricule})
                      </span>
                      <span className="text-secondary d-block small">
                        Activités: {getActivitesLabel(candidate.activites)}
                        {candidate.activites.some(a => a.nom === 'SPORT') ? `, Sport: ${getSportTypeLabel(candidate.sport_type)}` : ''}
                      </span>
                    </label>
                  </div>
                ))
              )}
            </div>
            {formErrors.candidats && (
              <div className="invalid-feedback d-block mt-2">{formErrors.candidats}</div>
            )}
          </Form.Group>
          <div className="d-flex justify-content-between">
            <Button
              variant="secondary"
              className="rounded-pill"
              onClick={handleCancel}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="rounded-pill"
            >
              Créer la liste
            </Button>
          </div>
        </Form>
      </div>
      <style jsx>{`
        .search-bar-container {
          border: 1px solid #ced4da;
          border-radius: 15px;
          overflow: hidden;
        }
        .candidate-list {
          max-height: 350px;
          overflow-y: auto;
          border: 1px solid #dee2e6;
          border-radius: 0.25rem;
          padding: 0.5rem;
          background-color: #fff;
          font-family: "Arial Rounded MT", Arial, sans-serif;
        }
        .candidate-item {
          border-bottom: 1px solid #e9ecef;
          transition: background-color 0.2s;
        }
        .candidate-item:last-child {
          border-bottom: none;
        }
        .candidate-item:hover {
          background-color: #f1f3f5;
        }
        .candidate-label {
          cursor: pointer;
          line-height: 1.4;
          font-family: "Arial Rounded MT", Arial, sans-serif;
        }
        .candidate-label .fw-bold {
          color: #0F83DA;
        }
        .candidate-label .text-muted {
          font-size: 0.9rem;
        }
        .candidate-label .text-secondary {
          font-size: 0.85rem;
        }
        .form-check-input:checked {
          background-color: #0F83DA;
          border-color: #0F83DA;
        }
        .btn-primary:hover {
          background-color: #005b99 !important;
          color: #fff !important;
        }
        .btn-secondary:hover {
          background-color: #6c757d !important;
          color: #fff !important;
        }
        @media (max-width: 768px) {
          h2 {
            font-size: 1.8rem;
          }
          .form-control {
            font-size: 0.9rem;
            padding: 0.5rem;
          }
          .btn {
            font-size: 0.9rem;
            padding: 0.5rem 1rem;
          }
          .candidate-label .text-muted {
            font-size: 0.85rem;
          }
          .candidate-label .text-secondary {
            font-size: 0.8rem;
          }
        }
        @media (max-width: 576px) {
          .form-control {
            font-size: 0.85rem;
          }
          .candidate-label .text-muted {
            font-size: 0.8rem;
          }
          .candidate-label .text-secondary {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </MainLayout>
  );
}