import './ProductCard.css';

export const ProductCard = ({ data }) => {
  const { productName, author, price, description, productImage } = data;

  return (
    <div className="card-container">
      <div className="image-container">
        <img src={productImage} alt={productName} className="image" />
      </div>
      <div className="product-info">
        <h4 className="product-name">{productName}</h4>
        <p className="author">Sold by {author}</p>
        <p className="price">${price}</p>
        <p className="description">{description}</p>
      </div>
    </div>
  );
};
