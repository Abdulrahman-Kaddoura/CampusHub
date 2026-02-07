import { products } from "../products";
import './ProductCard.css';

export const ProductCard = (props) => {
  const{ id, productName, author, price, description, productImage } = props.data;

  return (
    <div className="card-container">
      <div className="image-container">
        <div className="product-image">
          <img src={productImage} alt="product image" className="image" />
        </div>
      </div>
      <div className="product-info">
        <h4 className="product-name">{productName}</h4>
        <p className="author">Sold by {author}</p>
        <p className="price">${price}</p>
      </div>
      <div className="details">
        <hr />
        <p className="description">{description}</p>
        <button className="contact">Contact Owner</button>
      </div>
    </div>
  )
}

