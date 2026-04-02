import { useState } from "react";
import { deleteListing } from "../api/listings";
import { addItemToCart } from "../api/cart";
import { useAuth } from "../context/AuthContext";
import "./ProductCard.css";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1589998059171-988d451dfd0d?w=400&h=300&fit=crop";

export const ProductCard = ({ data, onDelete }) => {
  const { token, isAuthenticated, currentUser } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);

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
  const hasAuthToken = Boolean(token);
  const canAddToCart = Boolean(listingId && isAuthenticated && hasAuthToken && !isOwnListing);
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

  const handleAddToCart = async () => {
    if (!listingId || !isAuthenticated || !token) return;
    setCartMessage("");
    setIsAddingToCart(true);
    try {
      await addItemToCart(listingId, token);
      setCartMessage("Added to cart!");
    } catch (err) {
      setCartMessage(err.message || "Could not add to cart.");
    } finally {
      setIsAddingToCart(false);
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

        {canAddToCart ? (
          <button
            type="button"
            className="product-card-cart-btn"
            onClick={handleAddToCart}
            disabled={isAddingToCart}
          >
            {isAddingToCart ? "Adding..." : "Add to Cart"}
          </button>
        ) : null}
        {cartMessage ? <p className={cartMessage === "Added to cart!" ? "product-card-hint" : "product-card-error"}>{cartMessage}</p> : null}

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

        {!isAuthenticated || !hasAuthToken ? (
          <p className="product-card-hint">Login to add items to cart.</p>
        ) : null}

        {deleteError ? <p className="product-card-error">{deleteError}</p> : null}
      </div>
    </div>
  );
};
