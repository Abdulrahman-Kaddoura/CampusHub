import { products } from "../products";
import {ProductCard} from "./ProductCard";
import './ProductSection.css';
import arrow from '../assets/arrow.svg';

export const Section = () => {
  return (
    <div className="product-section">
      <div className="sectionTitle">
        <div className='title-name'>
          <h3>Shop for best deals on <span>Books</span></h3>
          <div className="view">
            <p>view all</p>
            <img src = {arrow} alt="arrow" />
          </div>
        </div>
        <hr />
      </div>

      <div className="cards-container">
        <div className="cards">
          {products.map((product) => (
            <ProductCard data={product} />
          ))}
        </div>
      </div>
    </div>
  );
};
