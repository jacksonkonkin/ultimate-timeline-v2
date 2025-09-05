import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import UserManagement from './UserManagement';
import AdminStats from './AdminStats';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const { getAllUsers, isAdmin, isLoading } = useAuthStore();

  useEffect(() => {
    if (isAdmin()) {
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await getAllUsers();
    if (!error && data) {
      setUsers(data);
    }
  };

  if (!isAdmin()) {
    return (
      <div className="admin-panel-unauthorized">
        <h2>🚫 Access Denied</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <h1>🛡️ Admin Panel</h1>
        <p>Manage users and system settings</p>
      </div>

      <div className="admin-panel-nav">
        <button 
          className={`admin-nav-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Statistics
        </button>
        <button 
          className={`admin-nav-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 User Management
        </button>
      </div>

      <div className="admin-panel-content">
        {activeTab === 'stats' && (
          <AdminStats users={users} />
        )}
        
        {activeTab === 'users' && (
          <UserManagement 
            users={users} 
            onUsersChange={fetchUsers}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default AdminPanel;