import React from 'react';
import { Button } from 'react-bootstrap';

const ActionButtonGroup = ({ onDetails, onEdit, onDelete, detailsText = 'Détails', editText = 'Modifier', deleteText = 'Supprimer' }) => (
  <div className="d-flex gap-2">
    {onDetails && (
      <Button
        variant="outline-primary"
        className="rounded-pill"
        size="sm"
        onClick={onDetails}
      >
        {detailsText}
      </Button>
    )}
    {onEdit && (
      <Button
        variant="outline-warning"
        className="rounded-pill"
        size="sm"
        onClick={onEdit}
      >
        {editText}
      </Button>
    )}
    {onDelete && (
      <Button
        variant="outline-danger"
        className="rounded-pill"
        size="sm"
        onClick={onDelete}
      >
        {deleteText}
      </Button>
    )}
  </div>
);

export default ActionButtonGroup;