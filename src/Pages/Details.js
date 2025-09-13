import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PetContext } from '../Context/Context';
import Button from '../Components/Button';
import { MDBIcon, MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody } from 'mdb-react-ui-kit';
import toast from 'react-hot-toast';
import '../Styles/Details.css';
import '../Styles/Home.css';

export default function Details() {
  const { id } = useParams();
  const { fetchProductDetails, loginStatus, cart, addToCart, addToWishlist, wishlist } = useContext(PetContext);
  const [item, setItem] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const product = await fetchProductDetails(id);
      setItem(product);
    };
    fetchData();
  }, [id, fetchProductDetails]);

  const handleImageLoad = () => setImageLoading(false);
  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  if (!item || !item._id) {
    return <div className="text-center py-5">Loading product details...</div>;
  }

  const isInCart = cart?.some((value) => value?.product?._id === item?._id);
  const isInWishlist = wishlist?.some((value) => value?._id === item?._id);

  return (
    <div className="details-container">
      <MDBContainer className="py-5">
        <MDBRow className="align-items-center">
          <MDBCol md="6" className="mb-4 mb-md-0">
            <MDBCard className="image-card">
              <div className="image-container position-relative">
                {imageLoading && (
                  <div className="image-loading d-flex justify-content-center align-items-center">
                    <div className="spinner-border" role="status" style={{ color: '#ed6335' }}>
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}

                {imageError ? (
                  <div className="image-error d-flex flex-column justify-content-center align-items-center">
                    <MDBIcon fas icon="image" size="3x" className="text-muted mb-3" />
                    <p className="text-muted">Image not available</p>
                  </div>
                ) : (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="product-image"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    style={{ display: imageLoading ? 'none' : 'block' }}
                  />
                )}

                <button
                  className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
                  onClick={() => {
                    loginStatus ? addToWishlist(item._id) : toast.error('Sign in to add to wishlist');
                  }}
                >
                  <MDBIcon fas icon="heart" />
                </button>

                {item.category && (
                  <div className="product-badge">
                    <span className="badge-text">{item.category}</span>
                  </div>
                )}
              </div>
            </MDBCard>
          </MDBCol>

          <MDBCol md="6">
            <div className="product-details">
              <div className="product-header mb-4">
                <h1 className="product-title mb-3">{item.title}</h1>
                <div className="rating-section mb-3">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <MDBIcon key={i} fas icon="star" className={i < 4 ? 'text-warning' : 'text-muted'} />
                    ))}
                  </div>
                  <span className="rating-text ms-2">(4.2/5 - 128 reviews)</span>
                </div>
              </div>

              <div className="price-section mb-4">
                <div className="price-container">
                  <div className="price-main">
                    <span className="currency">₹</span>
                    <span className="amount">{item.price}</span>
                  </div>
                  <div className="price-details">
                    <div className="discount-info">
                      <span className="original-price">₹{Math.floor(item.price * 1.25)}</span>
                      <span className="discount-percent">20% OFF</span>
                    </div>
                    <div className="savings">
                      <MDBIcon fas icon="tag" className="me-2" />
                      You save ₹{Math.floor(item.price * 0.25)}
                    </div>
                  </div>
                </div>
                
                {/* Weight Display */}
                {item.weight && (
                  <div className="weight-display mb-3">
                    <MDBIcon fas icon="weight" className="me-2" style={{ color: '#ed6335' }} />
                    <span className="weight-label">Weight: </span>
                    <span className="weight-value">{item.weight}</span>
                  </div>
                )}
                
                <div className="delivery-info">
                  <MDBIcon fas icon="truck" className="me-2" style={{ color: '#ed6335' }} />
                  <span>Free delivery on orders above ₹500</span>
                </div>
              </div>

              <hr className="my-4" />

              <div className="product-info-grid mb-4">
                <div className="info-item">
                  <MDBIcon fas icon="shield-alt" className="info-icon" />
                  <div>
                    <h6>100% Safe</h6>
                    <small>Pet-safe ingredients</small>
                  </div>
                </div>
                <div className="info-item">
                  <MDBIcon fas icon="medal" className="info-icon" />
                  <div>
                    <h6>Premium Quality</h6>
                    <small>Vet recommended</small>
                  </div>
                </div>
                <div className="info-item">
                  <MDBIcon fas icon="leaf" className="info-icon" />
                  <div>
                    <h6>Natural</h6>
                    <small>No artificial additives</small>
                  </div>
                </div>
                <div className="info-item">
                  <MDBIcon fas icon="heart" className="info-icon" />
                  <div>
                    <h6>Nutritious</h6>
                    <small>Balanced formula</small>
                  </div>
                </div>
              </div>

              <div className="description-section mb-4">
                <h5 className="section-title mb-3">
                  <MDBIcon fas icon="info-circle" className="me-2" />
                  Product Description
                </h5>
                <div className="description-content">
                  <p className="description">{item.description}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons-container">
                {/* Desktop/Tablet Buttons */}
                <div className="action-buttons d-none d-md-flex flex-column flex-md-row gap-3 mb-4">
                  {isInCart ? (
                    <Button
                      rounded
                      color="success"
                      className="action-btn flex-fill view-cart-btn responsive-btn"
                      onClick={() => navigate('/cart')}
                    >
                      <MDBIcon fas icon="shopping-cart" className="me-2" />
                      <span className="btn-text">View in Cart</span>
                    </Button>
                  ) : (
                    <Button
                      rounded
                      className="action-btn flex-fill add-cart-btn responsive-btn"
                      style={{ backgroundColor: '#292a2e', border: 'none' }}
                      onClick={() => {
                        loginStatus ? addToCart(item._id) : navigate('/login');
                      }}
                    >
                      <MDBIcon fas icon="cart-plus" className="me-2" />
                      <span className="btn-text">Add to Cart</span>
                    </Button>
                  )}

                  <Button
                    rounded
                    className="action-btn flex-fill buy-now-btn responsive-btn"
                    style={{ backgroundColor: '#ed6335', border: 'none' }}
                    onClick={() => {
                      if (loginStatus) {
                        addToCart(item._id);
                        navigate('/cart');
                      } else {
                        navigate('/login');
                      }
                    }}
                  >
                    <MDBIcon fas icon="bolt" className="me-2" />
                    <span className="btn-text">Buy Now</span>
                  </Button>
                </div>

                {/* Mobile Sticky Bottom Buttons */}
                <div className="mobile-sticky-buttons d-flex d-md-none fixed-bottom bg-white p-3 shadow-lg justify-content-between" style={{ zIndex: 1000 }}>
                  {isInCart ? (
                    <Button
                      className="mobile-btn view-cart-mobile flex-fill me-2"
                      style={{ backgroundColor: '#198754', color: '#fff', border: 'none' }}
                      onClick={() => navigate('/cart')}
                    >
                      <MDBIcon fas icon="shopping-cart" className="me-2" />
                      View in Cart
                    </Button>
                  ) : (
                    <Button
                      className="mobile-btn add-cart-mobile flex-fill me-2"
                      style={{ backgroundColor: '#292a2e', color: '#fff', border: 'none' }}
                      onClick={() => {
                        loginStatus ? addToCart(item._id) : navigate('/login');
                      }}
                    >
                      <MDBIcon fas icon="cart-plus" className="me-2" />
                      Add to Cart
                    </Button>
                  )}

                  <Button
                    className="mobile-btn buy-now-mobile flex-fill"
                    style={{ backgroundColor: '#ed6335', color: '#fff', border: 'none' }}
                    onClick={() => {
                      if (loginStatus) {
                        addToCart(item._id);
                        navigate('/cart');
                      } else {
                        navigate('/login');
                      }
                    }}
                  >
                    <MDBIcon fas icon="bolt" className="me-2" />
                    Buy Now
                  </Button>
                </div>
              </div>
            </div>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  );
}
