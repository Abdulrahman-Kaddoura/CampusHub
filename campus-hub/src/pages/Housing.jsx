import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createDormListing, fetchDormListings } from "../api/dorms";
import { useAuth } from "../context/AuthContext";
import "./Housing.css";



function Housing() {
    const { currentUser, token, isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [minBudget, setMinBudget] = useState(400);
  const [maxBudget, setMaxBudget] = useState(1600);
  const [listings, setListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [formState, setFormState] = useState({
      title: "",
      description: "",
      location: "",
      roomType: "",
      monthlyRent: "",
      availableFrom: "",
    });

  const loadDorms = async () => {
      try {
        setApiError("");
        const data = await fetchDormListings();
        setListings(Array.isArray(data) ? data : []);
      } catch (error) {
        setApiError(error.message);
        setListings([]);
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      loadDorms();
  }, []);

  const typeOptions = useMemo(() => {
      return ["All Types", ...new Set(listings.map((item) => item.roomType).filter(Boolean))];
    }, [listings]);

  const normalizedMinBudget = Math.min(minBudget, maxBudget);
  const normalizedMaxBudget = Math.max(minBudget, maxBudget);

  const filteredListings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return listings.filter((item) => {
          const title = item.title || "";
          const location = item.location || "";
          const description = item.description || "";
      const matchesSearch =
        title.toLowerCase().includes(query) ||
                location.toLowerCase().includes(query) ||
                description.toLowerCase().includes(query);

      const matchesType = selectedType === "All Types" || item.roomType === selectedType;
            const rent = Number(item.monthlyRent || 0);
            const matchesBudget = rent >= normalizedMinBudget && rent <= normalizedMaxBudget;

      return matchesSearch && matchesType && matchesBudget;
    });
  }, [listings, search, selectedType, normalizedMinBudget, normalizedMaxBudget]);

    const handleCreateDorm = async (event) => {
      event.preventDefault();
      if (!currentUser?.id) {
        setSubmitError("You must be logged in to create a housing listing.");
        return;
      }

      setIsSubmitting(true);
      setSubmitError("");

      try {
        await createDormListing(
          {
            ...formState,
            monthlyRent: Number(formState.monthlyRent),
            userId: currentUser.id,
          },
          token
        );
        setFormState({
          title: "",
          description: "",
          location: "",
          roomType: "",
          monthlyRent: "",
          availableFrom: "",
        });
        setIsFormOpen(false);
        setIsLoading(true);
        await loadDorms();
      } catch (error) {
        setSubmitError(error.message);
      } finally {
        setIsSubmitting(false);
      }
    };

  return (
    <main className="housing-page">
      <header className="housing-header">
        <h1>Housing at AUB</h1>
        <p>
          Explore student-friendly rentals around the American University of Beirut. Filter by
                    budget, property type, and location near campus.
        </p>
        {isAuthenticated ? (
                  <button type="button" onClick={() => setIsFormOpen((v) => !v)}>
                    {isFormOpen ? "Cancel" : "Add Housing Listing"}
                  </button>
                ) : (
                  <Link className="add-item" to="/auth">
                    Login to Add Housing Listing
                  </Link>
                )}
      </header>

      {isFormOpen && (
              <form className="housing-filters" onSubmit={handleCreateDorm}>
                <input
                  type="text"
                  placeholder="Title"
                  required
                  value={formState.title}
                  onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Location"
                  required
                  value={formState.location}
                  onChange={(event) => setFormState((prev) => ({ ...prev, location: event.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Room Type (e.g. Studio)"
                  required
                  value={formState.roomType}
                  onChange={(event) => setFormState((prev) => ({ ...prev, roomType: event.target.value }))}
                />
                <input
                  type="number"
                  placeholder="Monthly Rent"
                  min="0"
                  step="0.01"
                  required
                  value={formState.monthlyRent}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, monthlyRent: event.target.value }))
                  }
                />
                <input
                  type="date"
                  required
                  value={formState.availableFrom}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, availableFrom: event.target.value }))
                  }
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={formState.description}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, description: event.target.value }))
                  }
                />
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Listing"}
                </button>
                {submitError && <p className="empty-state">{submitError}</p>}
              </form>
            )}

      <section className="housing-filters" aria-label="Housing filters">
        <input
          type="text"
          value={search}
          placeholder="Search by title, location, or description"
          onChange={(event) => setSearch(event.target.value)}
        />

        <select value={selectedType} onChange={(event) => setSelectedType(event.target.value)}>
          {typeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <div className="budget-range" role="group" aria-label="Budget range filter">
          <label htmlFor="min-budget-input">
            Min Budget ($)
            <input
              id="min-budget-input"
              type="number"
              min="0"
              step="50"
              value={minBudget}
              onChange={(event) => setMinBudget(Number(event.target.value) || 0)}
            />
          </label>

          <label htmlFor="max-budget-input">
            Max Budget ($)
            <input
              id="max-budget-input"
              type="number"
              min="0"
              step="50"
              value={maxBudget}
              onChange={(event) => setMaxBudget(Number(event.target.value) || 0)}
            />
          </label>

          <button
            type="button"
            className="clear-budget"
            onClick={() => {
              setMinBudget(400);
              setMaxBudget(1600);
            }}
          >
            Reset Budget
          </button>
        </div>

        <p className="budget-summary">
          Showing listings between <strong>${normalizedMinBudget}</strong> and
          <strong> ${normalizedMaxBudget}</strong> / month.
        </p>
      </section>

      {apiError && <p className="empty-state">{apiError}</p>}

      <section className="housing-grid" aria-live="polite">
        {isLoading ? (
                  <p className="empty-state">Loading housing listings...</p>
                ) : filteredListings.length > 0 ? (
          filteredListings.map((listing) => (
            <article className="housing-card" key={listing.dormId}>
              <h2>{listing.title}</h2>
              <p className="housing-location">{listing.location}</p>

              <p>
                <strong>Type:</strong> {listing.roomType}
              </p>
              <p>
                <strong>Rent:</strong> ${listing.monthlyRent} / month
              </p>
              <p>
                <strong>Available From:</strong> {listing.availableFrom}
              </p>
              {listing.description && (
                              <p>
                                <strong>Description:</strong> {listing.description}
                              </p>
                            )}

              <button type="button">Contact Landlord</button>
            </article>
          ))
        ) : (
          <p className="empty-state">No housing listings match your current filters.</p>
        )}
      </section>
    </main>
  );
}

export default Housing;
