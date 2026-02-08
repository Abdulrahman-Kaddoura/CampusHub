import { useState } from "react";
import { Section } from "../../components/ProductSection";
import "./MarketPlace.css";

function MarketPlace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredQuery, setFilteredQuery] = useState("");

  const handleSearch = () => {
    setFilteredQuery(searchQuery);
  };

  return (
    <div className="marketplace">
      {/* Hero Banner */}
      <div className="marketplace-hero">
        <h1>Market Place</h1>
        <p>Buy from and sell to other students</p>
      </div>

      {/* Search Bar */}
      <div className="marketplace-search">
        <input
          type="text"
          placeholder="Search for items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Section Component */}
      {/* We'll pass the filteredQuery as a prop */}
      <Section search={filteredQuery} />
    </div>
  );
}

export default MarketPlace;

