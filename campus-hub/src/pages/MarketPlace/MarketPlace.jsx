import { useState } from "react";
import HeroCarousel from "../../components/HeroCarousel";
import { Section } from "../../components/ProductSection";
import "./MarketPlace.css";

export default function MarketPlace() {
  const [search, setSearch] = useState("");

  return (
    <div className="marketplace">
      <HeroCarousel />

      <div className="top-bar">
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button className="add-item">Add Item</button>
      </div>

      <Section category="Books" search={search} />
      <Section category="Clothing" search={search} />
      <Section category="Room Decor" search={search} />
    </div>
  );
}
