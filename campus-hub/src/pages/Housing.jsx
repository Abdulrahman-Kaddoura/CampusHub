import { useMemo, useState } from "react";
import "./Housing.css";

const aubHousingListings = [
  {
    id: 1,
    title: "Furnished Studio - Bliss Street",
    neighborhood: "Ras Beirut",
    type: "Studio",
    monthlyRentUsd: 850,
    beds: 1,
    baths: 1,
    commuteToAUB: "5 min walk to AUB Main Gate",
    availability: "Available now",
    utilitiesIncluded: true,
    furnished: true,
  },
  {
    id: 2,
    title: "Shared 3BR Apartment - Hamra",
    neighborhood: "Hamra",
    type: "Shared Apartment",
    monthlyRentUsd: 500,
    beds: 1,
    baths: 1,
    commuteToAUB: "10 min walk to campus",
    availability: "Available next month",
    utilitiesIncluded: false,
    furnished: true,
  },
  {
    id: 3,
    title: "1BR Apartment - Ain El Mreisseh",
    neighborhood: "Ain El Mreisseh",
    type: "Apartment",
    monthlyRentUsd: 1000,
    beds: 1,
    baths: 1,
    commuteToAUB: "7 min walk to AUB",
    availability: "Available now",
    utilitiesIncluded: false,
    furnished: false,
  },
  {
    id: 4,
    title: "2BR Family Flat - Manara",
    neighborhood: "Manara",
    type: "Apartment",
    monthlyRentUsd: 1300,
    beds: 2,
    baths: 2,
    commuteToAUB: "12 min walk to AUB",
    availability: "Available in 2 weeks",
    utilitiesIncluded: true,
    furnished: false,
  },
  {
    id: 5,
    title: "Graduate Room - Clemenceau",
    neighborhood: "Clemenceau",
    type: "Private Room",
    monthlyRentUsd: 650,
    beds: 1,
    baths: 1,
    commuteToAUB: "15 min by bus",
    availability: "Available now",
    utilitiesIncluded: true,
    furnished: true,
  },
  {
    id: 6,
    title: "2BR Apartment - Verdun",
    neighborhood: "Verdun",
    type: "Apartment",
    monthlyRentUsd: 1200,
    beds: 2,
    baths: 1,
    commuteToAUB: "15 min by bike",
    availability: "Available next month",
    utilitiesIncluded: false,
    furnished: true,
  },
];

function Housing() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [maxBudget, setMaxBudget] = useState(1400);

  const typeOptions = useMemo(() => {
    return ["All Types", ...new Set(aubHousingListings.map((item) => item.type))];
  }, []);

  const filteredListings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return aubHousingListings.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(query) ||
        item.neighborhood.toLowerCase().includes(query) ||
        item.commuteToAUB.toLowerCase().includes(query);

      const matchesType = selectedType === "All Types" || item.type === selectedType;
      const matchesBudget = item.monthlyRentUsd <= maxBudget;

      return matchesSearch && matchesType && matchesBudget;
    });
  }, [search, selectedType, maxBudget]);

  return (
    <main className="housing-page">
      <header className="housing-header">
        <h1>Housing at AUB</h1>
        <p>
          Explore student-friendly rentals around the American University of Beirut.
          Filter by budget, property type, and location near campus.
        </p>
      </header>

      <section className="housing-filters" aria-label="Housing filters">
        <input
          type="text"
          value={search}
          placeholder="Search by title, neighborhood, or commute"
          onChange={(event) => setSearch(event.target.value)}
        />

        <select value={selectedType} onChange={(event) => setSelectedType(event.target.value)}>
          {typeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <label htmlFor="max-budget-slider">
          Max Budget: <strong>${maxBudget}</strong>/month
        </label>
        <input
          id="max-budget-slider"
          type="range"
          min="400"
          max="1600"
          step="50"
          value={maxBudget}
          onChange={(event) => setMaxBudget(Number(event.target.value))}
        />
      </section>

      <section className="housing-grid" aria-live="polite">
        {filteredListings.length > 0 ? (
          filteredListings.map((listing) => (
            <article className="housing-card" key={listing.id}>
              <h2>{listing.title}</h2>
              <p className="housing-location">{listing.neighborhood}</p>

              <p>
                <strong>Type:</strong> {listing.type}
              </p>
              <p>
                <strong>Rent:</strong> ${listing.monthlyRentUsd} / month
              </p>
              <p>
                <strong>Beds/Baths:</strong> {listing.beds} bed • {listing.baths} bath
              </p>
              <p>
                <strong>Commute:</strong> {listing.commuteToAUB}
              </p>
              <p>
                <strong>Availability:</strong> {listing.availability}
              </p>

              <div className="housing-badges">
                <span>{listing.utilitiesIncluded ? "Utilities Included" : "Utilities Separate"}</span>
                <span>{listing.furnished ? "Furnished" : "Unfurnished"}</span>
              </div>

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
