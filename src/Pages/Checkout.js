import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PetContext } from '../Context/Context';
import {
  MDBCard,
  MDBCardBody,
  MDBCol,
  MDBContainer,
  MDBIcon,
  MDBRow,
  MDBTypography,
  MDBInput,
  MDBTextArea,
  MDBRadio,
} from 'mdb-react-ui-kit';
import Button from '../Components/Button';
import '../Styles/Checkout.css';
import toast from 'react-hot-toast';

// API Base URL configuration
const API_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5001';

export default function Checkout() {
  const navigate = useNavigate();
  const {
    cart = [],
    totalPrice = 0,
    handlePrice,
    loginStatus,
    fetchCart,
  } = useContext(PetContext);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    streetAddress: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'razorpay',
    specialInstructions: ''
  });

  // Auto-fill form with profile data when component mounts
  useEffect(() => {
    const autoFillFromProfile = () => {
      const profileData = {
        fullName: localStorage.getItem('name') || localStorage.getItem('userName') || '',
        phoneNumber: localStorage.getItem('phone') || '',
        email: localStorage.getItem('email') || localStorage.getItem('userEmail') || '',
        streetAddress: localStorage.getItem('address') || '',
        city: localStorage.getItem('city') || '',
        state: localStorage.getItem('state') || '',
        pincode: localStorage.getItem('pincode') || ''
      };

      // Only update fields that are empty to avoid overwriting user input
      setFormData(prevState => ({
        ...prevState,
        fullName: prevState.fullName || profileData.fullName,
        phoneNumber: prevState.phoneNumber || profileData.phoneNumber,
        email: prevState.email || profileData.email,
        streetAddress: prevState.streetAddress || profileData.streetAddress,
        city: prevState.city || profileData.city,
        state: prevState.state || profileData.state,
        pincode: prevState.pincode || profileData.pincode
      }));
    };

    autoFillFromProfile();
  }, []);

  useEffect(() => {
    if (!loginStatus) {
      toast.error('Please log in to proceed with checkout');
      navigate('/login');
      return;
    }

    if (cart.length === 0) {
      fetchCart();
    }
  }, [loginStatus, cart.length, fetchCart, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Function to fill form with saved profile data
  const fillWithSavedProfile = () => {
    const profileData = {
      fullName: localStorage.getItem('name') || localStorage.getItem('userName') || '',
      phoneNumber: localStorage.getItem('phone') || '',
      email: localStorage.getItem('email') || localStorage.getItem('userEmail') || '',
      streetAddress: localStorage.getItem('address') || '',
      city: localStorage.getItem('city') || '',
      state: localStorage.getItem('state') || '',
      pincode: localStorage.getItem('pincode') || ''
    };

    // Check if any profile data exists
    const hasProfileData = Object.values(profileData).some(value => value.trim() !== '');
    
    if (hasProfileData) {
      setFormData(prevState => ({
        ...prevState,
        ...profileData
      }));
      toast.success('Profile information filled automatically!');
    } else {
      toast.info('No saved profile information found. Please fill your profile first.');
    }
  };

  const validateForm = () => {
    const { fullName, phoneNumber, email, streetAddress, city, state, pincode } = formData;
    
    if (!fullName.trim()) {
      toast.error('Please enter your full name');
      return false;
    }
    
    if (!phoneNumber.trim() || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return false;
    }
    
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    if (!streetAddress.trim()) {
      toast.error('Please enter your street address');
      return false;
    }
    
    if (!city.trim()) {
      toast.error('Please enter your city');
      return false;
    }
    
    if (!state.trim()) {
      toast.error('Please enter your state');
      return false;
    }
    
    if (!pincode.trim() || pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }
    
    return true;
  };

  const calculateOrderSummary = () => {
    const subtotal = totalPrice;
    const deliveryFee = subtotal >= 999 ? 0 : 99;
    const total = subtotal + deliveryFee;
    
    return { subtotal, deliveryFee, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);
    
    const userID = localStorage.getItem('userID');
    const { subtotal, deliveryFee, total } = calculateOrderSummary();
    
    const shippingAddress = {
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      streetAddress: formData.streetAddress,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      country: 'India'
    };

    try {
      if (formData.paymentMethod === 'cod') {
        // Handle COD order
        const response = await fetch(`${API_BASE_URL}/api/users/${userID}/cod-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            shippingAddress,
            phoneNumber: formData.phoneNumber,
            specialInstructions: formData.specialInstructions
          })
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
          toast.success('Order placed successfully! You will pay on delivery.');
          navigate('/orders');
        } else {
          toast.error(result.message || 'Failed to place order');
        }
      } else {
        // Handle Razorpay payment
        console.log('🚀 Initiating Razorpay payment...');
        const response = await fetch(`${API_BASE_URL}/api/users/${userID}/payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        
        console.log('📡 Payment response status:', response.status);
        const result = await response.json();
        console.log('📦 Payment response data:', result);
        
        if (result.status === 'success') {
          console.log('✅ Payment order created successfully');
          // Initialize Razorpay
          const options = {
            key: result.key,
            amount: result.amount * 100, // Convert to paisa
            currency: result.currency,
            name: 'MotluPets',
            description: `Order for ${cart.length} items`,
            order_id: result.orderId,
            handler: async function (razorpayResponse) {
              console.log('💳 Payment successful, verifying...', razorpayResponse);
              setLoading(true);
              // Verify payment
              try {
                const verifyResponse = await fetch(`${API_BASE_URL}/api/users/payment/verify`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  credentials: 'include',
                  body: JSON.stringify({
                    ...razorpayResponse,
                    shippingAddress,
                    phoneNumber: formData.phoneNumber,
                    specialInstructions: formData.specialInstructions
                  })
                });
                
                const verifyResult = await verifyResponse.json();
                console.log('🔍 Verification result:', verifyResult);
                
                if (verifyResponse.ok && verifyResult.status === 'success') {
                  toast.success('Payment successful! Order placed.');
                  
                  // Refresh cart to show empty state
                  if (fetchCart) {
                    await fetchCart();
                  }
                  
                  // Navigate to orders page
                  navigate('/orders');
                } else {
                  console.error('❌ Payment verification failed:', verifyResult);
                  toast.error(verifyResult.message || 'Payment verification failed');
                  // Don't redirect on verification failure, stay on checkout
                }
              } catch (error) {
                console.error('❌ Payment verification error:', error);
                toast.error('Payment verification failed');
                // Don't redirect on error, stay on checkout
              } finally {
                setLoading(false);
              }
            },
            modal: {
              ondismiss: function() {
                console.log('Razorpay modal dismissed');
                setLoading(false);
              }
            },
            // Add error handler for payment failures
            notes: {
              order_id: result.orderId,
              customer_name: formData.fullName
            },
            retry: {
              enabled: true,
              max_count: 3
            },
            prefill: {
              name: formData.fullName,
              email: formData.email,
              contact: formData.phoneNumber
            },
            theme: {
              color: '#ed6335'
            }
          };
          
          console.log('🎯 Opening Razorpay with options:', options);
          
          // Check if Razorpay is loaded
          if (!window.Razorpay) {
            throw new Error('Razorpay SDK not loaded. Please refresh the page and try again.');
          }
          
          const razorpayInstance = new window.Razorpay(options);
          
          // Add payment failure handler
          razorpayInstance.on('payment.failed', function (response) {
            console.error('❌ Payment failed:', response.error);
            setLoading(false);
            toast.error(`Payment failed: ${response.error.description || 'Unknown error'}`);
          });
          
          razorpayInstance.open();
        } else {
          console.error('❌ Payment order creation failed:', result);
          toast.error(result.message || 'Failed to initiate payment');
        }
      }
    } catch (error) {
      console.error('💥 Checkout error details:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!loginStatus) {
    return null; // Will redirect in useEffect
  }

  if (cart.length === 0) {
    return (
      <section className="checkout-loading-section">
        <MDBContainer className="py-5 h-100">
          <div className="text-center">
            <MDBIcon fas icon="shopping-cart" size="4x" className="text-muted mb-4" />
            <h3 className="mb-3">Your cart is empty</h3>
            <p className="text-muted mb-4">Add some items to proceed with checkout.</p>
            <Button
              style={{ backgroundColor: '#ed6335', border: 'none' }}
              onClick={() => navigate('/products')}
              className="px-4 py-2"
            >
              Start Shopping
            </Button>
          </div>
        </MDBContainer>
      </section>
    );
  }

  const { subtotal, deliveryFee, total } = calculateOrderSummary();

  return (
    <section className="checkout-section" style={{ backgroundColor: '#f8f9fa', paddingTop: '120px', paddingBottom: '70px', minHeight: '100vh' }}>
      <MDBContainer className="py-5">
        <MDBRow className="justify-content-center">
          <MDBCol size="12">
            <div className="checkout-header mb-4 text-center">
              <h2 style={{ color: '#ed6335', fontWeight: 'bold' }}>
                <MDBIcon fas icon="credit-card" className="me-3" />
                Checkout
              </h2>
              <p className="text-muted">Complete your order details</p>
            </div>

            <form onSubmit={handleSubmit}>
              <MDBRow>
                {/* Shipping Details */}
                <MDBCol lg="8" className="mb-4">
                  <MDBCard style={{ borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                    <MDBCardBody className="p-4">
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <MDBTypography tag="h4" className="mb-0" style={{ color: '#2d3436', fontWeight: 'bold' }}>
                          <MDBIcon fas icon="shipping-fast" className="me-2" />
                          Shipping Details
                        </MDBTypography>
                        <Button
                          onClick={fillWithSavedProfile}
                          style={{ 
                            backgroundColor: '#28a745', 
                            border: 'none',
                            fontSize: '0.85rem',
                            padding: '0.5rem 1rem'
                          }}
                          className="d-flex align-items-center"
                        >
                          <MDBIcon fas icon="user" className="me-2" />
                          Use Saved Profile
                        </Button>
                      </div>

                      <MDBRow className="mb-3">
                        <MDBCol md="6">
                          <MDBInput
                            label="Full Name *"
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                            className="mb-3"
                          />
                        </MDBCol>
                        <MDBCol md="6">
                          <MDBInput
                            label="Phone Number *"
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            required
                            className="mb-3"
                          />
                        </MDBCol>
                      </MDBRow>

                      <MDBInput
                        label="Email Address *"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="mb-3"
                      />

                      <MDBInput
                        label="Street Address *"
                        type="text"
                        name="streetAddress"
                        value={formData.streetAddress}
                        onChange={handleInputChange}
                        required
                        className="mb-3"
                      />

                      <MDBRow className="mb-3">
                        <MDBCol md="6">
                          <MDBInput
                            label="City *"
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            className="mb-3"
                          />
                        </MDBCol>
                        <MDBCol md="3">
                          <MDBInput
                            label="State *"
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            required
                            className="mb-3"
                          />
                        </MDBCol>
                        <MDBCol md="3">
                          <MDBInput
                            label="Pincode *"
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            required
                            maxLength="6"
                            className="mb-3"
                          />
                        </MDBCol>
                      </MDBRow>

                      <MDBTextArea
                        label="Special Instructions (Optional)"
                        name="specialInstructions"
                        value={formData.specialInstructions}
                        onChange={handleInputChange}
                        rows={3}
                        className="mb-3"
                      />

                      {/* Payment Method Selection */}
                      <MDBTypography tag="h5" className="mb-3" style={{ color: '#2d3436', fontWeight: 'bold' }}>
                        <MDBIcon fas icon="credit-card" className="me-2" />
                        Payment Method
                      </MDBTypography>

                      <div className="payment-methods mb-3">
                        <MDBRadio
                          name="paymentMethod"
                          id="razorpay"
                          value="razorpay"
                          label="Pay Online (Razorpay)"
                          checked={formData.paymentMethod === 'razorpay'}
                          onChange={handleInputChange}
                          className="mb-2"
                        />
                        <small className="text-muted d-block mb-3">
                          <MDBIcon fas icon="shield-alt" className="me-1" />
                          Secure payment via UPI, Cards, Net Banking, Wallets
                        </small>

                        <MDBRadio
                          name="paymentMethod"
                          id="cod"
                          value="cod"
                          label="Cash on Delivery (COD)"
                          checked={formData.paymentMethod === 'cod'}
                          onChange={handleInputChange}
                          className="mb-2"
                        />
                        <small className="text-muted d-block">
                          <MDBIcon fas icon="money-bill-wave" className="me-1" />
                          Pay when your order is delivered
                        </small>
                      </div>
                    </MDBCardBody>
                  </MDBCard>
                </MDBCol>

                {/* Order Summary */}
                <MDBCol lg="4">
                  <MDBCard style={{ borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', position: 'sticky', top: '140px' }}>
                    <MDBCardBody className="p-4">
                      <MDBTypography tag="h4" className="mb-4" style={{ color: '#2d3436', fontWeight: 'bold' }}>
                        Order Summary
                      </MDBTypography>

                      {/* Cart Items Preview */}
                      <div className="cart-preview mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {cart.map((item, index) => (
                          <div key={item._id || index} className="d-flex align-items-center mb-2 p-2" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                            <img
                              src={item?.product?.image || '/placeholder.jpg'}
                              alt={item?.product?.title}
                              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
                            />
                            <div className="ms-3 flex-grow-1">
                              <small className="fw-bold">{item?.product?.title}</small>
                              <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                                Qty: {item.quantity} × {handlePrice(item?.product?.price || 0)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <hr />

                      <div className="d-flex justify-content-between mb-2">
                        <span>Subtotal ({cart.length} items)</span>
                        <span>{handlePrice(subtotal)}</span>
                      </div>

                      <div className="d-flex justify-content-between mb-2">
                        <span>Delivery Fee</span>
                        <span className={deliveryFee === 0 ? "text-success" : ""}>
                          {deliveryFee === 0 ? "Free" : handlePrice(deliveryFee)}
                        </span>
                      </div>
                      
                      {deliveryFee > 0 && (
                        <div className="text-center mb-2">
                          <small className="text-muted">
                            <MDBIcon fas icon="info-circle" className="me-1" />
                            Add {handlePrice(999 - subtotal)} more for free delivery!
                          </small>
                        </div>
                      )}

                      <hr style={{ borderColor: '#ed6335' }} />

                      <div className="d-flex justify-content-between mb-4">
                        <MDBTypography tag="h5" style={{ color: '#2d3436', fontWeight: 'bold' }}>Total</MDBTypography>
                        <MDBTypography tag="h5" style={{ color: '#ed6335', fontWeight: 'bold' }}>
                          {handlePrice(total)}
                        </MDBTypography>
                      </div>

                      <Button
                        type="submit"
                        className="w-100"
                        disabled={loading}
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
                        {loading ? (
                          <>
                            <div className="spinner-border spinner-border-sm me-2" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <MDBIcon fas icon={formData.paymentMethod === 'cod' ? 'money-bill-wave' : 'credit-card'} className="me-2" />
                            {formData.paymentMethod === 'cod' ? 'Place Order (COD)' : 'Pay Now'}
                          </>
                        )}
                      </Button>

                      <div className="text-center mt-3">
                        <small className="text-muted">
                          <MDBIcon fas icon="lock" className="me-1" />
                          Secure checkout with SSL encryption
                        </small>
                      </div>
                    </MDBCardBody>
                  </MDBCard>
                </MDBCol>
              </MDBRow>
            </form>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </section>
  );
}
