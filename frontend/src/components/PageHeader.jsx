import React from 'react';
import PropTypes from 'prop-types';

const PageHeader = ({ title, icon: Icon }) => (
  <h2 className="mb-4 d-flex align-items-center" style={{ color: '#0F83DA', fontSize: '2.5rem', fontFamily: 'Arial Rounded MT' }}>
    {Icon && <Icon className="me-2" style={{ fontSize: '1.5rem' }} />}
    {title || 'Sans titre'}
  </h2>
);

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.elementType,
};

PageHeader.defaultProps = {
  icon: null,
};

export default PageHeader;