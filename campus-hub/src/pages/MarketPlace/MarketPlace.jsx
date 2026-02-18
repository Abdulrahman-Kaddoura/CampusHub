import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HeroCarousel from "../../components/HeroCarousel";
import { Section } from "../../components/ProductSection";
import { createListing, fetchListings } from "../../api/listings";
import { useAuth } from "../../context/AuthContext";
import "./MarketPlace.css";

export default function MarketPlace() {
  const [search, setSearch] = useState("");
  const [listings, setListings] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { currentUser, token, isAuthenticated } = useAuth();
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    price: "",
    categoryName: "",
  });

  useEffect(() => {
    let isMounted = true;
    fetchListings()
      .then((data) => {
        if (isMounted) {
          setListings(data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const categoryOptions = useMemo(
    () => [
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
    ],
    []
  );


  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const payload = {
        title: formState.title,
        description: formState.description,
        price: Number(formState.price),
        categoryName: formState.categoryName,
        userId: currentUser.id,
      };
      const createdListing = await createListing(payload, token);
      setListings((prev) => [createdListing, ...prev]);
      setFormState({
        title: "",
        description: "",
        price: "",
        categoryName: "",
      });
      setIsFormOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="marketplace">
      <HeroCarousel />

      <div className="top-row">
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {isAuthenticated ? (
          <button className="add-item" type="button" onClick={() => setIsFormOpen(true)}>
            Add Item
          </button>
        ) : (
          <Link className="add-item" to="/auth">Login to Add Item</Link>
        )}
      </div>

      {isFormOpen ? (
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
              <option value="" disabled>
                Select a category
              </option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
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
          <div className="form-actions">
            <button
              className="submit-listing"
              type="submit"
              disabled={isSubmitting || !currentUser?.id}
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
      ) : null}

      <Section search={search} items={listings} />

      {!listings.length && !error ? <p className="form-error">No listings yet.</p> : null}
    </div>
  );
}
