import React from 'react';

const AdminStats = ({ users }) => {
  const stats = {
    total: users.length,
    pending: users.filter(u => u.user_status === 'pending').length,
    approved: users.filter(u => u.user_status === 'approved').length,
    rejected: users.filter(u => u.user_status === 'rejected').length,
    admins: users.filter(u => u.role === 'admin').length,
    regular: users.filter(u => u.role === 'user').length
  };

  const recentUsers = users
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  return (
    <div className="admin-stats">
      <h2>📊 System Statistics</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending Approval</div>
          </div>
        </div>
        
        <div className="stat-card approved">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{stats.approved}</div>
            <div className="stat-label">Approved</div>
          </div>
        </div>
        
        <div className="stat-card rejected">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <div className="stat-number">{stats.rejected}</div>
            <div className="stat-label">Rejected</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👑</div>
          <div className="stat-content">
            <div className="stat-number">{stats.admins}</div>
            <div className="stat-label">Administrators</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <div className="stat-number">{stats.regular}</div>
            <div className="stat-label">Regular Users</div>
          </div>
        </div>
      </div>

      <div className="recent-users-section">
        <h3>🕐 Recent Registrations</h3>
        <div className="recent-users">
          {recentUsers.length > 0 ? (
            recentUsers.map(user => (
              <div key={user.id} className="recent-user-item">
                <div className="user-avatar">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div className="user-info">
                  <div className="user-name">{user.full_name || 'No name'}</div>
                  <div className="user-email">{user.email}</div>
                  <div className="user-date">{new Date(user.created_at).toLocaleDateString()}</div>
                </div>
                <div className="user-status">
                  <span className={`status-indicator ${user.user_status}`}>
                    {user.user_status === 'pending' && '⏳'}
                    {user.user_status === 'approved' && '✅'}
                    {user.user_status === 'rejected' && '❌'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p>No users registered yet.</p>
          )}
        </div>
      </div>

      <div className="system-info">
        <h3>🔧 System Information</h3>
        <div className="system-info-grid">
          <div><strong>Approval Rate:</strong> {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%</div>
          <div><strong>Pending Queue:</strong> {stats.pending} users</div>
          <div><strong>Active Users:</strong> {stats.approved} users</div>
          <div><strong>Admin Ratio:</strong> {stats.total > 0 ? Math.round((stats.admins / stats.total) * 100) : 0}%</div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;