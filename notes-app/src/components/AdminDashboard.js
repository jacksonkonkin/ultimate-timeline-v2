import React, { useState, useEffect } from 'react';
import { authService } from '../utils/supabase';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
    try {
      setLoading(true);
      const adminStatus = await authService.isAdmin();
      setIsAdmin(adminStatus);

      if (adminStatus) {
        await loadUsers();
        await loadPendingUsers();
      } else {
        setError('Access denied: Admin privileges required');
      }
    } catch (err) {
      setError('Failed to load admin dashboard');
      console.error('Admin dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await authService.getAllUsers();
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const loadPendingUsers = async () => {
    try {
      const { data, error } = await authService.getPendingUsers();
      if (error) throw error;
      setPendingUsers(data || []);
    } catch (err) {
      console.error('Failed to load pending users:', err);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      setLoading(true);
      const { data, error } = await authService.approveUser(userId);
      if (error) throw error;
      
      await loadUsers();
      await loadPendingUsers();
      alert('User approved successfully!');
    } catch (err) {
      alert('Failed to approve user: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleRejectUser = async (userId) => {
    try {
      if (!window.confirm('Are you sure you want to reject this user?')) return;
      
      setLoading(true);
      const { data, error } = await authService.rejectUser(userId);
      if (error) throw error;
      
      await loadUsers();
      await loadPendingUsers();
      alert('User rejected successfully!');
    } catch (err) {
      alert('Failed to reject user: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setLoading(true);
      const { data, error } = await authService.updateUserRole(userId, newRole);
      if (error) throw error;
      
      await loadUsers();
      alert(`User role updated to ${newRole} successfully!`);
    } catch (err) {
      alert('Failed to update user role: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin && !loading) {
    return (
      <div className="admin-dashboard">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading admin dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      {/* Pending Users Section */}
      <section className="pending-users">
        <h2>Pending User Approvals ({pendingUsers.length})</h2>
        {pendingUsers.length === 0 ? (
          <p>No users pending approval</p>
        ) : (
          <div className="user-list">
            {pendingUsers.map(user => (
              <div key={user.id} className="user-card pending">
                <div className="user-info">
                  <h3>{user.email}</h3>
                  <p>Role: {user.role}</p>
                  <p>Status: <span className="status pending">{user.status}</span></p>
                  <p>Registered: {new Date(user.created_at).toLocaleDateString()}</p>
                </div>
                <div className="user-actions">
                  <button 
                    className="approve-btn" 
                    onClick={() => handleApproveUser(user.id)}
                    disabled={loading}
                  >
                    Approve
                  </button>
                  <button 
                    className="reject-btn" 
                    onClick={() => handleRejectUser(user.id)}
                    disabled={loading}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* All Users Section */}
      <section className="all-users">
        <h2>All Users ({users.length})</h2>
        <div className="user-list">
          {users.map(user => (
            <div key={user.id} className={`user-card ${user.status}`}>
              <div className="user-info">
                <h3>{user.email}</h3>
                <p>Status: <span className={`status ${user.status}`}>{user.status}</span></p>
                <p>Registered: {new Date(user.created_at).toLocaleDateString()}</p>
                {user.updated_at !== user.created_at && (
                  <p>Updated: {new Date(user.updated_at).toLocaleDateString()}</p>
                )}
              </div>
              <div className="user-actions">
                <select 
                  value={user.role} 
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  disabled={loading}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                {user.status === 'pending' && (
                  <>
                    <button 
                      className="approve-btn" 
                      onClick={() => handleApproveUser(user.id)}
                      disabled={loading}
                    >
                      Approve
                    </button>
                    <button 
                      className="reject-btn" 
                      onClick={() => handleRejectUser(user.id)}
                      disabled={loading}
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;