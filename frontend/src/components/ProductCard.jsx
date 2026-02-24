import React from "react";
import { useNavigate } from "react-router-dom";
import { getSafeProductImage, setFallbackImage } from "../utils/imageFallback";
import { formatINR } from "../utils/currency";

export default function ProductCard({ product, onAdd }) {
  const navigate = useNavigate();

  const openDetails = () => navigate(`/products/${product.id}`);
  const price = Number(product.price || 0);
  const listPrice = Number((price * 1.22).toFixed(2));
  const savings = Math.max(0, listPrice - price);
  const rating = (3.9 + ((Number(product.id) || 1) % 10) * 0.1).toFixed(1);
  const ratingsCount = 100 + ((Number(product.id) || 1) * 37) % 1200;

  const onCardKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDetails();
    }
  };

  return (
    <article className="product-card" role="button" tabIndex={0} onClick={openDetails} onKeyDown={onCardKeyDown}>
      <img
        src={getSafeProductImage(product.image_url, product.name)}
        alt={product.name}
        className="product-img"
        loading="lazy"
        onError={(event) => setFallbackImage(event, product.name)}
      />
      <h3 className="product-title">{product.name}</h3>
      <p className="product-rating">{rating} stars ({ratingsCount})</p>
      <p className="product-price-row">
        <span className="product-price">{formatINR(price)}</span>
        <span className="product-list-price">M.R.P. {formatINR(listPrice)}</span>
      </p>
      <p className="product-saving">You save {formatINR(savings)}</p>
      <p className="product-delivery">FREE delivery by tomorrow</p>
      <p className="badge">Tier: {product.visibility_tier}</p>
      <div className="card-actions">
        {onAdd ? (
          <button
            onClick={(event) => {
              event.stopPropagation();
              onAdd(product.id);
            }}
          >
            Add to Cart
          </button>
        ) : null}
      </div>
    </article>
  );
}
