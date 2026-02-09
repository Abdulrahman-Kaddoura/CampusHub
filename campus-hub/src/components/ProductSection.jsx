import { products } from "../products";
import { ProductCard } from "./ProductCard";
import "./ProductSection.css";

export const Section = ({ search = "", category }) => {
  const filteredProducts = products.filter(
    (p) =>
      p.category === category &&
      p.productName.toLowerCase().includes(search.toLowerCase())
  );

  if (filteredProducts.length === 0) return null;

  return (
    <div className="product-section">
      <div className="section-header">
        <h3>{category}</h3>
        <button className="view-all">View All</button>
      </div>

      <div className="cards">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} data={product} />
        ))}
      </div>
    </div>
  );
};
