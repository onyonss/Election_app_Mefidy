import React from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';

export default function SearchBar({ placeholder, value, onChange }) {
  return (
    <InputGroup
      className="mb-4 w-100 w-md-75 w-lg-50 mx-auto"
      style={{ borderRadius: '15px', overflow: 'hidden' }}
    >
      <InputGroup.Text
        style={{ backgroundColor: '#fff', border: 'none', padding: '0.5rem' }}
      >
        <FaSearch />
      </InputGroup.Text>
      <Form.Control
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          border: 'none',
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          height: 'auto',
        }}
      />
      <style jsx>{`
        @media (max-width: 768px) {
          .input-group {
            font-size: 0.9rem !important;
            padding: 0.8rem !important;
          }
        }
        @media (max-width: 576px) {
          .input-group {
            max-width: 100% !important;
          }
        }
      `}</style>
    </InputGroup>
  );
}
