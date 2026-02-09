import { useState } from "react";
import { HeroCarousel } from "../../components/HeroCarousel";
import { Section } from "../../components/ProductSection";
import { products } from "../../products";
import "./MarketPlace.css";

export const MarketPlace = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const books = products.filter((p) => p.category === "Books");
  const clothing = products.filter((p) => p.category === "Clothing");
  const roomDecor = products.filter((p) => p.category === "Room Decor");

  return (
    <div className="marketplace">
      <HeroCarousel />

      <div className="top-row">
        <input
          type="text"
          placeholder="Search for items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="add-item">Add Item</button>
      </div>

      <Section title="Books and Stationery" products={books} />
      <Section title="Clothing" products={clothing} />
      <Section title="Room Decor" products={roomDecor} />
    </div>
  );
};
