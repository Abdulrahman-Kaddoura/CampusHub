import "./ProductCard.css";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1589998059171-988d451dfd0d?w=400&h=300&fit=crop";

export const ProductCard = ({ data }) => {
  const title = data.title ?? data.productName ?? "";
  const userName = data.userName ?? data.author ?? data.userId ?? "Campus seller";
  const price = data.price;
  const description = data.description ?? "";
  const imageUrl = data.imageUrl ?? data.productImage ?? FALLBACK_IMAGE;
  const discountPercent = data.discountPercent ?? null;

  const displayPrice =
    typeof price === "number" ? price.toFixed(2) : Number(price || 0).toFixed(2);

  return (
    <div className="product-card">
      <div className="product-card-image-wrap">
        <img src={imageUrl} alt={title} className="product-card-image" />
        {discountPercent != null && discountPercent > 0 && (
          <span className="product-card-badge">{discountPercent}% OFF</span>
        )}
      </div>
      <div className="product-card-info">
        <h4 className="product-card-title">{title}</h4>
        <p className="product-card-seller">Sold by {userName}</p>
        <p className="product-card-price">${displayPrice}</p>
        <p className="product-card-description">{description}</p>
      </div>
    </div>
  );
};
