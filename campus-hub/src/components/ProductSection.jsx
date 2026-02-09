import { ProductCard } from "./ProductCard";
import "./ProductSection.css";
import arrow from "../assets/arrow.svg";

export const Section = ({ title = "Books and Stationery", products = [] }) => {
  return (
    <div className="product-section">
      <div className="section-header">
        <h3>
          Shop for best deals on <span>{title}</span>
        </h3>
        <div className="view-all">
          <p>View All</p>
          <img src={arrow} alt="arrow" />
        </div>
      </div>

      <div className="cards">
        {products.map((product) => (
          <ProductCard key={product.id} data={product} />
        ))}
      </div>
    </div>
  );
};
