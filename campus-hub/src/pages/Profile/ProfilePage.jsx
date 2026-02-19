import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./ProfilePage.css";

function ProfilePage() {
  const { currentUser, isAuthenticated, authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (authLoading) {
    return <div className="profile-page"><p>Loading profile...</p></div>;
  }

  if (!isAuthenticated) {
    return (
      <main className="profile-page">
        <section className="profile-card">
          <h1>My Profile</h1>
          <p className="profile-subtitle">Please sign in to view your profile.</p>
          <Link to="/auth" className="back-link">Go to login / register</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <section className="profile-card">
        <h1>My Profile</h1>
        <p className="profile-subtitle">Manage your account details.</p>

        <div className="profile-grid">
          <div>
            <span className="label">First Name</span>
            <p>{currentUser.firstName || "-"}</p>
          </div>
          <div>
            <span className="label">Last Name</span>
            <p>{currentUser.lastName || "-"}</p>
          </div>
          <div>
            <span className="label">Username</span>
            <p>{currentUser.username || "-"}</p>
          </div>
          <div>
            <span className="label">Email</span>
            <p>{currentUser.email || "-"}</p>
          </div>
          <div>
            <span className="label">Phone Number</span>
            <p>{currentUser.phoneNumber || "Not provided"}</p>
          </div>
          <div>
            <span className="label">Status</span>
            <p>{currentUser.status || "PENDING"}</p>
          </div>
        </div>

        <div className="profile-actions">
          <button
            type="button"
            className="edit-profile-btn"
            onClick={() => setIsEditing((previous) => !previous)}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
          <Link to="/" className="back-link">← Back to marketplace</Link>
        </div>

        {isEditing && (
          <p className="edit-note">Edit profile form will be added in the next step.</p>
        )}
      </section>
    </main>
  );
}

export default ProfilePage;
