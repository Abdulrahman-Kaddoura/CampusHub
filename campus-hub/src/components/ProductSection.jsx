import { ProductCard } from "./ProductCard";
import "./ProductSection.css";

export const Section = ({ search = "", category, items = [] }) => {
  const normalizedSearch = search.trim().toLowerCase();
  const filteredProducts = items.filter((p) => {
    const matchesCategory = category ? p.categoryName === category : true;
    if (!normalizedSearch) return matchesCategory;
    return matchesCategory && (p.title || "").toLowerCase().includes(normalizedSearch);
  });

  if (filteredProducts.length === 0) return null;

  return (
    <div className="product-section">
      <div className="section-header">
        <h3>{category || "All Listings"}</h3>
      </div>

      <div className="cards">
        {filteredProducts.map((product) => (
          <ProductCard key={product.listingId || product.id} data={product} />
        ))}
      </div>
    </div>
  );
};
