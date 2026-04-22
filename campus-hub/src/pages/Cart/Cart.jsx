import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getCartByUserId, getCartItems, removeCartItem, checkoutCart, buyCart } from "../../api/cart";
import { canReviewListing } from "../../api/reviews";
import ReviewModal from "../../components/ReviewModal/ReviewModal";
import "./Cart.css";

export default function Cart() {
  const { currentUser, token, isAuthenticated, authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const paymentHandledRef = useRef(false);

  const [cartId, setCartId] = useState(null);
  const [items, setItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentError, setPaymentError] = useState("");

  // Review state
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [reviewableItems, setReviewableItems] = useState([]);
  const [activeReview, setActiveReview] = useState(null);

  const currentUserId = currentUser?.id ?? currentUser?.userId ?? null;

  const loadCart = async () => {
    if (!currentUserId || !token) return;
    setLoading(true);
    setError("");
    try {
      const cart = await getCartByUserId(currentUserId, token);
      setCartId(cart.cartId);
      setTotalPrice(cart.totalPrice ?? 0);
      const cartItems = await getCartItems(cart.cartId, token);
      setItems(Array.isArray(cartItems) ? cartItems : Array.from(cartItems));
    } catch (err) {
      setError(err.message || "Could not load cart.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate("/auth", { replace: true });
      return;
    }
    loadCart();
  }, [authLoading, isAuthenticated, currentUserId, token]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get("payment");

    if (!paymentStatus) return;
    if (authLoading) return;
    if (paymentHandledRef.current) return;
    paymentHandledRef.current = true;

    const finalize = async () => {
      if (paymentStatus === "cart-success") {
        if (!isAuthenticated) {
          setPaymentError("Payment succeeded, but please log in to finalize your order.");
          return;
        }
        try {
          // Snapshot items before clearing so we can offer reviews
          const cart = await getCartByUserId(currentUserId, token);
          const snapshotItems = await getCartItems(cart.cartId, token);
          const snapshot = Array.isArray(snapshotItems) ? snapshotItems : Array.from(snapshotItems);

          await buyCart(token);
          setPaymentMessage("Payment confirmed! Your items are now marked as sold.");

          // Check which items are now reviewable
          const reviewable = [];
          for (const item of snapshot) {
            if (!item.listingId) continue;
            try {
              const eligible = await canReviewListing(item.listingId, token);
              if (eligible) reviewable.push(item);
            } catch {
              // skip if check fails
            }
          }
          setPurchasedItems(snapshot);
          setReviewableItems(reviewable);

          await loadCart();
        } catch (err) {
          setPaymentError(err.message || "Payment succeeded but order finalization failed.");
        }
      }

      if (paymentStatus === "cart-cancelled") {
        setPaymentMessage("Checkout was cancelled. Your cart is unchanged.");
      }

      navigate({ pathname: location.pathname }, { replace: true });
    };

    finalize();
  }, [location.search, authLoading, isAuthenticated]);

  const handleRemove = async (cartItemId) => {
    setRemovingId(cartItemId);
    try {
      await removeCartItem(cartItemId, token);
      await loadCart();
    } catch (err) {
      setError(err.message || "Could not remove item.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleCheckout = async () => {
    setCheckoutError("");
    setIsCheckingOut(true);
    try {
      const baseUrl = window.location.origin;
      const session = await checkoutCart(
        {
          successUrl: `${baseUrl}/cart?payment=cart-success&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${baseUrl}/cart?payment=cart-cancelled`,
        },
        token
      );
      if (!session?.checkoutUrl) throw new Error("Stripe checkout URL is missing.");
      window.open(session.checkoutUrl, "_blank");
    } catch (err) {
      setCheckoutError(err.message || "Could not start checkout.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const dismissReviewItem = (listingId) => {
    setReviewableItems((prev) => prev.filter((i) => i.listingId !== listingId));
  };

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="cart-page">
      <h1 className="cart-title">Your Cart</h1>

      {paymentMessage && <p className="cart-payment-message">{paymentMessage}</p>}
      {paymentError && <p className="cart-error">{paymentError}</p>}

      {/* Review prompts shown after a successful purchase */}
      {reviewableItems.length > 0 && (
        <div className="cart-review-prompts">
          <p className="cart-review-heading">Rate your sellers (optional)</p>
          {reviewableItems.map((item) => (
            <div key={item.listingId} className="cart-review-prompt-item">
              <span className="cart-review-prompt-title">{item.listingTitle ?? "Item"}</span>
              <div className="cart-review-prompt-actions">
                <button
                  className="cart-review-btn"
                  onClick={() => setActiveReview(item)}
                >
                  Leave a Review
                </button>
                <button
                  className="cart-review-skip"
                  onClick={() => dismissReviewItem(item.listingId)}
                >
                  Skip
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && <p className="cart-loading">Loading cart...</p>}

      {!loading && error && <p className="cart-error">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <div className="cart-empty">
          <p>Your cart is empty.</p>
          <button className="cart-browse-btn" onClick={() => navigate("/")}>Browse Listings</button>
        </div>
      )}

      {!loading && items.length > 0 && (
        <>
          <ul className="cart-items-list">
            {items.map((item) => (
              <li key={item.cartItemId} className="cart-item">
                <div className="cart-item-info">
                  <span className="cart-item-title">{item.listingTitle ?? "Listing"}</span>
                  <span className="cart-item-price">
                    ${Number(item.unitPrice ?? 0).toFixed(2)}
                    {item.quantity > 1 && ` × ${item.quantity}`}
                  </span>
                </div>
                <button
                  className="cart-item-remove"
                  onClick={() => handleRemove(item.cartItemId)}
                  disabled={removingId === item.cartItemId}
                >
                  {removingId === item.cartItemId ? "Removing..." : "Remove"}
                </button>
              </li>
            ))}
          </ul>

          <div className="cart-summary">
            <p className="cart-total">
              Total: <strong>${Number(totalPrice).toFixed(2)}</strong>
            </p>
            {checkoutError && <p className="cart-error">{checkoutError}</p>}
            <button
              className="cart-checkout-btn"
              onClick={handleCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? "Opening Stripe..." : "Checkout with Stripe"}
            </button>
          </div>
        </>
      )}

      {activeReview && (
        <ReviewModal
          listingId={activeReview.listingId}
          listingTitle={activeReview.listingTitle}
          token={token}
          onClose={() => setActiveReview(null)}
          onSubmitted={() => dismissReviewItem(activeReview.listingId)}
        />
      )}
    </div>
  );
}
