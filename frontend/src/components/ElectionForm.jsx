import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import isEqual from 'lodash/isEqual';
import DatePicker from 'react-datepicker';
import moment from '../utils/momentConfig';
import api from '../api';
import 'react-datepicker/dist/react-datepicker.css';

export default function ElectionForm({ handleSubmit, electionData, isEdit, candidateLists, onCancel, handlePublish }) {
  const initialFormData = {
    nom: electionData?.nom || '',
    startDate: electionData?.startDate ? moment(electionData.startDate).format('DD/MM/YY HH:mm') : '',
    endDate: electionData?.endDate ? moment(electionData.endDate).format('DD/MM/YY HH:mm') : '',
    listeCandidats: electionData?.listeCandidats || null,
    allowed_voter_criteria: {
      classe: electionData?.allowed_voter_criteria?.classe?.map(String) || [],
      mention: electionData?.allowed_voter_criteria?.mention || [],
      activite: electionData?.allowed_voter_criteria?.activite || [],
      sport_type: electionData?.allowed_voter_criteria?.sport_type || [],
    },
    statut: electionData?.statut || 'ouvert',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedCandidates, setSelectedCandidates] = useState([]);

  useEffect(() => {
    setFormData(initialFormData);
  }, [electionData]);

  useEffect(() => {
    setIsFormChanged(!isEqual(formData, initialFormData));
  }, [formData]);

  useEffect(() => {
    if (formData.listeCandidats && candidateLists) {
      const selectedList = candidateLists.find(list => list.id === parseInt(formData.listeCandidats));
      setSelectedCandidates(selectedList?.candidats || []);
    } else {
      setSelectedCandidates([]);
    }
  }, [formData.listeCandidats, candidateLists]);

  useEffect(() => {
    if (!formData.allowed_voter_criteria.activite.includes('SPORT')) {
      setFormData(prev => ({
        ...prev,
        allowed_voter_criteria: {
          ...prev.allowed_voter_criteria,
          sport_type: [],
        },
      }));
    }
  }, [formData.allowed_voter_criteria.activite]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleDateChange = (date, name) => {
    setFormData({
      ...formData,
      [name]: date ? moment(date).format('DD/MM/YY HH:mm') : '',
    });
    setErrors({ ...errors, [name]: '' });
  };

  const handleSelectChange = (name, selectedOption) => {
    setFormData({
      ...formData,
      [name]: selectedOption ? selectedOption.value : null,
    });
    setErrors({ ...errors, [name]: '' });
  };

  const handleMultiSelectChange = (name, subName, selectedOptions) => {
    setFormData({
      ...formData,
      [name]: {
        ...formData[name],
        [subName]: selectedOptions ? selectedOptions.map(option => option.value) : [],
      },
    });
    setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nom.trim()) newErrors.nom = 'Le nom de l’élection est requis.';
    if (!formData.startDate) newErrors.startDate = 'La date de début est requise.';
    if (!formData.endDate) newErrors.endDate = 'La date de fin est requise.';
    if (!formData.listeCandidats) newErrors.listeCandidats = 'Veuillez sélectionner une liste de candidats.';
    if (formData.listeCandidats && selectedCandidates.length === 0) {
      newErrors.listeCandidats = 'La liste de candidats sélectionnée doit contenir au moins un candidat.';
    }
    if (formData.startDate && formData.endDate && moment(formData.startDate, 'DD/MM/YY HH:mm').isSameOrAfter(moment(formData.endDate, 'DD/MM/YY HH:mm'))) {
      newErrors.endDate = 'La date de fin doit être après la date de début.';
    }
    return newErrors;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    handleSubmit(formData);
  };

  const candidateListOptions = candidateLists.map(list => ({
    value: list.id,
    label: list.nom,
  }));

  const classeOptions = [
    { value: '1', label: 'L1' },
    { value: '2', label: 'L2' },
    { value: '3', label: 'L3' },
    { value: '4', label: 'M1' },
    { value: '5', label: 'M2' },
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
    { value: 'DANSE', label: 'Danse' },
    { value: 'SPORT', label: 'Sport' },
    { value: 'CHANT', label: 'Chant' },
    { value: 'DESSIN', label: 'Dessin' },
    { value: 'SLAM', label: 'Slam' },
  ];

  const sportTypeOptions = [
    { value: 'FOOT', label: 'Football' },
    { value: 'BASKET', label: 'Basketball' },
    { value: 'VOLLEY', label: 'Volleyball' },
    { value: 'PET', label: 'Pétanque' },
  ];

  const isPublishable = (endDate, statut) => {
    if (!endDate || statut === 'ferme') return false;
    const parsedEndDate = moment(endDate, 'DD/MM/YY HH:mm');
    const now = moment();
    return parsedEndDate.isValid() && parsedEndDate.isBefore(now);
  };

  return (
    <div className="p-4 bg-white rounded shadow-sm">
      <Form onSubmit={onSubmit}>
        <Row>
          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Nom de l’élection</Form.Label>
              <Form.Control
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                isInvalid={!!errors.nom}
                required
              />
              <Form.Control.Feedback type="invalid">{errors.nom}</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Date de début</Form.Label>
              <DatePicker
                selected={formData.startDate ? moment(formData.startDate, 'DD/MM/YY HH:mm').toDate() : null}
                onChange={(date) => handleDateChange(date, 'startDate')}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd/MM/yy HH:mm"
                className={`form-control ${errors.startDate ? 'is-invalid' : ''}`}
                placeholderText="jj/mm/aa hh:mm"
                required
              />
              <Form.Control.Feedback type="invalid">{errors.startDate}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Date de fin</Form.Label>
              <DatePicker
                selected={formData.endDate ? moment(formData.endDate, 'DD/MM/YY HH:mm').toDate() : null}
                onChange={(date) => handleDateChange(date, 'endDate')}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd/MM/yy HH:mm"
                className={`form-control ${errors.endDate ? 'is-invalid' : ''}`}
                placeholderText="jj/mm/aa hh:mm"
                required
              />
              <Form.Control.Feedback type="invalid">{errors.endDate}</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Liste de candidats</Form.Label>
              <Select
                options={candidateListOptions}
                value={candidateListOptions.find(option => option.value === parseInt(formData.listeCandidats)) || null}
                onChange={(selected) => handleSelectChange('listeCandidats', selected)}
                isClearable
                isInvalid={!!errors.listeCandidats}
              />
              {errors.listeCandidats && (
                <div className="invalid-feedback d-block">{errors.listeCandidats}</div>
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Candidats dans la liste sélectionnée</Form.Label>
              <Form.Control
                as="textarea"
                value={selectedCandidates.map(c => c.nom).join(', ') || 'Aucun candidat'}
                readOnly
                rows={3}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Classes autorisées</Form.Label>
              <Select
                isMulti
                options={classeOptions}
                value={classeOptions.filter(option => formData.allowed_voter_criteria.classe.includes(option.value))}
                onChange={(selected) => handleMultiSelectChange('allowed_voter_criteria', 'classe', selected)}
                isInvalid={!!errors.allowed_voter_criteria}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Mentions autorisées</Form.Label>
              <Select
                isMulti
                options={mentionOptions}
                value={mentionOptions.filter(option => formData.allowed_voter_criteria.mention.includes(option.value))}
                onChange={(selected) => handleMultiSelectChange('allowed_voter_criteria', 'mention', selected)}
                isInvalid={!!errors.allowed_voter_criteria}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Activités autorisées (facultatif)</Form.Label>
              <Select
                isMulti
                options={activiteOptions}
                value={activiteOptions.filter(option => formData.allowed_voter_criteria.activite.includes(option.value))}
                onChange={(selected) => handleMultiSelectChange('allowed_voter_criteria', 'activite', selected)}
                isInvalid={!!errors.allowed_voter_criteria}
              />
            </Form.Group>
          </Col>
          {formData.allowed_voter_criteria.activite.includes('SPORT') && (
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Types de sport autorisés</Form.Label>
                <Select
                  isMulti
                  options={sportTypeOptions}
                  value={sportTypeOptions.filter(option => formData.allowed_voter_criteria.sport_type.includes(option.value))}
                  onChange={(selected) => handleMultiSelectChange('allowed_voter_criteria', 'sport_type', selected)}
                  isInvalid={!!errors.allowed_voter_criteria}
                />
                {errors.allowed_voter_criteria && (
                  <div className="invalid-feedback d-block">{errors.allowed_voter_criteria}</div>
                )}
              </Form.Group>
            </Col>
          )}
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
              disabled={isEdit && !isFormChanged}
            >
              {isEdit ? 'Modifier' : 'Créer'}
            </Button>
            {isEdit && (
              <Button
                variant={formData.statut === 'ferme' ? 'success' : isPublishable(formData.endDate, formData.statut) ? 'success' : 'secondary'}
                className="rounded-pill me-2"
                onClick={() => handlePublish(electionData.id)}
                disabled={formData.statut === 'ferme' || !isPublishable(formData.endDate, formData.statut) || selectedCandidates.length === 0}
              >
                {formData.statut === 'ferme' ? 'Publié' : 'Publier résultat'}
              </Button>
            )}
          </div>
        </div>
      </Form>
      <style jsx>{`
        .shadow-sm {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .form-control {
          border: 1px solid #ced4da;
          border-radius: 0.25rem;
          padding: 0.375rem 0.75rem;
          font-size: 1rem;
          line-height: 1.5;
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        .form-control:focus {
          border-color: #80bdff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
          outline: 0;
        }
        .form-control.is-invalid {
          border-color: #dc3545;
        }
        .form-control.is-invalid:focus {
          box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
        }
        .react-datepicker-wrapper {
          width: 100%;
        }
        .react-datepicker__input-container input {
          width: 100%;
          border: 1px solid #ced4da;
          border-radius: 0.25rem;
          padding: 0.375rem 0.75rem;
          font-size: 1rem;
          line-height: 1.5;
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        .react-datepicker__input-container input:focus {
          border-color: #80bdff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
          outline: 0;
        }
        .react-datepicker__input-container input.is-invalid {
          border-color: #dc3545;
        }
        .react-datepicker__input-container input.is-invalid:focus {
          box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
        }
        .react-datepicker {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          border: 1px solid #ced4da;
          border-radius: 0.25rem;
        }
        .react-datepicker__header {
          background-color: #f8f9fa;
          border-bottom: 1px solid #ced4da;
        }
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected,
        .react-datepicker__time-list-item--selected {
          background-color: #007bff !important;
          color: #fff !important;
        }
        .react-datepicker__day:hover,
        .react-datepicker__time-list-item:hover {
          background-color: #e9ecef;
        }
        .btn-primary:hover {
          background-color: #005b99 !important;
          color: #fff !important;
        }
        .btn-secondary:hover {
          background-color: #6c757d !important;
          color: #fff !important;
        }
        .btn-success:hover {
          background-color: #218838 !important;
          color: #fff !important;
        }
        @media (max-width: 768px) {
          .p-4 {
            padding: 1.5rem !important;
          }
          .btn {
            font-size: 0.9rem;
            padding: 0.5rem 1rem;
          }
          .form-label {
            font-size: 0.9rem;
          }
          .form-control,
          .react-datepicker__input-container input {
            font-size: 0.9rem;
            padding: 0.3rem 0.6rem;
          }
        }
        @media (max-width: 576px) {
          .p-4 {
            padding: 1rem !important;
          }
          .mb-3 {
            margin-bottom: 0.75rem !important;
          }
        }
      `}</style>
    </div>
  );
}