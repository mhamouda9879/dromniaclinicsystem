import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardType = () => {
    if (location.pathname.includes('reception')) return 'Reception';
    if (location.pathname.includes('doctor')) return 'Doctor';
    if (location.pathname.includes('waiting-room')) return 'Waiting Room';
    return 'Dashboard';
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <h1>OB/GYN Clinic System - {getDashboardType()}</h1>
          <div className="header-actions">
            {user && (
              <span className="user-info">
                {user.fullName || user.username} ({user.role})
              </span>
            )}
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
        <nav className="nav">
          <button
            onClick={() => navigate('/dashboard/reception')}
            className={location.pathname.includes('reception') ? 'active' : ''}
          >
            Reception
          </button>
          <button
            onClick={() => navigate('/dashboard/doctor')}
            className={location.pathname.includes('doctor') ? 'active' : ''}
          >
            Doctor
          </button>
          <button
            onClick={() => navigate('/dashboard/waiting-room')}
            className={location.pathname.includes('waiting-room') ? 'active' : ''}
          >
            Waiting Room
          </button>
        </nav>
      </header>
      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;

