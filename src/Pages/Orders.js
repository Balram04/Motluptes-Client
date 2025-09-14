import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PetContext } from '../Context/Context';
import { axios } from '../Utils/Axios';
import toast from 'react-hot-toast';
import { 
  MDBIcon, 
  MDBCard, 
  MDBCardBody, 
  MDBRow, 
  MDBCol, 
  MDBTypography, 
  MDBBtn, 
  MDBModal, 
  MDBModalDialog, 
  MDBModalContent, 
  MDBModalHeader, 
  MDBModalTitle, 
  MDBModalBody, 
  MDBModalFooter,
  MDBBadge,
  MDBSpinner
} from 'mdb-react-ui-kit';

function Orders() {
  const { userID, handlePrice, loginStatus } = useContext(PetContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(false);
  const [supportModal, setSupportModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const navigate = useNavigate();

  // Debug logging for modal states
  console.log('Modal states:', { cancelModal, supportModal, selectedOrder: selectedOrder?._id });

  const toggleOrderExpansion = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  useEffect(() => {
    // Check authentication - now using cookie-based auth
    const storedUserID = localStorage.getItem('userID');
    
    if (!storedUserID || !loginStatus) {
      toast.error('Please login to view orders');
      navigate('/login');
      return;
    }
    
    fetchOrders();
  }, [userID, loginStatus, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Get fresh userID from localStorage (no need for token check as it's in cookies)
      const currentUserID = localStorage.getItem('userID');
      
      if (!currentUserID) {
        toast.error('Please login to view orders');
        navigate('/login');
        return;
      }
      
      const response = await axios.get(`/api/users/${currentUserID}/orders`);
      setOrders(response.data.data || []);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        localStorage.clear();
        navigate('/login');
        return;
      }
      
      if (error.response?.status === 404 || error.response?.data?.message === 'You have no orders') {
        setOrders([]);
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'processing':
        return 'primary';
      case 'shipped':
        return 'info';
      case 'out for delivery':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'danger';
      case 'returned':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'danger';
      case 'refunded':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const canCancelOrder = (order) => {
    const cancelableStatuses = ['pending', 'confirmed', 'processing'];
    return cancelableStatuses.includes(order.status?.toLowerCase()) && order.status !== 'cancelled';
  };

  const handleCancelOrder = async () => {
    console.log('handleCancelOrder called with selectedOrder:', selectedOrder);
    if (!selectedOrder) {
      console.log('No selected order, returning');
      return;
    }
    
    try {
      setCancelling(true);
      const currentUserID = localStorage.getItem('userID');
      
      if (!currentUserID) {
        toast.error('Please login again');
        navigate('/login');
        return;
      }
      
      console.log('Cancelling order:', selectedOrder._id, 'for user:', currentUserID);
      
      const response = await axios.put(`/api/users/${currentUserID}/orders/${selectedOrder._id}/cancel`);
      
      console.log('Cancel response:', response.data);
      
      if (response.data.success) {
        toast.success('Order cancelled successfully');
        
        // Update the order in the state with more details
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === selectedOrder._id 
              ? { 
                  ...order, 
                  status: 'cancelled',
                  cancelledAt: new Date(),
                  payment_status: order.payment_method !== 'cod' && order.payment_status === 'completed' 
                    ? 'refund_pending' 
                    : order.payment_status
                }
              : order
          )
        );
        
        // Show refund information if applicable
        if (response.data.data.refundStatus) {
          toast.info(response.data.data.refundStatus, { duration: 5000 });
        }
        
        setCancelModal(false);
        setSelectedOrder(null);
      } else {
        toast.error(response.data.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Cancel order error:', error);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        localStorage.clear();
        navigate('/login');
        return;
      }
      
      if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Order cannot be cancelled at this time');
      } else if (error.response?.status === 403) {
        toast.error('You are not authorized to cancel this order');
      } else if (error.response?.status === 404) {
        toast.error('Order not found');
      } else {
        toast.error(error.response?.data?.message || 'Failed to cancel order. Please try again.');
      }
    } finally {
      setCancelling(false);
    }
  };

  const handleContactSupport = (order) => {
    setSelectedOrder(order);
    setSupportModal(true);
  };

  const sendSupportMessage = async (message) => {
    try {
      const currentUserID = localStorage.getItem('userID');
      
      if (!currentUserID) {
        toast.error('Please login again');
        navigate('/login');
        return;
      }
      
      const response = await axios.post('/api/support/contact', {
        userId: currentUserID,
        orderId: selectedOrder._id,
        message: message,
        subject: `Support for Order #${selectedOrder._id.slice(-6).toUpperCase()}`
      });
      
      if (response.data.success) {
        toast.success('Support message sent successfully. We will contact you soon!');
        setSupportModal(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        localStorage.clear();
        navigate('/login');
        return;
      }
      toast.error(error.response?.data?.message || 'Failed to send message');
    }
  };

  const getOrderProgress = (status) => {
    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'out for delivery', 'delivered'];
    const currentIndex = statuses.findIndex(s => s === status?.toLowerCase());
    return currentIndex >= 0 ? ((currentIndex + 1) / statuses.length) * 100 : 0;
  };

  if (loading) {
    return (
      <section className="d-flex justify-content-center align-items-center" style={{ height: '400px', paddingTop: '80px' }}>
        <div>
          <MDBSpinner size="lg" role="status" className="me-3">
            <span className="visually-hidden">Loading...</span>
          </MDBSpinner>
          <MDBTypography tag="h5">Loading your orders...</MDBTypography>
        </div>
      </section>
    );
  }

  // Additional authentication check - now using cookie-based auth
  const storedUserID = localStorage.getItem('userID');
  
  if (!storedUserID || !loginStatus) {
    return (
      <section className="d-flex justify-content-center align-items-center" style={{ height: '400px', paddingTop: '80px' }}>
        <div className="text-center">
          <MDBIcon fas icon="lock" size="4x" className="text-muted mb-3" />
          <MDBTypography tag="h4" className="text-muted mb-3">Please Login</MDBTypography>
          <MDBTypography tag="p" className="text-muted mb-4">
            You need to be logged in to view your orders.
          </MDBTypography>
          <MDBBtn 
            color="primary"
            size="lg"
            onClick={() => navigate('/login')}
            style={{ backgroundColor: '#ed6335', border: 'none' }}
          >
            <MDBIcon fas icon="sign-in-alt" className="me-2" />
            Login Now
          </MDBBtn>
        </div>
      </section>
    );
  }

  return (
    <section className="vh-100" style={{ paddingTop: '80px', backgroundColor: '#f8f9fa' }}>
      <div className="container-fluid px-4">
        <MDBRow className="justify-content-center">
          <MDBCol xl="8" lg="10" md="12">
            {/* Header */}
            <div className="text-center mb-4">
              <MDBTypography tag="h2" className="fw-bold mb-2" style={{ color: '#2d3436' }}>
                <MDBIcon fas icon="shopping-bag" className="me-2" style={{ color: '#ed6335' }} />
                My Orders ({orders.length})
              </MDBTypography>
            </div>

            {orders.length === 0 ? (
              <MDBCard className="text-center p-4" style={{ borderRadius: '15px' }}>
                <MDBCardBody>
                  <MDBIcon fas icon="shopping-bag" size="3x" style={{ color: '#ed6335', opacity: 0.5 }} className="mb-3" />
                  <MDBTypography tag="h4" className="mb-3" style={{ color: '#2d3436' }}>
                    No Orders Yet
                  </MDBTypography>
                  <MDBBtn 
                    onClick={() => navigate('/products')}
                    style={{ backgroundColor: '#ed6335', border: 'none', borderRadius: '25px' }}
                  >
                    <MDBIcon fas icon="shopping-cart" className="me-2" />
                    Start Shopping
                  </MDBBtn>
                </MDBCardBody>
              </MDBCard>
            ) : (
              <div className="orders-list">
                {orders.map((order) => {
                  const isExpanded = expandedOrders.has(order._id);
                  return (
                    <MDBCard key={order._id} className="mb-3 shadow-sm" style={{ borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                      {/* Compact Order Header - Always Visible */}
                      <div 
                        className="p-3 cursor-pointer" 
                        onClick={() => toggleOrderExpansion(order._id)}
                        style={{ 
                          borderBottom: isExpanded ? '1px solid #f0f0f0' : 'none',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                      >
                        <MDBRow className="align-items-center">
                          <MDBCol md="6">
                            <div className="d-flex align-items-center">
                              <div className="me-3">
                                <MDBTypography tag="h6" className="mb-1 fw-bold" style={{ color: '#2d3436' }}>
                                  #{order._id.slice(-6).toUpperCase()}
                                </MDBTypography>
                                <small className="text-muted">
                                  {formatDate(order.createdAt)}
                                </small>
                              </div>
                            </div>
                          </MDBCol>
                          
                          <MDBCol md="3" className="text-center">
                            <MDBBadge 
                              color={getStatusColor(order.status)} 
                              className="px-3 py-2"
                              style={{ fontSize: '0.85rem' }}
                            >
                              {order.status?.toUpperCase() || 'PENDING'}
                            </MDBBadge>
                          </MDBCol>
                          
                          <MDBCol md="2" className="text-end">
                            <MDBTypography tag="h6" className="mb-0 fw-bold" style={{ color: '#ed6335' }}>
                              {handlePrice(order.total_amount)}
                            </MDBTypography>
                          </MDBCol>
                          
                          <MDBCol md="1" className="text-end">
                            <MDBIcon 
                              fas 
                              icon={isExpanded ? "chevron-up" : "chevron-down"} 
                              style={{ color: '#6c757d' }} 
                            />
                          </MDBCol>
                        </MDBRow>
                      </div>

                      {/* Expanded Details - Show only when clicked */}
                      {isExpanded && (
                        <div className="p-3" style={{ backgroundColor: '#fafafa' }}>
                          {/* Order Items - Compact View */}
                          <div className="mb-3">
                            <MDBTypography tag="h6" className="mb-2 fw-bold" style={{ color: '#2d3436' }}>
                              Items ({order.products?.length || 0})
                            </MDBTypography>
                            <div className="row g-2">
                              {order.products?.slice(0, 3).map((item, index) => (
                                <div key={index} className="col-12">
                                  <div className="d-flex align-items-center p-2" style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                                    <img
                                      src={item.product?.image || '/default-product.jpg'}
                                      alt={item.product?.title || 'Product'}
                                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }}
                                      className="me-3"
                                    />
                                    <div className="flex-grow-1">
                                      <MDBTypography tag="div" className="fw-bold" style={{ fontSize: '0.9rem', color: '#2d3436' }}>
                                        {item.product?.title || 'Product Unavailable'}
                                      </MDBTypography>
                                      <small className="text-muted">
                                        Qty: {item.quantity} × {handlePrice(item.price)}
                                      </small>
                                    </div>
                                    <div className="text-end">
                                      <strong style={{ color: '#ed6335', fontSize: '0.9rem' }}>
                                        {handlePrice(item.price * item.quantity)}
                                      </strong>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {order.products?.length > 3 && (
                                <div className="col-12">
                                  <small className="text-muted">
                                    +{order.products.length - 3} more items
                                  </small>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Quick Info Row */}
                          <div className="row g-3 mb-3">
                            <div className="col-md-6">
                              <div className="p-2" style={{ backgroundColor: 'white', borderRadius: '8px' }}>
                                <small className="text-muted d-block">Payment Method</small>
                                <strong>{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</strong>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="p-2" style={{ backgroundColor: 'white', borderRadius: '8px' }}>
                                <small className="text-muted d-block">Order Total</small>
                                <strong style={{ color: '#ed6335' }}>{handlePrice(order.total_amount)}</strong>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons - Compact */}
                          <div className="d-flex gap-2 flex-wrap">
                            {canCancelOrder(order) && (
                              <MDBBtn 
                                color="danger" 
                                size="sm"
                                outline
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('Cancel button clicked for order:', order._id);
                                  console.log('Setting selectedOrder:', order);
                                  setSelectedOrder(order);
                                  console.log('Opening cancel modal');
                                  setCancelModal(true);
                                }}
                                style={{ borderRadius: '20px' }}
                                disabled={cancelling}
                              >
                                <MDBIcon fas icon="times" className="me-1" />
                                Cancel
                              </MDBBtn>
                            )}
                            
                            <MDBBtn 
                              color="info" 
                              size="sm"
                              outline
                              onClick={(e) => {
                                e.stopPropagation();
                                handleContactSupport(order);
                              }}
                              style={{ borderRadius: '20px' }}
                            >
                              <MDBIcon fas icon="headset" className="me-1" />
                              Support
                            </MDBBtn>

                            {order.status === 'delivered' && (
                              <MDBBtn 
                                color="warning" 
                                size="sm"
                                outline
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/review/${order._id}`);
                                }}
                                style={{ borderRadius: '20px' }}
                              >
                                <MDBIcon fas icon="star" className="me-1" />
                                Review
                              </MDBBtn>
                            )}

                            {order.tracking_number && (
                              <MDBBtn 
                                color="secondary" 
                                size="sm"
                                outline
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`https://track.example.com/${order.tracking_number}`, '_blank');
                                }}
                                style={{ borderRadius: '20px' }}
                              >
                                <MDBIcon fas icon="truck" className="me-1" />
                                Track
                              </MDBBtn>
                            )}
                          </div>

                          {/* Additional Details - Only show if needed */}
                          {(order.shipping_address || order.special_instructions || order.tracking_number) && (
                            <div className="mt-3 pt-3" style={{ borderTop: '1px solid #e9ecef' }}>
                              {order.shipping_address && (
                                <div className="mb-2">
                                  <small className="text-muted d-block">Delivery Address</small>
                                  <div style={{ fontSize: '0.9rem' }}>
                                    {order.shipping_address.fullName}<br />
                                    {order.shipping_address.streetAddress}, {order.shipping_address.city} - {order.shipping_address.pincode}
                                  </div>
                                </div>
                              )}
                              
                              {order.special_instructions && (
                                <div className="mb-2">
                                  <small className="text-muted d-block">Special Instructions</small>
                                  <div style={{ fontSize: '0.9rem' }}>{order.special_instructions}</div>
                                </div>
                              )}
                              
                              {order.tracking_number && (
                                <div className="mb-2">
                                  <small className="text-muted d-block">Tracking Number</small>
                                  <code style={{ fontSize: '0.85rem' }}>{order.tracking_number}</code>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </MDBCard>
                  );
                })}
              </div>
            )}
          </MDBCol>
        </MDBRow>
      </div>

      {/* Debug: Simple modal fallback */}
      {cancelModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => setCancelModal(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '10px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: '#dc3545', marginBottom: '15px' }}>
              ⚠️ Cancel Order
            </h3>
            {selectedOrder && (
              <div>
                <p>Are you sure you want to cancel order #{selectedOrder._id.slice(-6).toUpperCase()}?</p>
                <p><strong>Total: {handlePrice(selectedOrder.total_amount)}</strong></p>
                <p><strong>Payment: {selectedOrder.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</strong></p>
                
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => setCancelModal(false)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                    disabled={cancelling}
                  >
                    Keep Order
                  </button>
                  <button 
                    onClick={handleCancelOrder}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                    disabled={cancelling}
                  >
                    {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      <MDBModal 
        open={cancelModal} 
        setOpen={setCancelModal} 
        tabIndex="-1"
        style={{ zIndex: 9999 }}
      >
        <MDBModalDialog centered style={{ zIndex: 10000 }}>
          <MDBModalContent style={{ 
            borderRadius: '20px', 
            border: 'none',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            zIndex: 10001
          }}>
            <MDBModalHeader style={{ borderBottom: '2px solid #f1f3f4', padding: '1.5rem' }}>
              <MDBModalTitle>
                <div className="d-flex align-items-center">
                  <div 
                    className="me-3 p-2 rounded-circle d-flex align-items-center justify-content-center"
                    style={{ backgroundColor: '#fff3cd', color: '#856404', width: '40px', height: '40px' }}
                  >
                    <MDBIcon fas icon="exclamation-triangle" />
                  </div>
                  <div>
                    <h5 className="mb-0 fw-bold" style={{ color: '#2d3436' }}>Cancel Order</h5>
                    <small className="text-muted">This action cannot be undone</small>
                  </div>
                </div>
              </MDBModalTitle>
            </MDBModalHeader>
            <MDBModalBody style={{ padding: '1.5rem' }}>
              <MDBTypography tag="p" className="mb-3" style={{ fontSize: '1.1rem', color: '#2d3436' }}>
                Are you sure you want to cancel this order?
              </MDBTypography>
              
              {selectedOrder && (
                <div 
                  className="p-4 mb-4" 
                  style={{ 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '15px',
                    border: '2px solid #e9ecef'
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <MDBTypography tag="h6" className="mb-1 fw-bold" style={{ color: '#2d3436' }}>
                        Order #{selectedOrder._id.slice(-6).toUpperCase()}
                      </MDBTypography>
                      <small className="text-muted">
                        <MDBIcon fas icon="calendar" className="me-1" />
                        {formatDate(selectedOrder.createdAt)}
                      </small>
                      <div className="mt-1">
                        <MDBBadge color={getStatusColor(selectedOrder.status)} size="sm">
                          Status: {selectedOrder.status?.toUpperCase()}
                        </MDBBadge>
                      </div>
                    </div>
                    <div className="text-end">
                      <MDBTypography tag="h5" className="mb-0 fw-bold" style={{ color: '#ed6335' }}>
                        {handlePrice(selectedOrder.total_amount)}
                      </MDBTypography>
                      <small className="text-muted">
                        {selectedOrder.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                      </small>
                    </div>
                  </div>
                </div>
              )}
              
              <div 
                className="p-3" 
                style={{ 
                  backgroundColor: '#d1ecf1', 
                  borderRadius: '10px',
                  border: '1px solid #bee5eb'
                }}
              >
                <MDBIcon fas icon="info-circle" className="me-2" style={{ color: '#0c5460' }} />
                <small style={{ color: '#0c5460' }}>
                  <strong>Refund Policy:</strong> If you paid online, your refund will be processed within 3-5 business days. 
                  For COD orders, no payment has been collected yet.
                </small>
              </div>
            </MDBModalBody>
            <MDBModalFooter style={{ borderTop: '2px solid #f1f3f4', padding: '1.5rem' }}>
              <MDBBtn 
                color="light"
                onClick={() => setCancelModal(false)}
                disabled={cancelling}
                style={{ 
                  borderRadius: '50px',
                  padding: '10px 25px',
                  fontWeight: 'bold',
                  border: '2px solid #6c757d'
                }}
              >
                <MDBIcon fas icon="arrow-left" className="me-2" />
                Keep Order
              </MDBBtn>
              <MDBBtn 
                color="danger" 
                onClick={handleCancelOrder}
                disabled={cancelling}
                style={{ 
                  borderRadius: '50px',
                  padding: '10px 25px',
                  fontWeight: 'bold',
                  border: 'none'
                }}
                className="shadow-sm"
              >
                {cancelling ? (
                  <>
                    <MDBSpinner size="sm" role="status" className="me-2" />
                    Cancelling Order...
                  </>
                ) : (
                  <>
                    <MDBIcon fas icon="times-circle" className="me-2" />
                    Yes, Cancel Order
                  </>
                )}
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>

      {/* Contact Support Modal */}
      <MDBModal open={supportModal} setOpen={setSupportModal} tabIndex="-1">
        <MDBModalDialog centered size="lg">
          <MDBModalContent style={{ borderRadius: '20px', border: 'none' }}>
            <MDBModalHeader style={{ borderBottom: '2px solid #f1f3f4', padding: '1.5rem' }}>
              <MDBModalTitle>
                <div className="d-flex align-items-center">
                  <div 
                    className="me-3 p-2 rounded-circle d-flex align-items-center justify-content-center"
                    style={{ backgroundColor: '#d1ecf1', color: '#0c5460', width: '40px', height: '40px' }}
                  >
                    <MDBIcon fas icon="headset" />
                  </div>
                  <div>
                    <h5 className="mb-0 fw-bold" style={{ color: '#2d3436' }}>Contact Support</h5>
                    <small className="text-muted">We're here to help you</small>
                  </div>
                </div>
              </MDBModalTitle>
            </MDBModalHeader>
            <MDBModalBody style={{ padding: '1.5rem' }}>
              {selectedOrder && (
                <div className="mb-4">
                  <div 
                    className="p-4 mb-4" 
                    style={{ 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '15px',
                      border: '2px solid #e9ecef'
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <MDBTypography tag="h6" className="mb-0 fw-bold" style={{ color: '#2d3436' }}>
                        Order #{selectedOrder._id.slice(-6).toUpperCase()}
                      </MDBTypography>
                      <MDBBadge color={getStatusColor(selectedOrder.status)} size="lg">
                        {selectedOrder.status?.toUpperCase()}
                      </MDBBadge>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        <MDBIcon fas icon="calendar" className="me-1" />
                        {formatDate(selectedOrder.createdAt)}
                      </small>
                      <MDBTypography tag="h6" className="mb-0 fw-bold" style={{ color: '#ed6335' }}>
                        {handlePrice(selectedOrder.total_amount)}
                      </MDBTypography>
                    </div>
                  </div>
                  
                  <MDBTypography tag="h5" className="mb-4 fw-bold" style={{ color: '#2d3436' }}>
                    <MDBIcon fas icon="question-circle" className="me-2" style={{ color: '#ed6335' }} />
                    How can we help you?
                  </MDBTypography>
                  
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <div 
                        onClick={() => sendSupportMessage("I need help with my order delivery status and estimated delivery time.")}
                        className="p-4 h-100 text-center border-0 shadow-sm"
                        style={{ 
                          backgroundColor: '#fff', 
                          borderRadius: '15px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          border: '2px solid #17a2b8'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-5px)';
                          e.target.style.boxShadow = '0 10px 25px rgba(23, 162, 184, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                        }}
                      >
                        <MDBIcon fas icon="truck" size="2x" className="mb-3" style={{ color: '#17a2b8' }} />
                        <h6 className="fw-bold mb-2" style={{ color: '#2d3436' }}>Track Order</h6>
                        <small className="text-muted">Delivery status & tracking info</small>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div 
                        onClick={() => sendSupportMessage("I received a damaged or incorrect item in my order. Please help me with return/exchange.")}
                        className="p-4 h-100 text-center border-0 shadow-sm"
                        style={{ 
                          backgroundColor: '#fff', 
                          borderRadius: '15px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          border: '2px solid #ffc107'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-5px)';
                          e.target.style.boxShadow = '0 10px 25px rgba(255, 193, 7, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                        }}
                      >
                        <MDBIcon fas icon="exchange-alt" size="2x" className="mb-3" style={{ color: '#ffc107' }} />
                        <h6 className="fw-bold mb-2" style={{ color: '#2d3436' }}>Return/Exchange</h6>
                        <small className="text-muted">Product return or exchange</small>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div 
                        onClick={() => sendSupportMessage("I have a billing or payment related inquiry for my order.")}
                        className="p-4 h-100 text-center border-0 shadow-sm"
                        style={{ 
                          backgroundColor: '#fff', 
                          borderRadius: '15px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          border: '2px solid #dc3545'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-5px)';
                          e.target.style.boxShadow = '0 10px 25px rgba(220, 53, 69, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                        }}
                      >
                        <MDBIcon fas icon="credit-card" size="2x" className="mb-3" style={{ color: '#dc3545' }} />
                        <h6 className="fw-bold mb-2" style={{ color: '#2d3436' }}>Payment Issue</h6>
                        <small className="text-muted">Billing & payment help</small>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div 
                        onClick={() => sendSupportMessage("I have a general inquiry about my order. Please contact me.")}
                        className="p-4 h-100 text-center border-0 shadow-sm"
                        style={{ 
                          backgroundColor: '#fff', 
                          borderRadius: '15px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          border: '2px solid #6c757d'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-5px)';
                          e.target.style.boxShadow = '0 10px 25px rgba(108, 117, 125, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                        }}
                      >
                        <MDBIcon fas icon="question-circle" size="2x" className="mb-3" style={{ color: '#6c757d' }} />
                        <h6 className="fw-bold mb-2" style={{ color: '#2d3436' }}>Other Inquiry</h6>
                        <small className="text-muted">General questions & help</small>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className="p-4" 
                    style={{ 
                      background: 'linear-gradient(135deg, #ed6335 0%, #ff8a65 100%)',
                      borderRadius: '15px',
                      color: 'white'
                    }}
                  >
                    <div className="row align-items-center">
                      <div className="col-md-2 text-center">
                        <MDBIcon fas icon="phone" size="2x" />
                      </div>
                      <div className="col-md-10">
                        <h6 className="fw-bold mb-2">24/7 Customer Support</h6>
                        <div className="row">
                          <div className="col-sm-6">
                            <small className="d-block">📞 1-800-DOGHUB</small>
                            <small className="d-block">✉️ support@doghub.com</small>
                          </div>
                          <div className="col-sm-6">
                            <small className="d-block">💬 Live Chat Available</small>
                            <small className="d-block">⏰ Response within 1 hour</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </MDBModalBody>
            <MDBModalFooter style={{ borderTop: '2px solid #f1f3f4', padding: '1.5rem' }}>
              <MDBBtn 
                color="light"
                onClick={() => setSupportModal(false)}
                style={{ 
                  borderRadius: '50px',
                  padding: '10px 25px',
                  fontWeight: 'bold',
                  border: '2px solid #6c757d'
                }}
              >
                <MDBIcon fas icon="times" className="me-2" />
                Close
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </section>
  );
}

export default Orders;
