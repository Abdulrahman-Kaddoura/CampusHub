import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { deleteProfilePicture, updateUserProfile, uploadProfilePicture } from "../../api/users.jsx";
import { fetchDormListingsByUser, updateDormListing, deleteDormListing } from "../../api/dorms.jsx";
import { fetchListingsByUser, updateListing, deleteListing } from "../../api/listings.jsx";
import { fetchCourseExchangePostsByUser, updateCourseExchangePost, deleteCourseExchangePost } from "../../api/courseExchange.jsx";
import Avatar from "../../components/Avatar/Avatar";
import { useAuth } from "../../context/AuthContext";
import "./ProfilePage.css";

function ProfilePage() {
  const { currentUser, token, isAuthenticated, authLoading, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [pictureError, setPictureError] = useState("");
  const [pictureLoading, setPictureLoading] = useState(false);
  const [avatarKey, setAvatarKey] = useState(0);
  const fileInputRef = useRef(null);
  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  // My Posts state
  const [postsTab, setPostsTab] = useState("listings");
  const [myListings, setMyListings] = useState([]);
  const [myDorms, setMyDorms] = useState([]);
  const [myCourseExchanges, setMyCourseExchanges] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState("");
  const [editingPost, setEditingPost] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    if (!currentUser) return;
    setFormValues({
      firstName: currentUser.firstName || "",
      lastName: currentUser.lastName || "",
      email: currentUser.email || "",
      phoneNumber: currentUser.phoneNumber || "",
    });
  }, [currentUser]);

  const loadMyPosts = useCallback(async () => {
    if (!currentUser?.id || !token) return;
    setPostsLoading(true);
    setPostsError("");
    try {
      const [listings, dorms, courseExchanges] = await Promise.all([
        fetchListingsByUser(currentUser.id, token).catch(() => []),
        fetchDormListingsByUser(currentUser.id, token).catch(() => []),
        fetchCourseExchangePostsByUser(currentUser.id, token).catch(() => []),
      ]);
      setMyListings(Array.isArray(listings) ? listings : []);
      setMyDorms(Array.isArray(dorms) ? dorms : []);
      setMyCourseExchanges(Array.isArray(courseExchanges) ? courseExchanges : []);
    } catch {
      setPostsError("Failed to load your posts.");
    } finally {
      setPostsLoading(false);
    }
  }, [currentUser?.id, token]);

  useEffect(() => {
    if (isAuthenticated) loadMyPosts();
  }, [isAuthenticated, loadMyPosts]);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = () => {
    setSaveMessage("");
    setIsEditing((prev) => !prev);
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

  const handleSave = async () => {
    setSaveMessage("");
    try {
      const updated = await updateUserProfile(formValues, token);
      updateProfile(updated);
      setSaveMessage("Profile updated successfully.");
      setIsEditing(false);
    } catch (err) {
      setSaveMessage(err.message || "Failed to update profile.");
    }
  };

  const handlePictureChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPictureError("");
    setPictureLoading(true);
    try {
      await uploadProfilePicture(file, token);
      setAvatarKey((k) => k + 1);
    } catch (err) {
      setPictureError(err.message || "Failed to upload picture.");
    } finally {
      setPictureLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeletePicture = async () => {
    setPictureError("");
    setPictureLoading(true);
    try {
      await deleteProfilePicture(token);
      setAvatarKey((k) => k + 1);
    } catch (err) {
      setPictureError(err.message || "Failed to remove picture.");
    } finally {
      setPictureLoading(false);
    }
  };

  const startEditPost = (post, type) => {
    setEditingPost({ id: post.listingId || post.dormId || post.courseExchangeId, type });
    setEditError("");
    if (type === "listing") {
      setEditForm({ title: post.title || "", description: post.description || "", price: post.price || "" });
    } else if (type === "dorm") {
      setEditForm({
        title: post.title || "",
        description: post.description || "",
        location: post.location || "",
        roomType: post.roomType || "",
        monthlyRent: post.monthlyRent || "",
        availableFrom: post.availableFrom || "",
      });
    } else if (type === "courseExchange") {
      setEditForm({
        currentCourse: post.currentCourse || "",
        desiredCourse: post.desiredCourse || "",
        section: post.section || "",
        status: post.status || "",
        notes: post.notes || "",
      });
    }
  };

  const cancelEditPost = () => {
    setEditingPost(null);
    setEditForm({});
    setEditError("");
  };

  const saveEditPost = async () => {
    if (!editingPost) return;
    setEditSaving(true);
    setEditError("");
    try {
      if (editingPost.type === "listing") {
        await updateListing(editingPost.id, {
          ...editForm,
          price: Number(editForm.price),
          userId: currentUser.id,
          categoryName: myListings.find(l => l.listingId === editingPost.id)?.categoryName || "Other",
        }, token);
      } else if (editingPost.type === "dorm") {
        await updateDormListing(editingPost.id, {
          ...editForm,
          monthlyRent: Number(editForm.monthlyRent),
          userId: currentUser.id,
        }, token);
      } else if (editingPost.type === "courseExchange") {
        await updateCourseExchangePost(editingPost.id, {
          ...editForm,
          userId: currentUser.id,
        }, token);
      }
      setEditingPost(null);
      setEditForm({});
      await loadMyPosts();
    } catch (err) {
      setEditError(err.message || "Failed to save changes.");
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeletePost = async (post, type) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      if (type === "listing") {
        await deleteListing(post.listingId, token);
      } else if (type === "dorm") {
        await deleteDormListing(post.dormId, token);
      } else if (type === "courseExchange") {
        await deleteCourseExchangePost(post.courseExchangeId, token);
      }
      await loadMyPosts();
    } catch (err) {
      setPostsError(err.message || "Failed to delete post.");
    }
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

  const isEditingPost = (post, type) => {
    const id = post.listingId || post.dormId || post.courseExchangeId;
    return editingPost?.id === id && editingPost?.type === type;
  };

  return (
    <main className="profile-page">
      <section className="profile-card">
        <div className="profile-avatar-section">
          <Avatar
            key={avatarKey}
            userId={currentUser?.id}
            name={profileOwnerName}
            size="lg"
          />
          <div className="profile-avatar-actions">
            <button
              type="button"
              className="profile-button avatar-upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={pictureLoading}
            >
              {pictureLoading ? "Uploading..." : "Change Photo"}
            </button>
            <button
              type="button"
              className="profile-button secondary avatar-remove-btn"
              onClick={handleDeletePicture}
              disabled={pictureLoading}
            >
              Remove
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePictureChange}
            />
          </div>
          {pictureError && <p className="picture-error">{pictureError}</p>}
        </div>

        <div className="profile-header">
          <div>
            <h1>{profileOwnerName}&apos;s Profile</h1>
            <p className="profile-subtitle">Contact: {profilePrimaryContact}</p>
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

      {/* My Posts section */}
      <section className="profile-card my-posts-card">
        <h2 className="my-posts-title">My Posts</h2>

        <div className="posts-tabs" role="tablist">
          <button
            role="tab"
            type="button"
            className={`posts-tab${postsTab === "listings" ? " active" : ""}`}
            onClick={() => setPostsTab("listings")}
          >
            Listings ({myListings.length})
          </button>
          <button
            role="tab"
            type="button"
            className={`posts-tab${postsTab === "dorms" ? " active" : ""}`}
            onClick={() => setPostsTab("dorms")}
          >
            Housing ({myDorms.length})
          </button>
          <button
            role="tab"
            type="button"
            className={`posts-tab${postsTab === "courseExchange" ? " active" : ""}`}
            onClick={() => setPostsTab("courseExchange")}
          >
            Course Exchange ({myCourseExchanges.length})
          </button>
        </div>

        {postsLoading && <p className="posts-empty">Loading your posts...</p>}
        {postsError && <p className="posts-error">{postsError}</p>}

        {!postsLoading && postsTab === "listings" && (
          <div className="posts-list">
            {myListings.length === 0 ? (
              <p className="posts-empty">You have no marketplace listings yet.</p>
            ) : myListings.map((post) => (
              <article key={post.listingId} className="post-item">
                {isEditingPost(post, "listing") ? (
                  <div className="post-edit-form">
                    <label>Title<input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} /></label>
                    <label>Description<input value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} /></label>
                    <label>Price ($)<input type="number" min="0" step="0.01" value={editForm.price} onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} /></label>
                    {editError && <p className="posts-error">{editError}</p>}
                    <div className="post-edit-actions">
                      <button type="button" className="profile-button save" onClick={saveEditPost} disabled={editSaving}>{editSaving ? "Saving..." : "Save"}</button>
                      <button type="button" className="profile-button secondary" onClick={cancelEditPost}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="post-item-info">
                      <strong>{post.title}</strong>
                      <span className="post-meta">${post.price} · {post.status}</span>
                      {post.description && <p className="post-desc">{post.description}</p>}
                    </div>
                    <div className="post-item-actions">
                      <button type="button" className="profile-button" onClick={() => startEditPost(post, "listing")}>Edit</button>
                      <button type="button" className="profile-button secondary" onClick={() => handleDeletePost(post, "listing")}>Delete</button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}

        {!postsLoading && postsTab === "dorms" && (
          <div className="posts-list">
            {myDorms.length === 0 ? (
              <p className="posts-empty">You have no housing listings yet.</p>
            ) : myDorms.map((post) => (
              <article key={post.dormId} className="post-item">
                {isEditingPost(post, "dorm") ? (
                  <div className="post-edit-form">
                    <label>Title<input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} /></label>
                    <label>Location<input value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} /></label>
                    <label>Room Type<input value={editForm.roomType} onChange={e => setEditForm(f => ({ ...f, roomType: e.target.value }))} /></label>
                    <label>Monthly Rent ($)<input type="number" min="0" step="0.01" value={editForm.monthlyRent} onChange={e => setEditForm(f => ({ ...f, monthlyRent: e.target.value }))} /></label>
                    <label>Available From<input type="date" value={editForm.availableFrom} onChange={e => setEditForm(f => ({ ...f, availableFrom: e.target.value }))} /></label>
                    <label>Description<input value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} /></label>
                    {editError && <p className="posts-error">{editError}</p>}
                    <div className="post-edit-actions">
                      <button type="button" className="profile-button save" onClick={saveEditPost} disabled={editSaving}>{editSaving ? "Saving..." : "Save"}</button>
                      <button type="button" className="profile-button secondary" onClick={cancelEditPost}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="post-item-info">
                      <strong>{post.title}</strong>
                      <span className="post-meta">{post.location} · ${post.monthlyRent}/mo · {post.roomType}</span>
                    </div>
                    <div className="post-item-actions">
                      <button type="button" className="profile-button" onClick={() => startEditPost(post, "dorm")}>Edit</button>
                      <button type="button" className="profile-button secondary" onClick={() => handleDeletePost(post, "dorm")}>Delete</button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}

        {!postsLoading && postsTab === "courseExchange" && (
          <div className="posts-list">
            {myCourseExchanges.length === 0 ? (
              <p className="posts-empty">You have no course exchange posts yet.</p>
            ) : myCourseExchanges.map((post) => (
              <article key={post.courseExchangeId} className="post-item">
                {isEditingPost(post, "courseExchange") ? (
                  <div className="post-edit-form">
                    <label>Current Course<input value={editForm.currentCourse} onChange={e => setEditForm(f => ({ ...f, currentCourse: e.target.value }))} /></label>
                    <label>Desired Course<input value={editForm.desiredCourse} onChange={e => setEditForm(f => ({ ...f, desiredCourse: e.target.value }))} /></label>
                    <label>Section<input value={editForm.section} onChange={e => setEditForm(f => ({ ...f, section: e.target.value }))} /></label>
                    <label>Status<input value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} /></label>
                    <label>Notes<input value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} /></label>
                    {editError && <p className="posts-error">{editError}</p>}
                    <div className="post-edit-actions">
                      <button type="button" className="profile-button save" onClick={saveEditPost} disabled={editSaving}>{editSaving ? "Saving..." : "Save"}</button>
                      <button type="button" className="profile-button secondary" onClick={cancelEditPost}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="post-item-info">
                      <strong>{post.currentCourse} → {post.desiredCourse}</strong>
                      <span className="post-meta">{post.section ? `Section: ${post.section} · ` : ""}{post.status}</span>
                      {post.notes && <p className="post-desc">{post.notes}</p>}
                    </div>
                    <div className="post-item-actions">
                      <button type="button" className="profile-button" onClick={() => startEditPost(post, "courseExchange")}>Edit</button>
                      <button type="button" className="profile-button secondary" onClick={() => handleDeletePost(post, "courseExchange")}>Delete</button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default ProfilePage;
