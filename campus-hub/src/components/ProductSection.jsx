import { useRef } from "react";
import { ProductCard } from "./ProductCard";
import "./ProductSection.css";
import arrow from "../assets/arrow.svg";

export const Section = ({ title = "Books", products = [] }) => {
  const containerRef = useRef(null);

  const scrollLeft = () => {
    containerRef.current.scrollBy({ left: -220, behavior: "smooth" });
  };

  const scrollRight = () => {
    containerRef.current.scrollBy({ left: 220, behavior: "smooth" });
  };

  return (
    <div className="product-section">
      <div className="section-header">
        <h3>Shop for best deals on <span>{title}</span></h3>
        <div className="view-all">
          <p>View All</p>
          <img src={arrow} alt="arrow" />
        </div>
      </div>

      <div className="cards-wrapper">
        <button className="scroll-btn left" onClick={scrollLeft}>
          &lt;
        </button>
        <div className="cards-container" ref={containerRef}>
          {products.map((p) => (
            <ProductCard key={p.id} data={p} />
          ))}
        </div>
        <button className="scroll-btn right" onClick={scrollRight}>
          &gt;
        </button>
      </div>
    </div>
  );
};
