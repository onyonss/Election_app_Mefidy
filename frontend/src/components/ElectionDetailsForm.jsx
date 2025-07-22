import React from 'react';
import { Button, Form } from 'react-bootstrap';

export default function ElectionDetailsForm({ election, handleEdit, onCancel, handleDeleteConfirm, handlePublish }) {
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

  const getActiviteLabel = (activite) => {
    const activites = {
      DANSE: 'Danse',
      SPORT: 'Sport',
      CHANT: 'Chant',
      DESSIN: 'Dessin',
      SLAM: 'Slam',
    };
    return activites[activite] || 'Inconnu';
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

  const currentDate = new Date();
const isPublishable = (endDate, statut) => {
  if (!endDate || statut === 'ferme') return false;
  const parsedEndDate = new Date(endDate);
  const now = new Date();
  return parsedEndDate < now && !isNaN(parsedEndDate.getTime());
};

  return (
    <div className="p-4 bg-white rounded shadow-sm">
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Nom de l'élection</Form.Label>
          <Form.Control type="text" value={election?.nom || 'Non défini'} readOnly />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Date et heure de début de l'élection</Form.Label>
          <Form.Control
            type="text"
            value={election?.startdate ? new Date(election.startdate).toLocaleString('fr-FR') : 'Non défini'}
            readOnly
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Date et heure de fin de l'élection</Form.Label>
          <Form.Control
            type="text"
            value={election?.enddate ? new Date(election.enddate).toLocaleString('fr-FR') : 'Non défini'}
            readOnly
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Liste de candidats</Form.Label>
          <Form.Control
            type="text"
            value={election?.listeCandidats?.nom || 'Aucun'}
            readOnly
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Candidats</Form.Label>
          <Form.Control
            as="textarea"
            value={election?.listeCandidats?.candidats?.map(c => c.nom).join(', ') || 'Aucun candidat'}
            readOnly
            rows={3}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Classes autorisées</Form.Label>
          <Form.Control
            as="textarea"
            value={election?.allowed_voter_criteria?.classe?.map(t => getClasseLabel(t)).join(', ') || 'Aucune'}
            readOnly
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Mentions autorisées</Form.Label>
          <Form.Control
            as="textarea"
            value={election?.allowed_voter_criteria?.mention?.map(t => getMentionLabel(t)).join(', ') || 'Aucune'}
            readOnly
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Activités autorisées</Form.Label>
          <Form.Control
            as="textarea"
            value={election?.allowed_voter_criteria?.activite?.map(t => getActiviteLabel(t)).join(', ') || 'Aucune'}
            readOnly
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Types de sport autorisés</Form.Label>
          <Form.Control
            as="textarea"
            value={election?.allowed_voter_criteria?.sport_type?.map(t => getSportTypeLabel(t)).join(', ') || 'Aucun'}
            readOnly
          />
        </Form.Group>
      </Form>
      <div className="d-flex justify-content-between mt-4">
        <Button variant="secondary" className="rounded-pill me-2" onClick={onCancel}>
          Annuler
        </Button>
        <div>
          <Button
            variant="warning"
            className="rounded-pill me-2"
            style={{ backgroundColor: '#FFC107', borderColor: '#FFC107', color: '#fff' }}
            onClick={handleEdit}
          >
            Modifier
          </Button>
          <Button
            variant={election.statut === 'ferme' ? 'success' : isPublishable(election.enddate, election.statut) ? 'success' : 'secondary'}
            className="rounded-pill me-2"
            onClick={() => handlePublish(election.id)}
            disabled={election.statut === 'ferme' || !isPublishable(election.enddate, election.statut) || !election.listeCandidats?.candidats?.length}
          >
            {election.statut === 'ferme' ? 'Publié' : 'Publier résultat'}
          </Button>
          <Button
            variant="danger"
            className="rounded-pill"
            style={{ backgroundColor: '#DC3545', borderColor: '#DC3545' }}
            onClick={() => handleDeleteConfirm(election?.id)}
          >
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  );
}