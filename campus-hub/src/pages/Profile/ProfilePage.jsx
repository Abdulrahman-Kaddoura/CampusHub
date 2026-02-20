import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./ProfilePage.css";

function ProfilePage() {
  const { currentUser, isAuthenticated, authLoading, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    setFormValues({
      firstName: currentUser.firstName || "",
      lastName: currentUser.lastName || "",
      email: currentUser.email || "",
      phoneNumber: currentUser.phoneNumber || "",
    });
  }, [currentUser]);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormValues((previousValues) => ({
      ...previousValues,
      [name]: value,
    }));
  };

  const handleEditToggle = () => {
    setSaveMessage("");
    setIsEditing((previousState) => !previousState);
  };

  const handleCancel = () => {
    if (currentUser) {
      setFormValues({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        email: currentUser.email || "",
        phoneNumber: currentUser.phoneNumber || "",
      });
    }
    setSaveMessage("");
    setIsEditing(false);
  };

  const handleSave = () => {
    updateProfile(formValues);
    setSaveMessage("Profile updated successfully.");
    setIsEditing(false);
  };

  const fullName = [currentUser?.firstName, currentUser?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const profileOwnerName = fullName || currentUser?.username || "this user";
  const profilePrimaryContact = currentUser?.email || "No email on file";

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
        <div className="profile-header">
          <div>
            <h1>{profileOwnerName}&apos;s Profile</h1>
            <p className="profile-subtitle">Manage your account details. Contact: {profilePrimaryContact}</p>
          </div>
          <button type="button" className="profile-button" onClick={handleEditToggle}>
            {isEditing ? "Close Editor" : "Edit Profile"}
          </button>
        </div>

        {isEditing ? (
          <div className="profile-edit-grid">
            <label>
              First Name
              <input name="firstName" value={formValues.firstName} onChange={handleFieldChange} />
            </label>
            <label>
              Last Name
              <input name="lastName" value={formValues.lastName} onChange={handleFieldChange} />
            </label>
            <label>
              Email
              <input type="email" name="email" value={formValues.email} onChange={handleFieldChange} />
            </label>
            <label>
              Phone Number
              <input name="phoneNumber" value={formValues.phoneNumber} onChange={handleFieldChange} />
            </label>
            <div className="profile-actions">
              <button type="button" className="profile-button save" onClick={handleSave}>Save</button>
              <button type="button" className="profile-button secondary" onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        ) : (
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
        )}

        {saveMessage && <p className="save-message">{saveMessage}</p>}

        <Link to="/" className="back-link">← Back to marketplace</Link>
      </section>
    </main>
  );
}

export default ProfilePage;
