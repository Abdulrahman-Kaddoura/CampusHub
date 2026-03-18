import { useState } from "react";
import { createStripeCheckoutSession, deleteListing } from "../api/listings";
import { useAuth } from "../context/AuthContext";
import "./ProductCard.css";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1589998059171-988d451dfd0d?w=400&h=300&fit=crop";

export const ProductCard = ({ data, onDelete }) => {
  const { token, isAuthenticated, currentUser } = useAuth();
  const [paymentError, setPaymentError] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const title = data.title ?? data.productName ?? "";
  const userName = data.userName ?? data.author ?? data.userId ?? "Campus seller";
  const price = data.price;
  const description = data.description ?? "";
  const imageUrl = data.imageUrl ?? data.productImage ?? FALLBACK_IMAGE;
  const discountPercent = data.discountPercent ?? null;

  const displayPrice =
    typeof price === "number" ? price.toFixed(2) : Number(price || 0).toFixed(2);

  const listingId = data.listingId;
  const isOwnListing = currentUser?.id && data.userId && currentUser.id === data.userId;
  const canPayWithStripe = Boolean(listingId && isAuthenticated && !isOwnListing);
  const canDelete = Boolean(isOwnListing && listingId && onDelete);

  const handleDelete = async () => {
    setDeleteError("");
    setIsDeleting(true);
    try {
      await deleteListing(listingId, token);
      onDelete(listingId);
    } catch (err) {
      setDeleteError(err.message || "Could not delete listing.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStripeCheckout = async () => {
    if (!listingId) {
      return;
    }

    setPaymentError("");
    setIsRedirecting(true);

    try {
      const baseUrl = window.location.origin;
      const session = await createStripeCheckoutSession(
        listingId,
        {
          successUrl: `${baseUrl}/?payment=success&listingId=${listingId}&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${baseUrl}/?payment=cancelled&listingId=${listingId}`,
        },
        token
      );

      if (!session?.checkoutUrl) {
        throw new Error("Stripe checkout URL is missing.");
      }

      window.location.assign(session.checkoutUrl);
    } catch (error) {
      setPaymentError(error.message || "Could not start Stripe checkout.");
      setIsRedirecting(false);
    }
  };

  return (
    <div className="product-card">
      <div className="product-card-image-wrap">
        <img src={imageUrl} alt={title} className="product-card-image" />
        {discountPercent != null && discountPercent > 0 && (
          <span className="product-card-badge">{discountPercent}% OFF</span>
        )}
      </div>
      <div className="product-card-info">
        <h4 className="product-card-title">{title}</h4>
        <p className="product-card-seller">Sold by {userName}</p>
        <p className="product-card-price">${displayPrice}</p>
        <p className="product-card-description">{description}</p>

        {canPayWithStripe ? (
          <button
            type="button"
            className="product-card-pay-btn"
            onClick={handleStripeCheckout}
            disabled={isRedirecting}
          >
            {isRedirecting ? "Redirecting..." : "Pay with Stripe"}
          </button>
        ) : null}

        {canDelete ? (
          <button
            type="button"
            className="product-card-delete-btn"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Listing"}
          </button>
        ) : null}

        {isOwnListing && !canDelete ? (
          <p className="product-card-hint">This is your listing.</p>
        ) : null}

        {!isAuthenticated ? (
          <p className="product-card-hint">Login to pay securely with Stripe.</p>
        ) : null}

        {paymentError ? <p className="product-card-error">{paymentError}</p> : null}
        {deleteError ? <p className="product-card-error">{deleteError}</p> : null}
      </div>
    </div>
  );
};
