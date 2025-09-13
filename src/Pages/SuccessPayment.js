import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PetContext } from '../Context/Context';
import { MDBContainer, MDBIcon, MDBTypography } from 'mdb-react-ui-kit';
import Button from '../Components/Button';

export default function SuccessPayment() {
  const { fetchCart } = useContext(PetContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Refresh cart to show empty state
    fetchCart();
    
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate('/orders');
    }, 5000);

    return () => clearTimeout(timer);
  }, [fetchCart, navigate]);

  return (
    <section style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingTop: '120px' }}>
      <MDBContainer className="py-5">
        <div className="text-center">
          {/* Success Animation */}
          <div style={{ marginBottom: '2rem' }}>
            <img 
              src="https://assets.materialup.com/uploads/9ba2d687-d7d3-4361-8aee-7b2a3c074761/preview.gif" 
              alt="Payment Success" 
              style={{ width: '200px', height: '200px', objectFit: 'contain' }}
            />
          </div>

          {/* Success Message */}
          <MDBIcon fas icon="check-circle" size="4x" style={{ color: '#28a745', marginBottom: '1rem' }} />
          
          <MDBTypography tag="h2" className="mb-3" style={{ color: '#28a745', fontWeight: 'bold' }}>
            Payment Successful!
          </MDBTypography>
          
          <MDBTypography tag="p" className="mb-4" style={{ color: '#6c757d', fontSize: '1.1rem' }}>
            Thank you for your order. Your payment has been processed successfully.
            You will receive a confirmation email shortly.
          </MDBTypography>

          {/* Order Details */}
          <div style={{ 
            backgroundColor: '#fff', 
            padding: '2rem', 
            borderRadius: '15px', 
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
            marginBottom: '2rem',
            maxWidth: '500px',
            margin: '0 auto 2rem auto'
          }}>
            <MDBTypography tag="h5" className="mb-3" style={{ color: '#2d3436' }}>
              What's Next?
            </MDBTypography>
            
            <div className="text-start">
              <p className="mb-2">
                <MDBIcon fas icon="shipping-fast" className="me-2" style={{ color: '#ed6335' }} />
                Your order is being processed
              </p>
              <p className="mb-2">
                <MDBIcon fas icon="envelope" className="me-2" style={{ color: '#ed6335' }} />
                Order confirmation sent to your email
              </p>
              <p className="mb-2">
                <MDBIcon fas icon="truck" className="me-2" style={{ color: '#ed6335' }} />
                Estimated delivery: 3-5 business days
              </p>
              <p className="mb-0">
                <MDBIcon fas icon="headset" className="me-2" style={{ color: '#ed6335' }} />
                Customer support available 24/7
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex flex-column flex-md-row justify-content-center gap-3">
            <Button
              onClick={() => navigate('/orders')}
              style={{
                backgroundColor: '#ed6335',
                border: 'none',
                padding: '12px 30px',
                borderRadius: '25px',
                fontWeight: 'bold'
              }}
            >
              <MDBIcon fas icon="list-alt" className="me-2" />
              View My Orders
            </Button>
            
            <Button
              onClick={() => navigate('/products')}
              style={{
                backgroundColor: 'transparent',
                border: '2px solid #ed6335',
                color: '#ed6335',
                padding: '12px 30px',
                borderRadius: '25px',
                fontWeight: 'bold'
              }}
            >
              <MDBIcon fas icon="shopping-bag" className="me-2" />
              Continue Shopping
            </Button>
          </div>

          {/* Auto redirect message */}
          <p className="mt-4 text-muted">
            <small>You will be redirected to your orders page in 5 seconds...</small>
          </p>
        </div>
      </MDBContainer>
    </section>
  );
}
