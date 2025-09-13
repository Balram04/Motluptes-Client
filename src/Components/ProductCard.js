import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PetContext } from '../Context/Context';
import { MDBIcon } from 'mdb-react-ui-kit';
import toast from 'react-hot-toast';
import { isProductInCart } from '../Utils/cartUtils';
import '../Styles/Products.css'

function ProductList({ products }) {
  const navigate = useNavigate();
  const { loginStatus, handlePrice, wishlist, addToWishlist, removeFromWishlist, addToCart, cart } = useContext(PetContext);
  // Helper function to check if product is in cart
  const isInCart = (productId) => {
    return isProductInCart(productId, cart);
  };

  // Helper function to calculate discount percentage (for demo purposes)
  const calculateDiscount = (price) => {
    // Example discount logic - products over ₹500 get 15% off, over ₹300 get 10% off
    if (price > 500) return 15;
    if (price > 300) return 10;
    return 0;
  };

  // Helper function to get original price before discount
  const getOriginalPrice = (price, discountPercentage) => {
    if (discountPercentage > 0) {
      return Math.round(price / (1 - discountPercentage / 100));
    }
    return price;
  };

  if (!products || products.length === 0) {
    return (
      <div className="d-flex flex-column align-items-center p-5">
        <div className="text-center">
          <MDBIcon fas icon="paw" size="4x" className="text-muted mb-3" />
          <h4 className="text-muted">No products found</h4>
          <p className="text-muted">Sorry, we couldn't find any products in this category.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-content">
      {products?.map((value) => {
        const discountPercentage = calculateDiscount(value.price);
        const originalPrice = getOriginalPrice(value.price, discountPercentage);
        const productInCart = isInCart(value._id);

        return (
        <div className="box" key={value._id} data-category={value.category}>
          {discountPercentage > 0 && (
            <div className="discount-badge">
              -{discountPercentage}%
            </div>
          )}
          <div className="box-img" onClick={() => navigate(`/products/${value._id}`)}>
            <img src={value.image} alt={value.title} />
          </div>
          <div className="heart">
            {wishlist.some((item) => item._id === value._id) ? (
              <MDBIcon fas icon="heart" className="clicked-heart-icon" onClick={() => removeFromWishlist(value._id)} />
            ) : (
              <MDBIcon
                fas
                icon="heart"
                className="heart-icon"
                onClick={() => {
                  loginStatus ? addToWishlist(value._id) : toast.error('Sign in to your account');
                }}
              />
            )}
          </div>
          <h3 onClick={() => navigate(`/products/${value._id}`)}>{value.title}</h3>
          <div className="inbox">
            <div className="price-container">
              {discountPercentage > 0 && (
                <span className="strike-price">{handlePrice(originalPrice)}</span>
              )}
              <div className="price-weight-row">
                <span className="price">{handlePrice(value.price)}</span>
                {value.weight && (
                  <span className="weight-badge">{value.weight}</span>
                )}
              </div>
            </div>
            <button
              className={`add-to-cart-btn ${productInCart ? 'in-cart' : ''}`}
              onClick={() => {
                if (loginStatus) {
                  if (!productInCart) {
                    addToCart(value._id);
                  }
                } else {
                  navigate('/login');
                }
              }}
            >
              <MDBIcon fas icon={productInCart ? "check" : "shopping-cart"} />
              {productInCart ? 'In Cart' : 'Add to Cart'}
            </button>
          </div>
        </div>
        );
      })}
    </div>
  );
}

export default ProductList;
