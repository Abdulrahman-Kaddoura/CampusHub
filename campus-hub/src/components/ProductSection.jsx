import { products } from "../products";
import { ProductCard } from "./ProductCard";
import './ProductSection.css';
import arrow from '../assets/arrow.svg';

export const Section = ({ search = "", category = "Books" }) => {
  // Filter products by category and search
  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) &&
      p.category.toLowerCase() === category.toLowerCase()
  );

  return (
    <div className="product-section">
      <div className="sectionTitle">
        <div className='title-name'>
          <h3>Shop for best deals on <span>{category}</span></h3>
          <div className="view">
            <p>view all</p>
            <img src={arrow} alt="arrow" />
          </div>
        </div>
        <hr />
      </div>

      <div className="cards-container">
        <div className="cards">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} data={product} />
          ))}
        </div>
      </div>
    </div>
  );
};
