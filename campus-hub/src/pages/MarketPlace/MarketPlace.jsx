import { Section } from "../../components/ProductSection";
import "./MarketPlace.css";

function MarketPlace() {
  return (
    <div className="marketplace">
      {/* Hero Banner */}
      <div className="marketplace-hero">
        <h1>Market Place</h1>
        <p>Buy from and sell to other students</p>
      </div>

      {/* Product Section */}
      <Section title="Books and Stationery" />
    </div>
  );
}

export default MarketPlace;
