import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import * as Dialog from '@radix-ui/react-dialog';

const UserManagement = ({ users, onUsersChange, isLoading }) => {
  const [filter, setFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const { approveUser, rejectUser, updateUserRole, deleteUser } = useAuthStore();

  const handleApprove = async (userId) => {
    const { error } = await approveUser(userId);
    if (!error) {
      onUsersChange();
    }
  };

  const handleReject = async (userId) => {
    const { error } = await rejectUser(userId);
    if (!error) {
      onUsersChange();
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    const { error } = await updateUserRole(userId, newRole);
    if (!error) {
      onUsersChange();
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      const { error } = await deleteUser(userId);
      if (!error) {
        onUsersChange();
      }
    }
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    if (filter === 'pending') return user.user_status === 'pending';
    if (filter === 'approved') return user.user_status === 'approved';
    if (filter === 'rejected') return user.user_status === 'rejected';
    if (filter === 'admins') return user.role === 'admin';
    return true;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: { emoji: '⏳', class: 'status-pending' },
      approved: { emoji: '✅', class: 'status-approved' },
      rejected: { emoji: '❌', class: 'status-rejected' }
    };
    const badge = badges[status] || { emoji: '❓', class: 'status-unknown' };
    return (
      <span className={`user-status-badge ${badge.class}`}>
        {badge.emoji} {status}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    return (
      <span className={`user-role-badge ${role === 'admin' ? 'role-admin' : 'role-user'}`}>
        {role === 'admin' ? '👑' : '👤'} {role}
      </span>
    );
  };

  const openUserModal = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setSelectedUser(null);
    setShowUserModal(false);
  };

  return (
    <div className="user-management">
      <div className="user-management-header">
        <h2>User Management</h2>
        <div className="user-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({users.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({users.filter(u => u.user_status === 'pending').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approved ({users.filter(u => u.user_status === 'approved').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            Rejected ({users.filter(u => u.user_status === 'rejected').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'admins' ? 'active' : ''}`}
            onClick={() => setFilter('admins')}
          >
            Admins ({users.filter(u => u.role === 'admin').length})
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="user-management-loading">
          <p>⏳ Loading users...</p>
        </div>
      ) : (
        <div className="users-table">
          <div className="table-header">
            <div>User</div>
            <div>Status</div>
            <div>Role</div>
            <div>Joined</div>
            <div>Actions</div>
          </div>
          
          {filteredUsers.map(user => (
            <div key={user.id} className="table-row">
              <div className="user-info">
                <div className="user-avatar">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div>
                  <div className="user-name">{user.full_name || 'No name'}</div>
                  <div className="user-email">{user.email}</div>
                </div>
              </div>
              
              <div>
                {getStatusBadge(user.user_status)}
              </div>
              
              <div>
                {getRoleBadge(user.role)}
              </div>
              
              <div className="user-date">
                {new Date(user.created_at).toLocaleDateString()}
              </div>
              
              <div className="user-actions">
                <button 
                  className="action-btn view-btn"
                  onClick={() => openUserModal(user)}
                  title="View details"
                >
                  👁️
                </button>
                
                {user.user_status === 'pending' && (
                  <>
                    <button 
                      className="action-btn approve-btn"
                      onClick={() => handleApprove(user.id)}
                      title="Approve user"
                    >
                      ✅
                    </button>
                    <button 
                      className="action-btn reject-btn"
                      onClick={() => handleReject(user.id)}
                      title="Reject user"
                    >
                      ❌
                    </button>
                  </>
                )}
                
                {user.user_status === 'rejected' && (
                  <button 
                    className="action-btn approve-btn"
                    onClick={() => handleApprove(user.id)}
                    title="Approve user"
                  >
                    ✅
                  </button>
                )}
                
                <button 
                  className="action-btn delete-btn"
                  onClick={() => handleDelete(user.id)}
                  title="Delete user"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
          
          {filteredUsers.length === 0 && (
            <div className="no-users">
              <p>No users found matching the current filter.</p>
            </div>
          )}
        </div>
      )}

      {/* User Details Modal */}
      <Dialog.Root open={showUserModal} onOpenChange={setShowUserModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="user-modal-overlay" />
          <Dialog.Content className="user-modal-content">
            {selectedUser && (
              <>
                <Dialog.Title className="user-modal-title">
                  User Details
                </Dialog.Title>
                
                <div className="user-modal-body">
                  <div className="user-detail-section">
                    <h3>👤 Profile Information</h3>
                    <div className="user-detail-grid">
                      <div><strong>Name:</strong> {selectedUser.full_name || 'No name provided'}</div>
                      <div><strong>Email:</strong> {selectedUser.email}</div>
                      <div><strong>Status:</strong> {getStatusBadge(selectedUser.user_status)}</div>
                      <div><strong>Role:</strong> {getRoleBadge(selectedUser.role)}</div>
                      <div><strong>Joined:</strong> {new Date(selectedUser.created_at).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="user-detail-section">
                    <h3>📊 Trading Profile</h3>
                    <div className="user-detail-grid">
                      <div><strong>Starting Balance:</strong> ${selectedUser.starting_balance?.toLocaleString() || '100,000'}</div>
                      <div><strong>Current Balance:</strong> ${selectedUser.current_balance?.toLocaleString() || '100,000'}</div>
                      <div><strong>Total Trades:</strong> {selectedUser.total_trades || 0}</div>
                      <div><strong>Wins:</strong> {selectedUser.wins || 0}</div>
                      <div><strong>Losses:</strong> {selectedUser.losses || 0}</div>
                    </div>
                  </div>

                  <div className="user-detail-actions">
                    <h3>⚙️ Admin Actions</h3>
                    <div className="action-buttons">
                      <select 
                        value={selectedUser.role} 
                        onChange={(e) => {
                          handleRoleChange(selectedUser.id, e.target.value);
                          setSelectedUser({...selectedUser, role: e.target.value});
                        }}
                        className="role-select"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                      
                      <select 
                        value={selectedUser.user_status} 
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          if (newStatus === 'approved') handleApprove(selectedUser.id);
                          else if (newStatus === 'rejected') handleReject(selectedUser.id);
                          setSelectedUser({...selectedUser, user_status: newStatus});
                        }}
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>

                <Dialog.Close className="user-modal-close">
                  ×
                </Dialog.Close>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default UserManagement;