import { useParams } from "react-router-dom";
import { Section } from "../../components/ProductSection";
import { useMarketPlaceData } from "./useMarketPlaceData";
import "./MarketPlace.css";

export default function MarketPlaceCategory() {
  const { categoryName } = useParams();
  const decodedCategory = categoryName ? decodeURIComponent(categoryName) : "";
  const { items, search, setSearch } = useMarketPlaceData();
  const categoryItems = items.filter(
    (p) => (p.categoryName ?? p.category) === decodedCategory
  );

  return (
    <div className="marketplace marketplace-category">
      <h1 className="marketplace-page-title">Market Place</h1>
      <div className="marketplace-search-row">
        <div className="search-wrap">
          <span className="search-icon" aria-hidden>🔍</span>
          <input
            type="text"
            placeholder="Search books, room utilities and more..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      <Section
        search={search}
        category={decodedCategory}
        categoryDisplayName={decodedCategory}
        items={categoryItems}
        showViewAll={false}
      />
      {categoryItems.length === 0 && (
        <p className="marketplace-empty">No items in this category yet.</p>
      )}
    </div>
  );
}
