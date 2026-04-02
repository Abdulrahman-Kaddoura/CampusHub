import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import HeroCarousel from "../../components/HeroCarousel";
import { Section } from "../../components/ProductSection";
import { createListing } from "../../api/listings";
import { uploadListingImage } from "../../api/listingImage";
import { useAuth } from "../../context/AuthContext";
import { useMarketPlaceData } from "./useMarketPlaceData";
import "./MarketPlace.css";

const CATEGORY_OPTIONS = [
  "Electronics & Gadgets",
  "Books, Study & Office Supplies",
  "Furniture & Home Goods",
  "Clothing & Accessories",
  "Sports & Fitness",
  "Food & Groceries",
  "Beauty & Personal Care",
  "Tools & DIY",
  "Musical Instruments & Gear",
  "Games & Entertainment",
  "Pet Supplies",
  "Other",
];

const ITEMS_PER_SECTION = 4;

const CATEGORY_DISPLAY_NAMES = {
  "Books": "Books and Stationery",
  "Books, Study & Office Supplies": "Books and Stationery",
  "Clothing": "Clothing",
  "Clothing & Accessories": "Clothing",
  "Room Decor": "Room Decor",
  "Furniture & Home Goods": "Room Decor",
};
function getCategoryDisplayName(cat) {
  return CATEGORY_DISPLAY_NAMES[cat] ?? cat;
}

export default function MarketPlace() {
  const {
    items,
    categoriesWithItems,
    search,
    setSearch,
    apiError,
    refetch,
    aiSearchError,
    isAiSearching,
  } = useMarketPlaceData();
  const { currentUser, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    price: "",
    categoryName: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const currentUserId = currentUser?.id ?? currentUser?.userId ?? null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    if (!currentUserId) {
      setError("Could not detect your account ID. Please log out and log in again.");
      setIsSubmitting(false);
      return;
    }
    try {
      const payload = {
        title: formState.title,
        description: formState.description,
        price: Number(formState.price),
        categoryName: formState.categoryName,
        userId: currentUserId,
      };
      const created = await createListing(payload, token);
      if (imageFile && created?.listingId) {
        await uploadListingImage(created.listingId, imageFile, token);
      }
      setFormState({ title: "", description: "", price: "", categoryName: "" });
      setImageFile(null);
      setIsFormOpen(false);
      refetch();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="marketplace">
      <HeroCarousel />

      <h1 className="marketplace-page-title">Market Place</h1>
      <p className="marketplace-intro">
        Buy and sell essentials with the American University of Beirut (AUB) community, from
        textbooks to apartment basics.
      </p>

      <div className="marketplace-search-row">
        <div className="search-wrap">
          <span className="search-icon" aria-hidden>🔍</span>
          <input
            type="text"
            placeholder="Search books, room utilities and more..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        {isAuthenticated ? (
          <button
            className="add-item"
            type="button"
            onClick={() => setIsFormOpen(true)}
          >
            <span className="add-item-icon">+</span> Add Item
          </button>
        ) : (
          <Link className="add-item" to="/auth">
            Login to Add Item
          </Link>
        )}
      </div>



      {search.trim() ? (
        <p className="marketplace-ai-status" role="status">
          {isAiSearching
            ? "Searching with Hugging Face AI..."
            : aiSearchError
              ? `AI search unavailable (${aiSearchError}). Showing keyword matches instead.`
              : "Showing Hugging Face AI ranked results."}
        </p>
      ) : null}

      {isFormOpen && (
        <form className="listing-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              name="title"
              type="text"
              placeholder="Listing title"
              value={formState.title}
              onChange={handleChange}
              required
            />
            <select
              name="categoryName"
              value={formState.categoryName}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select a category</option>
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              name="price"
              type="number"
              step="0.01"
              placeholder="Price"
              value={formState.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <textarea
              name="description"
              placeholder="Description"
              value={formState.description}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <label className="listing-form-image-label">
              <span>Image (optional)</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                className="listing-form-image-input"
              />
              {imageFile ? (
                <span className="listing-form-image-name">{imageFile.name}</span>
              ) : (
                <span className="listing-form-image-hint">Choose a photo</span>
              )}
            </label>
          </div>
          <div className="form-actions">
            <button
              className="submit-listing"
              type="submit"
              disabled={isSubmitting || !currentUserId}
            >
              {isSubmitting ? "Saving..." : "Create Listing"}
            </button>
            <button
              className="cancel-listing"
              type="button"
              onClick={() => setIsFormOpen(false)}
            >
              Cancel
            </button>
          </div>
          {error ? <p className="form-error">{error}</p> : null}
        </form>
      )}

      {categoriesWithItems.map(([category, categoryItems]) => (
        <Section
          key={category}
          category={category}
          categoryDisplayName={getCategoryDisplayName(category)}
          items={categoryItems}
          search=""
          limit={ITEMS_PER_SECTION}
          showViewAll={true}
          onDelete={refetch}
        />
      ))}

      {items.length === 0 && !apiError && (
        <p className="marketplace-empty">No listings yet. Add an item to get started.</p>
      )}

      {items.length > 0 && categoriesWithItems.length === 0 && search.trim() && !isAiSearching && (
        <p className="marketplace-empty">No results found for "{search.trim()}". Try a shorter phrase or different wording.</p>
      )}

      {apiError && (
        <p className="form-error">Could not load listings: {apiError}</p>
      )}
    </div>
  );
}
