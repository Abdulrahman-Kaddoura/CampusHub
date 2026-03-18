import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createDormListing, fetchDormListings } from "../api/dorms";
import { useAuth } from "../context/AuthContext";
import { FEATURE_FLAGS } from "../config/features";
import "./Housing.css";

const AUB_AREAS = ["Bliss Street", "Hamra", "Ain Mraisseh", "Manara", "Ras Beirut"];

const FEATURED_AUB_LISTINGS = [
  {
    dormId: "featured-1",
    title: "Modern Studio on Bliss Street",
    location: "Bliss Street",
    roomType: "Studio",
    monthlyRent: 850,
    availableFrom: "2026-03-01",
    description: "2-minute walk to AUB Gate 2, fully furnished, 24/7 electricity and fiber internet.",
    isFeatured: true,
  },
  {
    dormId: "featured-2",
    title: "Shared Flat for 2 in Hamra",
    location: "Hamra",
    roomType: "Shared Apartment",
    monthlyRent: 600,
    availableFrom: "2026-03-10",
    description: "Quiet street, close to cafes and supermarkets, ideal for AUB undergrads.",
    isFeatured: true,
  },
  {
    dormId: "featured-3",
    title: "Sea-View One Bedroom in Ain Mraisseh",
    location: "Ain Mraisseh",
    roomType: "1 Bedroom",
    monthlyRent: 1200,
    availableFrom: "2026-04-01",
    description: "Spacious apartment with balcony, 8-minute walk to campus and corniche access.",
    isFeatured: true,
  },
  {
    dormId: "featured-4",
    title: "Budget Room near Manara",
    location: "Manara",
    roomType: "Private Room",
    monthlyRent: 500,
    availableFrom: "2026-02-15",
    description: "Affordable option with shared kitchen and great bus access to AUB.",
    isFeatured: true,
  },
  {
    dormId: "featured-5",
    title: "Premium Apartment in Ras Beirut",
    location: "Ras Beirut",
    roomType: "2 Bedroom",
    monthlyRent: 1450,
    availableFrom: "2026-03-20",
    description: "Ideal for roommates, newly renovated, AC and generator included.",
    isFeatured: true,
  },
];

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

