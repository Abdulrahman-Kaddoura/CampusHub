import { Link } from "react-router-dom";
import { ProductCard } from "./ProductCard";
import "./ProductSection.css";

export const Section = ({
  search = "",
  category,
  categoryDisplayName,
  items = [],
  limit,
  showViewAll = true,
  onDelete,
}) => {
  const normalizedSearch = search.trim().toLowerCase();
  const filtered = items.filter((p) => {
    const title = (p.title ?? p.productName ?? "").toLowerCase();
    const matchesSearch = !normalizedSearch || title.includes(normalizedSearch);
    const cat = p.categoryName ?? p.category;
    const matchesCategory = category ? cat === category : true;
    return matchesSearch && matchesCategory;
  });

  const displayItems = limit != null ? filtered.slice(0, limit) : filtered;
  const displayName = categoryDisplayName ?? category ?? "All Listings";

  if (displayItems.length === 0) return null;

  return (
    <section className="product-section">
      <div className="product-section-header">
        <h2 className="product-section-heading">
          Shop for deals on <span className="product-section-category">{displayName}</span>
        </h2>
        {showViewAll && category && (
          <Link to={`/marketplace/category/${encodeURIComponent(category)}`} className="product-section-view-all">
            View All &gt;
          </Link>
        )}
      </div>
      <div className="product-section-cards">
        {displayItems.map((product) => (
          <ProductCard
            key={product.listingId ?? product.id ?? product.title ?? Math.random()}
            data={product}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
};
