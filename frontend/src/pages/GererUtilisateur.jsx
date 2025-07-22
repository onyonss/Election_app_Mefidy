import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Modal, Table, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUsers, FaFileImport, FaFileExport } from 'react-icons/fa';
import MainLayout from '../components/MainLayout.jsx';
import Sidebar from '../components/Sidebar.jsx';
import SearchBar from '../components/SearchBar.jsx';
import NotificationAlert from '../components/NotificationAlert.jsx';
import PageHeader from '../components/PageHeader.jsx';
import api from '../api';

export default function GererUtilisateur() {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/api/users/');
        const userData = Array.isArray(response.data) ? response.data : [];
        setUsers(userData);
        setFilteredUsers(userData);
      } catch (error) {
        setNotification('Erreur lors du chargement des utilisateurs.');
        setTimeout(() => setNotification(null), 3000);
      }
    };
    fetchUsers();
    if (location.state?.notification) {
      setNotification(location.state.notification);
      setTimeout(() => {
        setNotification(null);
        navigate(location.pathname, { replace: true, state: {} });
      }, 3000);
    }
  }, [location, navigate]);

  useEffect(() => {
    // Define mention order
    const mentionOrder = {
      'INFO': 1,
      'DIS': 2,
      'ECO': 3,
      'SA': 4,
      'ST': 5,
      'LEA': 6,
      'DROIT': 7
    };

    // Sort users by mention, classe, and matricule
    const sortedUsers = [...users].sort((a, b) => {
      // Sort by mention
      const mentionA = mentionOrder[a.mention] || 999;
      const mentionB = mentionOrder[b.mention] || 999;
      if (mentionA !== mentionB) {
        return mentionA - mentionB;
      }

      // Sort by classe
      const classeA = a.classe || 999;
      const classeB = b.classe || 999;
      if (classeA !== classeB) {
        return classeA - classeB;
      }

      // Sort by matricule
      const matriculeA = a.matricule || '';
      const matriculeB = b.matricule || '';
      return matriculeA.localeCompare(matriculeB);
    });

    // Apply search filter
    setFilteredUsers(
      sortedUsers.filter(u => u.nom.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, users]);

  const handleEdit = (user) => navigate(`/admin/users/${user.id}/edit`);
  const handleShowDetails = (user) => navigate(`/admin/users/${user.id}/details`);
  const handleDeleteConfirm = (id) => {
    setDeleteUserId(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/users/${deleteUserId}/`);
      setUsers(users.filter(u => u.id !== deleteUserId));
      setFilteredUsers(filteredUsers.filter(u => u.id !== deleteUserId));
      setShowDeleteConfirm(false);
      setNotification('Utilisateur supprimé avec succès !');
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification('Erreur lors de la suppression de l’utilisateur.');
      setTimeout(() => setNotification(null), 3000);
    }
  };


const handleFileUpload = async (event) => {
  console.log('File upload triggered');
  const file = event.target.files[0];
  console.log('File:', file?.name);
  if (!file) return;
  const formData = new FormData();
  formData.append('file', file);
  try {
    console.log('Sending request');
    const response = await api.post('/api/users/import/', formData);
    setNotification(response.data.message);
    const responseUsers = await api.get('/api/users/');
    console.log('Fetched users:', responseUsers.data); // Log fetched data
    const userData = Array.isArray(responseUsers.data) ? responseUsers.data : [];
    setUsers(userData);
    setFilteredUsers(userData);
    setTimeout(() => setNotification(null), 3000);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    setNotification(error.response?.data?.error || 'Import failed');
    setTimeout(() => setNotification(null), 3000);
  } finally {
    fileInputRef.current.value = '';
  }
};


const handleImportClick = () => {
  console.log('Import button clicked, triggering file input');
  fileInputRef.current.click();
};

  const getClasseLabel = (classe) => {
    const classes = { 1: 'L1', 2: 'L2', 3: 'L3', 4: 'M1', 5: 'M2' };
    return classes[classe] || 'Inconnu';
  };

  const getMentionLabel = (mention) => {
    const mentions = {
      INFO: 'INFO',
      SA: 'SA',
      ECO: 'ECO',
      LEA: 'LEA',
      ST: 'ST',
      DROIT: 'DROIT',
    };
    return mentions[mention] || 'Inconnu';
  };

  const exportToExcel = async () => {
    try {
      const response = await api.get('/api/users/export-excel/', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'users.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
      setNotification('Exportation Excel réussie.');
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification('Erreur lors de l’exportation Excel.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <MainLayout sidebar={Sidebar}>
      <SearchBar
        placeholder="Rechercher les utilisateurs..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />
      <NotificationAlert message={notification} onClose={() => setNotification(null)} />
      <PageHeader title="Gérer les utilisateurs" icon={FaUsers} />
      <div className="bg-white p-4 rounded shadow-sm">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3 gap-2">
          <div>
            <Link to="/admin/users/create">
              <Button
                variant="primary"
                className="rounded-pill py-2 me-2"
                style={{ backgroundColor: '#0F83DA', borderColor: '#0F83DA', fontSize: '1rem' }}
              >
                Ajouter un utilisateur
              </Button>
            </Link>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              ref={fileInputRef}
            />
            <Button
              variant="primary"
              className="rounded-pill py-2"
              style={{ backgroundColor: '#0F83DA', borderColor: '#0F83DA', fontSize: '1rem' }}
              onClick={handleImportClick}
            >
              <FaFileImport className="me-1" /> Importer Excel
            </Button>
          </div>
          <Button variant="outline-secondary" size="sm" onClick={exportToExcel}>
            <FaFileExport className="me-1" /> Exporter Excel
          </Button>
        </div>
        <h5 className="mb-3" style={{ color: '#0F83DA' }}>Informations utilisateurs</h5>
        {filteredUsers.length === 0 ? (
          <p>Aucun utilisateur trouvé.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <Table hover style={{ border: 'none' }}>
              <thead>
                <tr>
                  <th style={{ border: 'none', width: '12%', maxWidth: '80px' }}>Matricule</th>
                  <th style={{ border: 'none', width: '10%', maxWidth: '60px' }}>Classe</th>
                  <th style={{ border: 'none', width: '20%', maxWidth: '120px' }}>Nom</th>
                  <th style={{ border: 'none', width: '20%', maxWidth: '120px' }}>Prénom</th>
                  
                  <th style={{ border: 'none', width: '10%', maxWidth: '60px' }}>Mention</th>
                  <th style={{ border: 'none', width: '28%', maxWidth: '200px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} style={{ border: 'none', height: '40px' }}>
                    <td
                      style={{
                        border: 'none',
                        maxWidth: '80px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        padding: '4px 6px',
                        lineHeight: '1.5',
                      }}
                      title={user.matricule}
                    >
                      {user.matricule}
                    </td>
                    <td
                      style={{
                        border: 'none',
                        maxWidth: '60px',
                        padding: '4px 6px',
                        lineHeight: '1.5',
                      }}
                    >
                      {getClasseLabel(user.classe)}
                    </td>
                    <td
                      style={{
                        border: 'none',
                        maxWidth: '120px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        padding: '4px 6px',
                        lineHeight: '1.5',
                      }}
                      title={user.nom}
                    >
                      {user.nom}
                    </td>
                    <td
                      style={{
                        border: 'none',
                        maxWidth: '120px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        padding: '4px 6px',
                        lineHeight: '1.5',
                      }}
                      title={user.username}
                    >
                      {user.username}
                    </td>
                    
                    <td
                      style={{
                        border: 'none',
                        maxWidth: '60px',
                        padding: '4px 6px',
                        lineHeight: '1.5',
                      }}
                    >
                      {getMentionLabel(user.mention)}
                    </td>
                    <td
                      style={{
                        border: 'none',
                        maxWidth: '200px',
                        whiteSpace: 'nowrap',
                        padding: '4px 6px',
                        lineHeight: '1.5',
                      }}
                    >
                      <Button
                        variant="outline-primary"
                        className="rounded-pill me-1"
                        size="sm"
                        onClick={() => handleShowDetails(user)}
                      >
                        Détails
                      </Button>
                      <Button
                        variant="outline-warning"
                        className="rounded-pill me-1"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="outline-danger"
                        className="rounded-pill"
                        size="sm"
                        onClick={() => handleDeleteConfirm(user.id)}
                      >
                        Supprimer
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ color: '#DC3545' }}>
            Êtes-vous sûr de vouloir supprimer {users.find(u => u.id === deleteUserId)?.nom || 'cet utilisateur'} ?
          </p>
          <p>Cette action ne peut pas être annulée.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Annuler</Button>
          <Button variant="danger" onClick={handleDelete}>Supprimer</Button>
        </Modal.Footer>
      </Modal>
      <style jsx>{`
        .btn-primary:hover {
          background-color: #fff !important;
          color: #0F83DA !important;
          border-color: #0F83DA !important;
        }
        .btn-outline-secondary:hover {
          background-color: #6c757d !important;
          color: #fff !important;
        }
        table {
          width: 100%;
          table-layout: auto;
        }
        th, td {
          text-align: left;
          vertical-align: middle;
        }
        .btn {
          padding: 0.15rem 0.4rem;
          font-size: 0.8rem;
        }
        @media (max-width: 768px) {
          h2 {
            font-size: 1.8rem;
          }
          .btn {
            font-size: 0.75rem;
            padding: 0.1rem 0.35rem;
          }
          th, td {
            font-size: 0.85rem;
          }
        }
        @media (max-width: 576px) {
          .d-flex {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .gap-2 {
            gap: 0.5rem !important;
          }
          th, td {
            font-size: 0.8rem;
          }
          .btn {
            font-size: 0.7rem;
            padding: 0.1rem 0.3rem;
          }
        }
      `}</style>
    </MainLayout>
  );
}