function Housing() {
  const { currentUser, token, isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedArea, setSelectedArea] = useState("All Areas");
  const [minBudget, setMinBudget] = useState(400);
  const [maxBudget, setMaxBudget] = useState(1600);
  const [showContactedOnly, setShowContactedOnly] = useState(false);
  const [contactedListingIds, setContactedListingIds] = useState([]);
  const [savedListingIds, setSavedListingIds] = useState([]);
  const [apiListings, setApiListings] = useState([]);
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

  const listings = useMemo(() => {
    if (apiListings.length === 0) {
      return FEATURED_AUB_LISTINGS;
    }

    return apiListings.map((listing) => ({
      ...listing,
      isFeatured: false,
    }));
  }, [apiListings]);

  const loadDorms = async () => {
    if (FEATURE_FLAGS.mockData) {
      setApiListings([]);
      setIsLoading(false);
      return;
    }
    try {
      setApiError("");
      const data = await fetchDormListings();
      setApiListings(Array.isArray(data) ? data : []);
    } catch (error) {
      setApiError("Live listings are unavailable right now. Showing curated AUB housing options.");
      setApiListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDorms();
  }, []);

  const typeOptions = useMemo(
    () => ["All Types", ...new Set(listings.map((item) => item.roomType).filter(Boolean))],
    [listings]
  );

  const areaOptions = useMemo(() => {
    const dynamicAreas = listings
      .map((item) => item.location)
      .filter(Boolean)
      .map((location) => AUB_AREAS.find((area) => location.toLowerCase().includes(area.toLowerCase())))
      .filter(Boolean);

    return ["All Areas", ...new Set([...AUB_AREAS, ...dynamicAreas])];
  }, [listings]);

  const normalizedMinBudget = Math.min(minBudget, maxBudget);
  const normalizedMaxBudget = Math.max(minBudget, maxBudget);

  const getListingId = (listing) => String(listing.dormId ?? listing.title);

  const housingMetrics = useMemo(() => {
    if (listings.length === 0) {
      return { totalListings: 0, avgRent: 0, cheapestRent: 0 };
    }

    const rents = listings.map((item) => Number(item.monthlyRent || 0)).filter((rent) => rent > 0);

    return {
      totalListings: listings.length,
      avgRent: Math.round(rents.reduce((acc, rent) => acc + rent, 0) / rents.length),
      cheapestRent: Math.min(...rents),
    };
  }, [listings]);

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
      const matchesArea =
        selectedArea === "All Areas" ||
        location.toLowerCase().includes(selectedArea.toLowerCase());
      const rent = Number(item.monthlyRent || 0);
      const matchesBudget = rent >= normalizedMinBudget && rent <= normalizedMaxBudget;
      const matchesContacted =
        !showContactedOnly || contactedListingIds.includes(getListingId(item));

      return matchesSearch && matchesType && matchesArea && matchesBudget && matchesContacted;
    });
  }, [
    listings,
    search,
    selectedType,
    selectedArea,
    normalizedMinBudget,
    normalizedMaxBudget,
    showContactedOnly,
    contactedListingIds,
  ]);

  const toggleContacted = (listingId) => {
    setContactedListingIds((prev) =>
      prev.includes(listingId) ? prev.filter((id) => id !== listingId) : [...prev, listingId]
    );
  };

  const toggleSaved = (listingId) => {
    setSavedListingIds((prev) =>
      prev.includes(listingId) ? prev.filter((id) => id !== listingId) : [...prev, listingId]
    );
  };

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
        <p className="housing-eyebrow">American University of Beirut (AUB) Student Housing Hub</p>
        <h1>Housing options built for AUB students</h1>
        <p>
          Discover curated listings in Hamra, Ain Mraisseh, Bliss Street, and surrounding
          neighborhoods near the American University of Beirut.
        </p>

        <div className="housing-neighborhoods" aria-label="AUB neighborhood quick filters">
          {AUB_AREAS.map((area) => (
            <button
              key={area}
              type="button"
              className={selectedArea === area ? "neighborhood-chip active" : "neighborhood-chip"}
              onClick={() => setSelectedArea(area)}
            >
              {area}
            </button>
          ))}
        </div>

        <div className="housing-metrics" aria-label="AUB housing market summary">
          <article>
            <strong>{housingMetrics.totalListings}</strong>
            <span>Active Listings</span>
          </article>
          <article>
            <strong>${housingMetrics.avgRent || "-"}</strong>
            <span>Average Monthly Rent</span>
          </article>
          <article>
            <strong>${housingMetrics.cheapestRent || "-"}</strong>
            <span>Cheapest Option</span>
          </article>
        </div>

        {isAuthenticated ? (
          <button type="button" onClick={() => setIsFormOpen((value) => !value)}>
            {isFormOpen ? "Cancel" : "Post AUB Listing"}
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
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, location: event.target.value }))
            }
          />
          <input
            type="text"
            placeholder="Room Type (e.g. Studio)"
            required
            value={formState.roomType}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, roomType: event.target.value }))
            }
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

        <select value={selectedArea} onChange={(event) => setSelectedArea(event.target.value)}>
          {areaOptions.map((option) => (
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
              setSelectedArea("All Areas");
              setSelectedType("All Types");
            }}
          >
            Reset Filters
          </button>
        </div>

        <p className="budget-summary">
          Showing listings between <strong>${normalizedMinBudget}</strong> and
          <strong> ${normalizedMaxBudget}</strong> / month.
        </p>

        <label className="saved-only-toggle" htmlFor="contacted-listings-toggle">
          <input
            id="contacted-listings-toggle"
            type="checkbox"
            checked={showContactedOnly}
            onChange={(event) => setShowContactedOnly(event.target.checked)}
          />
          Show contacted listings only
        </label>
      </section>

      {apiError && <p className="empty-state">{apiError}</p>}

      <section className="housing-grid" aria-live="polite">
        {isLoading ? (
          <p className="empty-state">Loading housing listings...</p>
        ) : filteredListings.length > 0 ? (
          filteredListings.map((listing) => {
            const listingId = getListingId(listing);
            const isContacted = contactedListingIds.includes(listingId);
            const isSaved = savedListingIds.includes(listingId);

            return (
            <article className="housing-card" key={listingId}>
              <div className="housing-card-head">
                <h2>{listing.title}</h2>
                {listing.isFeatured && <span className="featured-badge">Featured AUB Pick</span>}
              </div>
              <p className="housing-location">{listing.location}</p>

              <p>
                <strong>Type:</strong> {listing.roomType}
              </p>
              <p>
                <strong>Rent:</strong> ${listing.monthlyRent} / month
              </p>
              <p>
                <strong>Available From:</strong> {formatDate(listing.availableFrom)}
              </p>
              {listing.description && (
                <p>
                  <strong>Description:</strong> {listing.description}
                </p>
              )}

              <div className="card-actions-row">
                <button
                  type="button"
                  onClick={() => toggleContacted(listingId)}
                  className={isContacted ? "is-secondary" : ""}
                >
                  {isContacted ? "Message Sent" : "Contact Landlord"}
                </button>
                <button
                  type="button"
                  onClick={() => toggleSaved(listingId)}
                  className={isSaved ? "is-secondary" : ""}
                >
                  {isSaved ? "Saved" : "Save"}
                </button>
              </div>
            </article>
            );
          })
        ) : (
          <p className="empty-state">No housing listings match your current filters.</p>
        )}
      </section>
    </main>
  );
}

export default Housing;
