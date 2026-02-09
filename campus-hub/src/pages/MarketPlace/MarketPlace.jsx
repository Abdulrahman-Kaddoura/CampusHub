import { HeroCarousel } from "../../components/HeroCarousel";
import { Section } from "../../components/ProductSection";
import { products } from "../../products";
import "./MarketPlace.css";

function MarketPlace() {
  // Split products by category
  const books = products.filter((p) => p.category === "Books");
  const clothing = products.filter((p) => p.category === "Clothing");
  const roomDecor = products.filter((p) => p.category === "Room Decor");

  return (
    <div className="marketplace">
      <HeroCarousel />

      <Section title="Books and Stationery" products={books} />
      <Section title="Clothing" products={clothing} />
      <Section title="Room Decor" products={roomDecor} />

      <button className="add-item">Add Item</button>
    </div>
  );
}

export default MarketPlace;
