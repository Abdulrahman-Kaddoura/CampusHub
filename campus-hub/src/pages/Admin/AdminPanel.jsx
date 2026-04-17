import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  fetchAdminDashboard,
  fetchAdminUsers,
  updateUserStatus,
  updateUserRole,
  adminDeleteUser,
  adminBanUserByEmail,
  fetchAdminListings,
  adminDeleteListing,
  adminUpdateListing,
  fetchAdminDorms,
  adminDeleteDorm,
  adminUpdateDorm,
  fetchAdminTutoring,
  adminDeleteTutoring,
  adminUpdateTutoring,
  fetchAdminCourseExchanges,
  adminDeleteCourseExchange,
  adminUpdateCourseExchange,
} from "../../api/admin";
import "./AdminPanel.css";

const USER_STATUSES = ["ACTIVE", "SUSPENDED", "BANNED", "PENDING", "DELETED"];
const USER_ROLES = ["STUDENT", "ADMIN"];
const LISTING_STATUSES = ["PUBLISHED", "DRAFT", "SOLD", "ARCHIVED"];
const POST_TABS = ["listings", "housing", "tutoring", "courseExchange"];
const POST_TAB_LABELS = {
  listings: "Marketplace",
  housing: "Housing",
  tutoring: "Tutoring",
  courseExchange: "Course Exchange",
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ value, label, color }) {
  return (
    <div className={`admin-stat-card ${color ? `stat-${color}` : ""}`}>
      <span className="stat-value">{value ?? "—"}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ title, fields, values, onSave, onClose }) {
  const [form, setForm] = useState({ ...values });

  const handleChange = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{title}</h3>
        {fields.map(({ key, label, type, options }) => (
          <div key={key} className="modal-field">
            <label className="modal-label">{label}</label>
            {type === "select" ? (
              <select
                className="modal-input"
                value={form[key] ?? ""}
                onChange={(e) => handleChange(key, e.target.value)}
              >
                {options.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            ) : type === "textarea" ? (
              <textarea
                className="modal-input modal-textarea"
                value={form[key] ?? ""}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            ) : (
              <input
                className="modal-input"
                type={type || "text"}
                value={form[key] ?? ""}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            )}
          </div>
        ))}
        <div className="modal-actions">
          <button className="modal-btn modal-btn-save" onClick={() => onSave(form)}>
            Save
          </button>
          <button className="modal-btn modal-btn-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminPanel() {
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState("analytics");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  // Analytics
  const [dashboard, setDashboard] = useState(null);

  // Users
  const [users, setUsers] = useState([]);
  const [banEmail, setBanEmail] = useState("");
  const [banLoading, setBanLoading] = useState(false);

  // Posts
  const [activePostTab, setActivePostTab] = useState("listings");
  const [listings, setListings] = useState([]);
  const [dorms, setDorms] = useState([]);
  const [tutoring, setTutoring] = useState([]);
  const [courseExchanges, setCourseExchanges] = useState([]);
  const [postsLoaded, setPostsLoaded] = useState({
    listings: false, housing: false, tutoring: false, courseExchange: false,
  });

  // Edit modal
  const [editModal, setEditModal] = useState(null); // { type, id, fields, values }

  // ── Loaders ───────────────────────────────────────────────────────────────

  const withLoading = async (fn) => {
    setLoading(true);
    setError("");
    try {
      await fn();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "analytics") {
      withLoading(async () => {
        const data = await fetchAdminDashboard(token);
        setDashboard(data);
      });
    } else if (activeTab === "users") {
      withLoading(async () => {
        const data = await fetchAdminUsers(token);
        setUsers(data);
      });
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "posts") return;
    loadPostTab(activePostTab);
  }, [activeTab, activePostTab]);

  const loadPostTab = async (tab) => {
    if (postsLoaded[tab]) return;
    await withLoading(async () => {
      if (tab === "listings") {
        const data = await fetchAdminListings(token);
        setListings(data);
      } else if (tab === "housing") {
        const data = await fetchAdminDorms(token);
        setDorms(data);
      } else if (tab === "tutoring") {
        const data = await fetchAdminTutoring(token);
        setTutoring(data);
      } else if (tab === "courseExchange") {
        const data = await fetchAdminCourseExchanges(token);
        setCourseExchanges(data);
      }
      setPostsLoaded((prev) => ({ ...prev, [tab]: true }));
    });
  };

  // ── User Actions ──────────────────────────────────────────────────────────

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

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Permanently delete this user and all their content? This cannot be undone.")) return;
    setActionError("");
    try {
      await adminDeleteUser(userId, token);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleBanByEmail = async (e) => {
    e.preventDefault();
    if (!banEmail.trim()) return;
    setBanLoading(true);
    setActionError("");
    try {
      const updated = await adminBanUserByEmail(banEmail.trim(), token);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setBanEmail("");
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBanLoading(false);
    }
  };

  // ── Post Delete ───────────────────────────────────────────────────────────

  const handleDeletePost = async (type, id) => {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    setActionError("");
    try {
      if (type === "listing") {
        await adminDeleteListing(id, token);
        setListings((prev) => prev.filter((l) => l.listingId !== id));
      } else if (type === "dorm") {
        await adminDeleteDorm(id, token);
        setDorms((prev) => prev.filter((d) => d.dormId !== id));
      } else if (type === "tutoring") {
        await adminDeleteTutoring(id, token);
        setTutoring((prev) => prev.filter((t) => t.tutoringId !== id));
      } else if (type === "courseExchange") {
        await adminDeleteCourseExchange(id, token);
        setCourseExchanges((prev) => prev.filter((c) => c.courseExchangeId !== id));
      }
    } catch (err) {
      setActionError(err.message);
    }
  };

  // ── Post Edit Save ────────────────────────────────────────────────────────

  const handleEditSave = async (form) => {
    setActionError("");
    const { type, id } = editModal;
    try {
      if (type === "listing") {
        const updated = await adminUpdateListing(id, form, token);
        setListings((prev) => prev.map((l) => (l.listingId === id ? updated : l)));
      } else if (type === "dorm") {
        const updated = await adminUpdateDorm(id, form, token);
        setDorms((prev) => prev.map((d) => (d.dormId === id ? updated : d)));
      } else if (type === "tutoring") {
        const updated = await adminUpdateTutoring(id, form, token);
        setTutoring((prev) => prev.map((t) => (t.tutoringId === id ? updated : t)));
      } else if (type === "courseExchange") {
        const updated = await adminUpdateCourseExchange(id, form, token);
        setCourseExchanges((prev) => prev.map((c) => (c.courseExchangeId === id ? updated : c)));
      }
      setEditModal(null);
    } catch (err) {
      setActionError(err.message);
    }
  };

  // ── Edit Modal Openers ────────────────────────────────────────────────────

  const openEditListing = (listing) => {
    setEditModal({
      type: "listing",
      id: listing.listingId,
      title: "Edit Listing",
      fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "price", label: "Price", type: "number" },
        { key: "status", label: "Status", type: "select", options: LISTING_STATUSES },
      ],
      values: {
        title: listing.title,
        description: listing.description,
        price: listing.price,
        status: listing.status,
      },
    });
  };

  const openEditDorm = (dorm) => {
    setEditModal({
      type: "dorm",
      id: dorm.dormId,
      title: "Edit Housing Post",
      fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "location", label: "Location", type: "text" },
        { key: "roomType", label: "Room Type", type: "text" },
        { key: "monthlyRent", label: "Monthly Rent", type: "number" },
        { key: "availableFrom", label: "Available From", type: "date" },
      ],
      values: {
        title: dorm.title,
        description: dorm.description,
        location: dorm.location,
        roomType: dorm.roomType,
        monthlyRent: dorm.monthlyRent,
        availableFrom: dorm.availableFrom,
      },
    });
  };

  const openEditTutoring = (t) => {
    setEditModal({
      type: "tutoring",
      id: t.tutoringId,
      title: "Edit Tutoring Post",
      fields: [
        { key: "course", label: "Course", type: "text" },
        { key: "tutorName", label: "Tutor Name", type: "text" },
        { key: "department", label: "Department", type: "text" },
        { key: "format", label: "Format", type: "text" },
        { key: "hourlyRate", label: "Hourly Rate", type: "number" },
        { key: "description", label: "Description", type: "textarea" },
      ],
      values: {
        course: t.course,
        tutorName: t.tutorName,
        department: t.department,
        format: t.format,
        hourlyRate: t.hourlyRate,
        description: t.description,
      },
    });
  };

  const openEditCourseExchange = (ce) => {
    setEditModal({
      type: "courseExchange",
      id: ce.courseExchangeId,
      title: "Edit Course Exchange Post",
      fields: [
        { key: "currentCourse", label: "Current Course", type: "text" },
        { key: "desiredCourse", label: "Desired Course", type: "text" },
        { key: "section", label: "Section", type: "text" },
        { key: "status", label: "Status", type: "text" },
        { key: "notes", label: "Notes", type: "textarea" },
      ],
      values: {
        currentCourse: ce.currentCourse,
        desiredCourse: ce.desiredCourse,
        section: ce.section,
        status: ce.status,
        notes: ce.notes,
      },
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="admin-panel">
      <h1 className="admin-title">Admin Panel</h1>

      <div className="admin-tabs">
        {["analytics", "users", "posts"].map((tab) => (
          <button
            key={tab}
            className={`admin-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {error && <p className="admin-error">{error}</p>}
      {actionError && <p className="admin-error">{actionError}</p>}
      {loading && <p className="admin-loading">Loading…</p>}

      {/* ── Analytics Tab ── */}
      {!loading && activeTab === "analytics" && dashboard && (
        <div className="admin-analytics">
          <section className="analytics-section">
            <h2 className="analytics-section-title">Users</h2>
            <div className="admin-stat-grid">
              <StatCard value={dashboard.totalUsers}     label="Total Users" />
              <StatCard value={dashboard.activeUsers}    label="Active"      color="green" />
              <StatCard value={dashboard.suspendedUsers} label="Suspended"   color="yellow" />
              <StatCard value={dashboard.bannedUsers}    label="Banned"      color="red" />
              <StatCard value={dashboard.pendingUsers}   label="Pending"     color="purple" />
              <StatCard value={dashboard.deletedUsers}   label="Deleted" />
            </div>
          </section>

          <section className="analytics-section">
            <h2 className="analytics-section-title">Marketplace Listings</h2>
            <div className="admin-stat-grid">
              <StatCard value={dashboard.totalListings}     label="Total" />
              <StatCard value={dashboard.publishedListings} label="Published" color="green" />
              <StatCard value={dashboard.soldListings}      label="Sold"      color="blue" />
              <StatCard value={dashboard.draftListings}     label="Draft"     color="yellow" />
              <StatCard value={dashboard.archivedListings}  label="Archived" />
            </div>
          </section>

          <section className="analytics-section">
            <h2 className="analytics-section-title">Other Posts</h2>
            <div className="admin-stat-grid">
              <StatCard value={dashboard.totalDormPosts}           label="Housing Posts"         color="blue" />
              <StatCard value={dashboard.totalTutoringPosts}       label="Tutoring Posts"        color="green" />
              <StatCard value={dashboard.totalCourseExchangePosts} label="Course Exchange Posts" color="purple" />
            </div>
          </section>
        </div>
      )}

      {/* ── Users Tab ── */}
      {!loading && activeTab === "users" && (
        <div className="admin-users">
          <form className="ban-by-email-form" onSubmit={handleBanByEmail}>
            <input
              type="email"
              className="modal-input ban-email-input"
              placeholder="Ban user by email…"
              value={banEmail}
              onChange={(e) => setBanEmail(e.target.value)}
            />
            <button type="submit" className="action-btn delete-btn" disabled={banLoading}>
              {banLoading ? "Banning…" : "Ban by Email"}
            </button>
          </form>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Username</th>
                <th>Listings</th>
                <th>Status</th>
                <th>Role</th>
                <th>Actions</th>
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
                  <td className="action-cell">
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="7" className="admin-empty">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Posts Tab ── */}
      {activeTab === "posts" && (
        <div className="admin-posts">
          <div className="post-subtabs">
            {POST_TABS.map((pt) => (
              <button
                key={pt}
                className={`post-subtab ${activePostTab === pt ? "active" : ""}`}
                onClick={() => setActivePostTab(pt)}
              >
                {POST_TAB_LABELS[pt]}
              </button>
            ))}
          </div>

          {!loading && activePostTab === "listings" && (
            <PostTable
              columns={["Title", "Category", "Price", "Status", "Posted By", "Created", "Actions"]}
              rows={listings}
              renderRow={(l) => (
                <tr key={l.listingId}>
                  <td>{l.title}</td>
                  <td>{l.categoryName}</td>
                  <td>${Number(l.price).toFixed(2)}</td>
                  <td><span className={`status-badge status-${l.status?.toLowerCase()}`}>{l.status}</span></td>
                  <td>{l.userName}</td>
                  <td>{l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "—"}</td>
                  <td className="action-cell">
                    <button className="action-btn edit-btn" onClick={() => openEditListing(l)}>Edit</button>
                    <button className="action-btn delete-btn" onClick={() => handleDeletePost("listing", l.listingId)}>Delete</button>
                  </td>
                </tr>
              )}
              emptyMsg="No marketplace listings found."
            />
          )}

          {!loading && activePostTab === "housing" && (
            <PostTable
              columns={["Title", "Location", "Room Type", "Monthly Rent", "Available From", "Posted By", "Actions"]}
              rows={dorms}
              renderRow={(d) => (
                <tr key={d.dormId}>
                  <td>{d.title}</td>
                  <td>{d.location}</td>
                  <td>{d.roomType}</td>
                  <td>${Number(d.monthlyRent).toFixed(2)}</td>
                  <td>{d.availableFrom}</td>
                  <td>{d.userName}</td>
                  <td className="action-cell">
                    <button className="action-btn edit-btn" onClick={() => openEditDorm(d)}>Edit</button>
                    <button className="action-btn delete-btn" onClick={() => handleDeletePost("dorm", d.dormId)}>Delete</button>
                  </td>
                </tr>
              )}
              emptyMsg="No housing posts found."
            />
          )}

          {!loading && activePostTab === "tutoring" && (
            <PostTable
              columns={["Course", "Tutor", "Department", "Format", "Rate/hr", "Posted By", "Actions"]}
              rows={tutoring}
              renderRow={(t) => (
                <tr key={t.tutoringId}>
                  <td>{t.course}</td>
                  <td>{t.tutorName}</td>
                  <td>{t.department}</td>
                  <td>{t.format}</td>
                  <td>${Number(t.hourlyRate).toFixed(2)}</td>
                  <td>{t.userName}</td>
                  <td className="action-cell">
                    <button className="action-btn edit-btn" onClick={() => openEditTutoring(t)}>Edit</button>
                    <button className="action-btn delete-btn" onClick={() => handleDeletePost("tutoring", t.tutoringId)}>Delete</button>
                  </td>
                </tr>
              )}
              emptyMsg="No tutoring posts found."
            />
          )}

          {!loading && activePostTab === "courseExchange" && (
            <PostTable
              columns={["Current Course", "Desired Course", "Section", "Status", "Posted By", "Actions"]}
              rows={courseExchanges}
              renderRow={(ce) => (
                <tr key={ce.courseExchangeId}>
                  <td>{ce.currentCourse}</td>
                  <td>{ce.desiredCourse}</td>
                  <td>{ce.section}</td>
                  <td>{ce.status}</td>
                  <td>{ce.userName}</td>
                  <td className="action-cell">
                    <button className="action-btn edit-btn" onClick={() => openEditCourseExchange(ce)}>Edit</button>
                    <button className="action-btn delete-btn" onClick={() => handleDeletePost("courseExchange", ce.courseExchangeId)}>Delete</button>
                  </td>
                </tr>
              )}
              emptyMsg="No course exchange posts found."
            />
          )}
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editModal && (
        <EditModal
          title={editModal.title}
          fields={editModal.fields}
          values={editModal.values}
          onSave={handleEditSave}
          onClose={() => setEditModal(null)}
        />
      )}
    </div>
  );
}

// ─── PostTable helper ──────────────────────────────────────────────────────────

function PostTable({ columns, rows, renderRow, emptyMsg }) {
  return (
    <div className="post-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(renderRow)}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="admin-empty">{emptyMsg}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
