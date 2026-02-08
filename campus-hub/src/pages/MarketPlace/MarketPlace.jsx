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

      {/* Search Bar */}
      <div className="marketplace-search">
        <input type="text" placeholder="Search for items..." />
        <button>Search</button>
      </div>

      {/* Existing Marketplace Section */}
      <Section />
    </div>
  );
}

export default MarketPlace;
