// Cart.js
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PetContext } from '../Context/Context';
import {
  MDBCard,
  MDBCardBody,
  MDBCardImage,
  MDBCol,
  MDBContainer,
  MDBIcon,
  MDBRow,
  MDBTypography,
} from 'mdb-react-ui-kit';
import Button from '../Components/Button';
import '../Styles/Cart.css';
import toast from 'react-hot-toast';

export default function Cart() {
  const navigate = useNavigate();
  const {
    fetchCart,
    handleCheckout,
    cart = [],
    handleQuantity,
    removeFromCart,
    handlePrice,
    totalPrice = 0,
    loginStatus,
  } = useContext(PetContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCart = async () => {
      if (!loginStatus) {
        setError('Please log in to view your cart');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        await fetchCart();
      } catch (err) {
        setError('Failed to load cart. Please try again.');
        toast.error('Failed to load cart');
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [fetchCart, loginStatus]);

  const handleQuantityChange = async (cartID, change) => {
    try {
      await handleQuantity(cartID, change);
      await fetchCart(); // Refresh cart after quantity change
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (productID) => {
    const confirmRemove = window.confirm('Are you sure you want to remove this item from your cart?');
    if (confirmRemove) {
      try {
        await removeFromCart(productID);
      } catch (error) {
        toast.error('Failed to remove item');
      }
    }
  };

  if (loading) {
    return (
      <section className="cart-loading-section">
        <MDBContainer className="py-5 h-100">
          <div className="text-center">
            <div className="spinner-border" style={{ color: '#ed6335' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5 className="mt-3">Loading your cart...</h5>
          </div>
        </MDBContainer>
      </section>
    );
  }

  if (error) {
    return (
      <section className="cart-error-section">
        <MDBContainer className="py-5 h-100">
          <div className="text-center">
            <MDBIcon fas icon="exclamation-triangle" size="3x" className="text-warning mb-3" />
            <h4 className="text-danger">{error}</h4>
            <Button color="primary" onClick={() => navigate('/login')} className="mt-3">
              Go to Login
            </Button>
          </div>
        </MDBContainer>
      </section>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <section className="empty-cart-section">
        <MDBContainer className="py-5 h-100">
          <div className="text-center">
            <MDBIcon fas icon="shopping-cart" size="4x" className="text-muted mb-4" />
            <h3 className="mb-3">Your cart is empty</h3>
            <p className="text-muted mb-4">Looks like you haven't added any items to your cart yet.</p>
            <Button
              style={{ backgroundColor: '#ed6335', border: 'none' }}
              onClick={() => navigate('/products')}
              className="px-4 py-2"
            >
              <MDBIcon fas icon="shopping-bag" className="me-2" />
              Start Shopping
            </Button>
          </div>
        </MDBContainer>
      </section>
    );
  }

  return (
    <section className="cart-section" style={{ backgroundColor: '#f8f9fa', paddingTop: '120px', paddingBottom: '70px', minHeight: '100vh' }}>
      <MDBContainer className="py-5">
        <MDBRow className="justify-content-center">
          <MDBCol size="12">
            <div className="cart-header mb-4 text-center">
              <h2 style={{ color: '#ed6335', fontWeight: 'bold' }}>
                <MDBIcon fas icon="shopping-cart" className="me-3" />
                Your Shopping Cart
              </h2>
              <p className="text-muted">{cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart</p>
            </div>

            <MDBCard className="cart-main-card" style={{ borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
              <MDBCardBody className="p-0">
                <MDBRow className="g-0">
                  {/* Cart Items */}
                  <MDBCol lg="8">
                    <div className="cart-items-section p-4">
                      {cart.map((item, index) => (
                        <div key={item._id || index} className="cart-item-wrapper mb-4">
                          <MDBRow className="cart-item p-3 align-items-center" style={{ backgroundColor: '#fff', borderRadius: '15px', border: '2px solid #f1f3f4' }}>
                            <MDBCol md="2">
                              <MDBCardImage
                                src={item?.product?.image || '/placeholder.jpg'}
                                alt={item?.product?.title || 'Product'}
                                fluid
                                style={{ borderRadius: '12px', objectFit: 'cover', width: '100%', height: '120px' }}
                              />
                            </MDBCol>
                            <MDBCol md="4">
                              <MDBTypography tag="span">{item?.product?.category || 'Category'}</MDBTypography>
                              <MDBTypography tag="h6">{item?.product?.title || 'Product Name'}</MDBTypography>
                              <div className="product-rating mt-2">
                                {[...Array(5)].map((_, i) => (
                                  <MDBIcon
                                    key={i}
                                    fas
                                    icon="star"
                                    className={i < 4 ? 'text-warning' : 'text-muted'}
                                    size="sm"
                                  />
                                ))}
                                <span className="ms-2 text-muted">(4.2)</span>
                              </div>
                            </MDBCol>
                            <MDBCol md="3" className="text-center">
                              <div className="d-flex align-items-center justify-content-center">
                                <Button
                                  color="light"
                                  onClick={() => handleQuantityChange(item._id, -1)}
                                  disabled={item.quantity <= 1}
                                  style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #ed6335', color: '#ed6335' }}
                                >
                                  <MDBIcon fas icon="minus" />
                                </Button>
                                <span className="px-4" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{item.quantity}</span>
                                <Button
                                  onClick={() => handleQuantityChange(item._id, 1)}
                                  style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ed6335', border: 'none' }}
                                >
                                  <MDBIcon fas icon="plus" />
                                </Button>
                              </div>
                            </MDBCol>
                            <MDBCol md="2" className="text-end">
                              <MDBTypography tag="h6" style={{ color: '#ed6335', fontWeight: 'bold' }}>
                                {handlePrice((item?.product?.price || 0) * item.quantity)}
                              </MDBTypography>
                              <small className="text-muted">{handlePrice(item?.product?.price || 0)} each</small>
                            </MDBCol>
                            <MDBCol md="1" className="text-end">
                              <button
                                onClick={() => handleRemoveItem(item?.product?._id)}
                                style={{ background: 'none', border: 'none', color: '#dc3545', fontSize: '1.2rem' }}
                              >
                                <MDBIcon fas icon="trash-alt" />
                              </button>
                            </MDBCol>
                          </MDBRow>
                          {index < cart.length - 1 && <hr className="my-4" />}
                        </div>
                      ))}

                      <Button color="link" onClick={() => navigate('/products')} className="text-decoration-none" style={{ color: '#ed6335' }}>
                        <MDBIcon fas icon="arrow-left" className="me-2" />
                        Continue Shopping
                      </Button>
                    </div>
                  </MDBCol>

                  {/* Order Summary */}
                  <MDBCol lg="4">
                    <div className="p-4">
                      <MDBTypography tag="h3" className="mb-4" style={{ color: '#2d3436', fontWeight: 'bold', borderBottom: '3px solid #ed6335', paddingBottom: '10px' }}>
                        Order Summary
                      </MDBTypography>

                      <div className="d-flex justify-content-between mb-3">
                        <span>Subtotal ({cart.length} items)</span>
                        <span>{handlePrice(totalPrice)}</span>
                      </div>

                      <div className="d-flex justify-content-between mb-3">
                        <span>Delivery Fee</span>
                        <span className={totalPrice >= 999 ? "text-success" : ""}>
                          {totalPrice >= 999 ? "Free" : handlePrice(99)}
                        </span>
                      </div>

                      {totalPrice < 999 && (
                        <div className="text-center mb-3">
                          <small className="text-muted">
                            <MDBIcon fas icon="info-circle" className="me-1" />
                            Add {handlePrice(999 - totalPrice)} more for free delivery!
                          </small>
                        </div>
                      )}

                      <hr className="my-4" style={{ borderColor: '#ed6335' }} />

                      <div className="d-flex justify-content-between mb-4">
                        <MDBTypography tag="h5" style={{ color: '#2d3436', fontWeight: 'bold' }}>Total</MDBTypography>
                        <MDBTypography tag="h5" style={{ color: '#ed6335', fontWeight: 'bold' }}>
                          {handlePrice(totalPrice + (totalPrice >= 999 ? 0 : 99))}
                        </MDBTypography>
                      </div>

                      <Button
                        className="w-100"
                        onClick={handleCheckout}
                        style={{
                          backgroundColor: '#ed6335',
                          border: 'none',
                          height: '60px',
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                          borderRadius: '15px',
                          boxShadow: '0 5px 15px rgba(237, 99, 53, 0.3)'
                        }}
                      >
                        <MDBIcon fas icon="credit-card" className="me-2" />
                        Proceed to Checkout
                      </Button>

                      <div className="text-center mt-3">
                        <small className="text-muted">
                          <MDBIcon fas icon="lock" className="me-1" />
                          Secure checkout with SSL encryption
                        </small>
                      </div>
                    </div>
                  </MDBCol>
                </MDBRow>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </section>
  );
}
