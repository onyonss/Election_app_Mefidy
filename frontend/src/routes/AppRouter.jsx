import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import FirstLogin from '../pages/FirstLogin';
import AdminDashboard from '../pages/AdminDashboard';
import UserDashboard from '../pages/UserDashboard';
import ResultPageAdmin from '../pages/ResultPageAdmin';
import ResultPageUser from '../pages/ResultPageUser';
import GererUtilisateur from '../pages/GererUtilisateur';
import GererElection from '../pages/GererElection';
import UserCreate from '../pages/UserCreate';
import ElectionCreate from '../pages/ElectionCreate';
import ElectionDetails from '../pages/ElectionDetails';
import UserDetails from '../pages/UserDetails';
import UserEdit from '../pages/UserEdit';
import ElectionEdit from '../pages/ElectionEdit';
import ElectionResultDetails from '../pages/ElectionResultDetails';
import UserElectionPage from '../pages/UserElectionPage';
import UserElectionDetails from '../pages/UserElectionDetails';
import UserElectionResultDetails from '../pages/UserElectionResultDetails';
import UserVotePage from '../pages/UserVotePage';
import ListeCandidatsCreate from '../pages/ListeCandidatsCreate';
import UserProfile from '../pages/UserProfile';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/connexion" element={<Login />} />
        <Route path="/first-login" element={<FirstLogin />} />
        <Route path="/dashboard-admin" element={<AdminDashboard />} />
        <Route path="/dashboard-user" element={<UserDashboard />} />
        <Route path="/admin/resultats" element={<ResultPageAdmin />} />
        <Route path="/admin/results/:id/details" element={<ElectionResultDetails />} />
        <Route path="/user/resultats" element={<ResultPageUser />} />
        <Route path="/elections/:id/resultats" element={<UserElectionResultDetails />} />
        <Route path="/admin/users" element={<GererUtilisateur />} />
        <Route path="/admin/users/create" element={<UserCreate />} />
        <Route path="/admin/users/:id/details" element={<UserDetails />} />
        <Route path="/admin/users/:id/edit" element={<UserEdit />} />
        <Route path="/admin/users/:id/delete" element={<GererUtilisateur />} />
        <Route path="/admin/gererelections" element={<GererElection />} />
        <Route path="/admin/gererelections/create" element={<ElectionCreate />} />
        <Route path="/admin/gererelections/:id/details" element={<ElectionDetails />} />
        <Route path="/admin/gererelections/:id/edit" element={<ElectionEdit />} />
        <Route path="/admin/gererelections/:id/delete" element={<GererElection />} />
        <Route path="/elections" element={<UserElectionPage />} />
        <Route path="/elections/:id/details" element={<UserElectionDetails />} />
        <Route path="/elections/:id/vote" element={<UserVotePage />} />
        <Route path="/admin/listecandidats/create" element={<ListeCandidatsCreate />} />
        <Route path="/user/profile" element={<UserProfile />} />
      </Routes>
    </BrowserRouter>
  );
}