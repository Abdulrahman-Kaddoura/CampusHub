import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  fetchAdminDashboard,
  fetchAdminUsers,
  updateUserStatus,
  updateUserRole,
} from "../../api/admin";
import "./AdminPanel.css";

const USER_STATUSES = ["ACTIVE", "SUSPENDED", "BANNED", "PENDING", "DELETED"];
const USER_ROLES = ["STUDENT", "ADMIN"];

export default function AdminPanel() {
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAdminDashboard(token);
      setDashboard(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAdminUsers(token);
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "dashboard") loadDashboard();
    else if (activeTab === "users") loadUsers();
  }, [activeTab]);

  const handleStatusChange = async (userId, newStatus) => {
    setActionError("");
    try {
      const updated = await updateUserStatus(userId, newStatus, token);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setActionError("");
    try {
      const updated = await updateUserRole(userId, newRole, token);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err) {
      setActionError(err.message);
    }
  };

  return (
    <div className="admin-panel">
      <h1 className="admin-title">Admin Panel</h1>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          Dashboard
        </button>
        <button
          className={`admin-tab ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
      </div>

      {error && <p className="admin-error">{error}</p>}
      {actionError && <p className="admin-error">{actionError}</p>}
      {loading && <p className="admin-loading">Loading...</p>}

      {!loading && activeTab === "dashboard" && dashboard && (
        <div className="admin-dashboard">
          <div className="admin-stat-grid">
            <div className="admin-stat-card">
              <span className="stat-value">{dashboard.totalUsers}</span>
              <span className="stat-label">Total Users</span>
            </div>
            <div className="admin-stat-card stat-green">
              <span className="stat-value">{dashboard.activeUsers}</span>
              <span className="stat-label">Active Users</span>
            </div>
            <div className="admin-stat-card stat-yellow">
              <span className="stat-value">{dashboard.suspendedUsers}</span>
              <span className="stat-label">Suspended</span>
            </div>
            <div className="admin-stat-card stat-red">
              <span className="stat-value">{dashboard.bannedUsers}</span>
              <span className="stat-label">Banned</span>
            </div>
            <div className="admin-stat-card">
              <span className="stat-value">{dashboard.totalListings}</span>
              <span className="stat-label">Total Listings</span>
            </div>
            <div className="admin-stat-card stat-green">
              <span className="stat-value">{dashboard.activeListings}</span>
              <span className="stat-label">Active Listings</span>
            </div>
            <div className="admin-stat-card stat-blue">
              <span className="stat-value">{dashboard.soldListings}</span>
              <span className="stat-label">Sold Listings</span>
            </div>
          </div>
        </div>
      )}

      {!loading && activeTab === "users" && (
        <div className="admin-users">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Username</th>
                <th>Listings</th>
                <th>Status</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.username}</td>
                  <td>{user.listingCount}</td>
                  <td>
                    <select
                      value={user.status}
                      onChange={(e) => handleStatusChange(user.id, e.target.value)}
                      className={`admin-select status-${user.status?.toLowerCase()}`}
                    >
                      {USER_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="admin-select"
                    >
                      {USER_ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" className="admin-empty">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
