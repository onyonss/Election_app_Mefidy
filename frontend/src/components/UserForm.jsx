import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';

export default function UserForm({ handleSubmit, userData, isEdit, onCancel, handleDeleteConfirm }) {
  const [formData, setFormData] = useState({
    nom: userData?.nom || '',
    username: userData?.username || '',
    matricule: userData?.matricule || '',
    annee_universitaire: userData?.annee_universitaire || '2025-2026',
    password: '',
    fingerprint: '',
    classe: userData?.classe || 1,
    mention: userData?.mention || 'INFO',
    activite_ids: userData?.activite_ids || [],
    sport_type: userData?.sport_type || null,
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const initialData = {
      nom: userData?.nom || '',
      username: userData?.username || '',
      matricule: userData?.matricule || '',
      annee_universitaire: userData?.annee_universitaire || '2025-2026',
      password: '',
      fingerprint: '',
      classe: userData?.classe || 1,
      mention: userData?.mention || 'INFO',
      activite_ids: userData?.activite_ids || [],
      sport_type: userData?.sport_type || null,
    };
    const hasModifications =
      formData.nom !== initialData.nom ||
      formData.username !== initialData.username ||
      formData.matricule !== initialData.matricule ||
      formData.annee_universitaire !== initialData.annee_universitaire ||
      formData.password !== '' ||
      formData.fingerprint !== '' ||
      formData.classe !== initialData.classe ||
      formData.mention !== initialData.mention ||
      JSON.stringify(formData.activite_ids) !== JSON.stringify(initialData.activite_ids) ||
      formData.sport_type !== initialData.sport_type;
    setHasChanges(hasModifications);
  }, [formData, userData]);

  const handleChange = (e) => {
    const { name, value, options } = e.target;
    if (name === 'activite_ids') {
      const selectedIds = Array.from(options)
        .filter(option => option.selected)
        .map(option => parseInt(option.value));
      setFormData({
        ...formData,
        [name]: selectedIds,
        // Réinitialiser sport_type si SPORT (ID 2) n'est pas sélectionné
        sport_type: selectedIds.includes(2) ? formData.sport_type : null,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value === '' ? null : value,
      });
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleSubmit(formData);
  };

  const classeOptions = [
    { value: 1, label: 'L1' },
    { value: 2, label: 'L2' },
    { value: 3, label: 'L3' },
    { value: 4, label: 'M1' },
    { value: 5, label: 'M2' },
  ];

  const mentionOptions = [
    { value: 'INFO', label: 'Informatique' },
    { value: 'SA', label: 'Sciences Agronomiques' },
    { value: 'ECO', label: 'Économie et Commerce' },
    { value: 'LEA', label: 'Langues Étrangères Appliquées' },
    { value: 'ST', label: 'Sciences de la Terre' },
    { value: 'DROIT', label: 'Droit' },
  ];

  const activiteOptions = [
    { id: 1, nom: 'DANSE', label: 'Danse' },
    { id: 2, nom: 'SPORT', label: 'Sport' },
    { id: 3, nom: 'CHANT', label: 'Chant' },
    { id: 4, nom: 'DESSIN', label: 'Dessin' },
    { id: 5, nom: 'SLAM', label: 'Slam' },
  ];

  const sportTypeOptions = [
    { value: 'FOOT', label: 'Football' },
    { value: 'BASKET', label: 'Basketball' },
    { value: 'VOLLEY', label: 'Volleyball' },
    { value: 'PET', label: 'Pétanque' },
  ];

  return (
    <div className="p-4 bg-white rounded shadow-sm">
      <Form onSubmit={onSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Nom</Form.Label>
              <Form.Control
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Prénom</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Matricule</Form.Label>
              <Form.Control
                type="text"
                name="matricule"
                value={formData.matricule}
                onChange={handleChange}
                required
                pattern="[0-9]{4}"
                placeholder="Entrez un matricule à 4 chiffres"
                title="Le matricule doit contenir exactement 4 chiffres."
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Année universitaire</Form.Label>
              <Form.Control
                type="text"
                name="annee_universitaire"
                value={formData.annee_universitaire}
                onChange={handleChange}
                required
                placeholder="Ex: 2025-2026"
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Mot de passe</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEdit}
                placeholder={isEdit ? 'Laisser vide pour ne pas modifier' : 'Entrez le mot de passe'}
              />
            </Form.Group>
          </Col>
          
        </Row>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Classe</Form.Label>
              <Form.Select
                name="classe"
                value={formData.classe}
                onChange={handleChange}
                required
              >
                {classeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Mention</Form.Label>
              <Form.Select
                name="mention"
                value={formData.mention}
                onChange={handleChange}
                required
              >
                {mentionOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Activités</Form.Label>
              <Form.Select
                name="activite_ids"
                multiple
                value={formData.activite_ids}
                onChange={handleChange}
              >
                {activiteOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Type de sport</Form.Label>
              <Form.Select
                name="sport_type"
                value={formData.sport_type || ''}
                onChange={handleChange}
                disabled={!formData.activite_ids.includes(2)} // Désactiver si SPORT (ID 2) n'est pas sélectionné
              >
                <option value="">Aucun</option>
                {sportTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <div className="d-flex justify-content-between mt-4">
          <Button variant="secondary" className="rounded-pill" onClick={onCancel}>
            Annuler
          </Button>
          <div>
            <Button
              type="submit"
              variant="primary"
              className="rounded-pill me-2"
              disabled={!hasChanges}
            >
              {isEdit ? 'Modifier' : 'Créer'}
            </Button>
            {isEdit && (
              <Button
                variant="danger"
                className="rounded-pill"
                onClick={handleDeleteConfirm}
              >
                Supprimer
              </Button>
            )}
          </div>
        </div>
      </Form>
    </div>
  );
}