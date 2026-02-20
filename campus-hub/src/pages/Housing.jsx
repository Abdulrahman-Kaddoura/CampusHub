import { useMemo, useState } from "react";
import "./Housing.css";

const housingListings = [
  {
    id: 1,
    title: "2BR Apartment Near Campus",
    type: "Apartment",
    price: 1250,
    beds: 2,
    baths: 1,
    distance: "8 min walk",
    availability: "Available Now",
    petFriendly: true,
    furnished: true,
  },
  {
    id: 2,
    title: "Shared House Room",
    type: "Room",
    price: 680,
    beds: 1,
    baths: 1,
    distance: "15 min bike",
    availability: "Available Jun 1",
    petFriendly: false,
    furnished: false,
  },
  {
    id: 3,
    title: "Studio Loft Downtown",
    type: "Studio",
    price: 980,
    beds: 1,
    baths: 1,
    distance: "12 min bus",
    availability: "Available Now",
    petFriendly: true,
    furnished: false,
  },
  {
    id: 4,
    title: "3BR Townhome",
    type: "Townhome",
    price: 1600,
    beds: 3,
    baths: 2,
    distance: "10 min drive",
    availability: "Available Jul 15",
    petFriendly: true,
    furnished: true,
  },
  {
    id: 5,
    title: "Graduate Student Co-op",
    type: "Room",
    price: 720,
    beds: 1,
    baths: 1,
    distance: "9 min walk",
    availability: "Available Aug 1",
    petFriendly: false,
    furnished: true,
  },
  {
    id: 6,
    title: "1BR Quiet Neighborhood",
    type: "Apartment",
    price: 1100,
    beds: 1,
    baths: 1,
    distance: "14 min bike",
    availability: "Available Now",
    petFriendly: false,
    furnished: false,
  },
];

function Housing() {
  const [search, setSearch] = useState("");
  const [homeType, setHomeType] = useState("All Types");
  const [maxBudget, setMaxBudget] = useState(1800);

  const types = useMemo(() => {
    return ["All Types", ...new Set(housingListings.map((item) => item.type))];
  }, []);

  const listings = useMemo(() => {
    const query = search.toLowerCase();

    return housingListings.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(query) ||
        item.distance.toLowerCase().includes(query) ||
        item.availability.toLowerCase().includes(query);

      const matchesType = homeType === "All Types" || item.type === homeType;
      const matchesBudget = item.price <= maxBudget;

      return matchesSearch && matchesType && matchesBudget;
    });
  }, [search, homeType, maxBudget]);

  return (
    <main className="housing-page">
      <header className="housing-header">
        <h1>Housing</h1>
        <p>Browse rentals near campus and filter by type and monthly budget.</p>
      </header>

      <section className="housing-filters">
        <input
          type="text"
          value={search}
          placeholder="Search by listing, distance, or availability"
          onChange={(event) => setSearch(event.target.value)}
        />

        <select value={homeType} onChange={(event) => setHomeType(event.target.value)}>
          {types.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <label htmlFor="budget-slider">
          Max Budget: <strong>${maxBudget}</strong>/month
        </label>
        <input
          id="budget-slider"
          type="range"
          min="500"
          max="1800"
          step="50"
          value={maxBudget}
          onChange={(event) => setMaxBudget(Number(event.target.value))}
        />
      </section>

      <section className="housing-grid" aria-live="polite">
        {listings.length ? (
          listings.map((item) => (
            <article className="housing-card" key={item.id}>
              <h2>{item.title}</h2>
              <p className="housing-type">{item.type}</p>
              <p>
                <strong>Price:</strong> ${item.price}/month
              </p>
              <p>
                <strong>Beds/Baths:</strong> {item.beds} bd • {item.baths} ba
              </p>
              <p>
                <strong>Distance:</strong> {item.distance}
              </p>
              <p>
                <strong>Availability:</strong> {item.availability}
              </p>
              <div className="housing-tags">
                <span>{item.petFriendly ? "Pet Friendly" : "No Pets"}</span>
                <span>{item.furnished ? "Furnished" : "Unfurnished"}</span>
              </div>
              <button type="button">View Details</button>
            </article>
          ))
        ) : (
          <p className="empty-results">No housing options match your filters.</p>
        )}
      </section>
    </main>
  );
}

export default Housing;
