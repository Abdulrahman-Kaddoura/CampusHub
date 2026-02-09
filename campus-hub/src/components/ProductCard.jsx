import defaultImage from "../assets/book.jpg";
import "./ProductCard.css";

export const ProductCard = ({ data }) => {
  const { title, userName, userId, price, description, imageUrl } = data;
  const sellerLabel = userName || userId || "Campus seller";
  const displayPrice =
    typeof price === "number" ? price.toFixed(2) : Number(price || 0).toFixed(2);

  return (
    <div className="card-container">
      <div className="image-container">
        <img src={imageUrl || defaultImage} alt={title} className="image" />
      </div>
      <div className="product-info">
        <h4 className="product-name">{title}</h4>
        <p className="author">Sold by {sellerLabel}</p>
        <p className="price">${displayPrice}</p>
        <p className="description">{description}</p>
      </div>
    </div>
  );
};