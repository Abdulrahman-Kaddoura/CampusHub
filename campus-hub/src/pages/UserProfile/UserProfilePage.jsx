import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getUserById } from "../../api/users.jsx";
import { getReviewsForUser } from "../../api/reviews.js";
import Avatar from "../../components/Avatar/Avatar";
import { useAuth } from "../../context/AuthContext";
import "./UserProfilePage.css";

function StarDisplay({ rating }) {
  return (
    <span className="up-stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`up-star${s <= rating ? " filled" : ""}`}>&#9733;</span>
      ))}
    </span>
  );
}

function AverageRating({ reviews }) {
  if (!reviews.length) return null;
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return (
    <div className="up-avg-rating">
      <StarDisplay rating={Math.round(avg)} />
      <span className="up-avg-number">{avg.toFixed(1)}</span>
      <span className="up-avg-count">({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
    </div>
  );
}

export default function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();

  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError("");
    Promise.all([
      getUserById(userId),
      getReviewsForUser(userId),
    ])
      .then(([userData, reviewData]) => {
        setUser(userData);
        setReviews(Array.isArray(reviewData) ? reviewData : []);
      })
      .catch((err) => setError(err.message || "Could not load profile."))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return <main className="up-page"><p className="up-loading">Loading profile...</p></main>;
  }

  if (error) {
    return (
      <main className="up-page">
        <p className="up-error">{error}</p>
        <Link to="/" className="up-back-link">← Back to marketplace</Link>
      </main>
    );
  }

  if (!user) return null;

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.username;

  const handleChat = () => {
    navigate(`/chat?partner=${userId}`);
  };

  return (
    <main className="up-page">
      <section className="up-card">
        <div className="up-header">
          <Avatar userId={userId} name={fullName} size="lg" />
          <div className="up-info">
            <h1 className="up-name">{fullName}</h1>
            <p className="up-username">@{user.username}</p>
            <AverageRating reviews={reviews} />
          </div>
        </div>

        <div className="up-actions">
          {isOwnProfile ? (
            <Link to="/profile" className="up-btn up-btn-secondary">Edit My Profile</Link>
          ) : (
            <>
              {isAuthenticated && (
                <button className="up-btn up-btn-primary" onClick={handleChat}>
                  Chat with {user.firstName || user.username}
                </button>
              )}
            </>
          )}
          <Link to="/" className="up-back-link">← Back to marketplace</Link>
        </div>
      </section>

      <section className="up-card">
        <h2 className="up-reviews-title">
          Reviews Received
          {reviews.length > 0 && <span className="up-reviews-count">{reviews.length}</span>}
        </h2>

        {reviews.length === 0 ? (
          <p className="up-no-reviews">No reviews yet.</p>
        ) : (
          <ul className="up-reviews-list">
            {reviews.map((r) => (
              <li key={r.reviewId} className="up-review-item">
                <div className="up-review-header">
                  <StarDisplay rating={r.rating} />
                  <span className="up-review-listing">for &ldquo;{r.listingTitle}&rdquo;</span>
                  <span className="up-review-date">
                    {new Date(r.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                </div>
                {r.comment && <p className="up-review-comment">{r.comment}</p>}
                <p className="up-review-by">— {r.reviewerName}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
