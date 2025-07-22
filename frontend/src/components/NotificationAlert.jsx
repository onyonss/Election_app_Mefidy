import React from 'react';
import { Alert, Button } from 'react-bootstrap';

const NotificationAlert = ({ message, variant = 'warning', onClose }) => {
  if (!message) return null;
  return (
    <Alert
      variant={variant}
      className="d-flex justify-content-between align-items-center mb-4 shadow-sm"
      style={{ position: 'relative', zIndex: 1000, borderRadius: '10px' }}
    >
      {message}
      <Button variant="close" onClick={onClose} />
    </Alert>
  );
};

export default NotificationAlert;