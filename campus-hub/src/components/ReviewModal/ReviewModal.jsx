import { useState } from "react";
import { createReview } from "../../api/reviews";
import "./ReviewModal.css";

export default function ReviewModal({ listingId, listingTitle, sellerName, token, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await createReview({ listingId, rating, comment: comment.trim() || null }, token);
      onSubmitted?.();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-modal-overlay" role="dialog" aria-modal="true" aria-label="Review seller">
      <div className="review-modal">
        <button className="review-modal-close" onClick={onClose} aria-label="Close">&times;</button>
        <h2 className="review-modal-title">Rate Your Transaction</h2>
        {listingTitle && (
          <p className="review-modal-item">
            <span className="review-modal-label">Item:</span> {listingTitle}
          </p>
        )}
        {sellerName && (
          <p className="review-modal-item">
            <span className="review-modal-label">Seller:</span> {sellerName}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="review-stars-row" role="group" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`review-star${star <= (hovered || rating) ? " filled" : ""}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                aria-label={`${star} star${star !== 1 ? "s" : ""}`}
              >
                &#9733;
              </button>
            ))}
          </div>
          <p className="review-rating-label">
            {rating > 0 ? ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating] : "Select a rating"}
          </p>

          <label className="review-comment-label">
            Comment (optional)
            <textarea
              className="review-comment-input"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this seller..."
              maxLength={1000}
              rows={3}
            />
          </label>

          {error && <p className="review-error">{error}</p>}

          <div className="review-modal-actions">
            <button type="submit" className="review-submit-btn" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            <button type="button" className="review-skip-btn" onClick={onClose}>
              Skip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
