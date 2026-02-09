import { useMemo, useState, useEffect } from "react";
import HeroCarousel from "../../components/HeroCarousel";
import { Section } from "../../components/ProductSection";
import { createListing, fetchListings } from "../../api/listings";
import "./MarketPlace.css";

export default function MarketPlace() {
  const [search, setSearch] = useState("");
  const [listings, setListings] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [formState, setFormState] = useState({
      title: "",
      description: "",
      price: "",
      categoryName: "",
      userId: "",
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

    const categories = useMemo(() => {
      const categorySet = new Set(listings.map((listing) => listing.categoryName));
      return Array.from(categorySet).filter(Boolean);
    }, [listings]);

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
          userId: formState.userId,
        };
        const createdListing = await createListing(payload);
        setListings((prev) => [createdListing, ...prev]);
        setFormState({
          title: "",
          description: "",
          price: "",
          categoryName: "",
          userId: "",
        });
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

        <button className="add-item" type="button">
                  Add Item
        </button>
      </div>

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
                <input
                  name="categoryName"
                  type="text"
                  placeholder="Category (e.g. Books)"
                  value={formState.categoryName}
                  onChange={handleChange}
                  required
                />
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
                <input
                  name="userId"
                  type="text"
                  placeholder="Seller user ID"
                  value={formState.userId}
                  onChange={handleChange}
                  required
                />
                <textarea
                  name="description"
                  placeholder="Description"
                  value={formState.description}
                  onChange={handleChange}
                />
              </div>
              <button className="submit-listing" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Create Listing"}
              </button>
              {error ? <p className="form-error">{error}</p> : null}
            </form>

            {categories.map((category) => (
              <Section
                key={category}
                category={category}
                search={search}
                items={listings}
              />
            ))}
    </div>
  );
}
