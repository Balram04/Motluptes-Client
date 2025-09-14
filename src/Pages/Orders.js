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
  MDBSpinner,
  MDBContainer,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem,
  MDBInput,
  MDBProgress,
  MDBProgressBar
} from 'mdb-react-ui-kit';

// Add custom styles for hover effects
const customStyles = `
  .hover-shadow:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
    transition: all 0.3s ease;
  }
  
  .order-card {
    transition: all 0.3s ease;
  }
  
  .order-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(255, 107, 53, 0.15) !important;
  }
  
  .stats-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.1) !important;
  }
  
  .timeline-icon {
    transition: all 0.3s ease;
  }
  
  .timeline-icon:hover {
    transform: scale(1.1);
  }
  
  .product-image {
    transition: all 0.3s ease;
  }
  
  .product-image:hover {
    transform: scale(1.05);
  }
  
  /* Mobile Specific Styles */
  @media (max-width: 768px) {
    .order-card:hover {
      transform: none;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important;
    }
    
    .stats-card:hover {
      transform: none;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05) !important;
    }
    
    .order-card {
      margin-bottom: 1rem !important;
    }
    
    .mobile-compact {
      font-size: 0.85rem;
    }
    
    .mobile-btn {
      font-size: 0.75rem;
      padding: 0.375rem 0.75rem;
    }
  }
`;

// Add the styles to the document head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = customStyles;
  document.head.appendChild(styleSheet);
}

function Orders() {
  const { userID, handlePrice, loginStatus } = useContext(PetContext);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(false);
  const [supportModal, setSupportModal] = useState(false);
  const [orderDetailsModal, setOrderDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Order status statistics
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  });

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
      const orderData = response.data.data || [];
      setOrders(orderData);
      setFilteredOrders(orderData);
      
      // Calculate order statistics
      const stats = orderData.reduce((acc, order) => {
        acc.total++;
        const status = order.status?.toLowerCase() || 'pending';
        if (acc[status] !== undefined) {
          acc[status]++;
        }
        return acc;
      }, {
        total: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0
      });
      
      setOrderStats(stats);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        localStorage.clear();
        navigate('/login');
        return;
      }
      
      if (error.response?.status === 404 || error.response?.data?.message === 'You have no orders') {
        setOrders([]);
        setFilteredOrders([]);
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch orders');
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort orders
  useEffect(() => {
    let filtered = [...orders];
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => 
        order.status?.toLowerCase() === filterStatus.toLowerCase()
      );
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.products?.some(item => 
          item.product?.title?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'amount_high':
          return b.total_amount - a.total_amount;
        case 'amount_low':
          return a.total_amount - b.total_amount;
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
    
    setFilteredOrders(filtered);
  }, [orders, filterStatus, sortBy, searchTerm]);

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
    const statusMap = {
      'pending': 16.67,
      'confirmed': 33.33,
      'processing': 50,
      'shipped': 66.67,
      'out for delivery': 83.33,
      'delivered': 100,
      'cancelled': 0
    };
    return statusMap[status?.toLowerCase()] || 0;
  };

  const getProgressColor = (status) => {
    const statusMap = {
      'pending': '#ffc107',
      'confirmed': '#17a2b8',
      'processing': '#007bff',
      'shipped': '#6f42c1',
      'out for delivery': '#fd7e14',
      'delivered': '#28a745',
      'cancelled': '#dc3545'
    };
    return statusMap[status?.toLowerCase()] || '#6c757d';
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setOrderDetailsModal(true);
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
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingTop: '7rem', paddingBottom: '2rem' }}>
      <MDBContainer className="px-3 px-md-4">
        {/* Header Section */}
        <div className="text-center mb-4 mb-md-5">
          <MDBTypography tag="h2" className="fw-bold mb-2 d-none d-md-block" style={{ color: '#2c3e50' }}>
            <MDBIcon fas icon="shopping-bag" className="me-3" style={{ color: '#ff6b35' }} />
            My Orders
          </MDBTypography>
          <MDBTypography tag="h4" className="fw-bold mb-2 d-block d-md-none" style={{ color: '#2c3e50' }}>
            <MDBIcon fas icon="shopping-bag" className="me-2" style={{ color: '#ff6b35' }} />
            My Orders
          </MDBTypography>
          <p className="text-muted d-none d-md-block">Track and manage all your orders</p>
        </div>

        {/* Order Statistics Cards - Mobile Optimized */}
        <div className="d-none d-md-block">
          {/* Desktop View - Full Stats */}
          <MDBRow className="mb-4">
            <MDBCol md="2" className="mb-3">
              <MDBCard className="h-100 text-center border-0 shadow-sm stats-card" style={{ borderRadius: '15px' }}>
                <MDBCardBody className="p-3">
                  <MDBIcon fas icon="list" size="2x" className="mb-2" style={{ color: '#6c757d' }} />
                  <h4 className="mb-1 fw-bold" style={{ color: '#2c3e50' }}>{orderStats.total}</h4>
                  <small className="text-muted">Total Orders</small>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
            <MDBCol md="2" className="mb-3">
              <MDBCard className="h-100 text-center border-0 shadow-sm stats-card" style={{ borderRadius: '15px' }}>
                <MDBCardBody className="p-3">
                  <MDBIcon fas icon="clock" size="2x" className="mb-2" style={{ color: '#ffc107' }} />
                  <h4 className="mb-1 fw-bold" style={{ color: '#2c3e50' }}>{orderStats.pending}</h4>
                  <small className="text-muted">Pending</small>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
            <MDBCol md="2" className="mb-3">
              <MDBCard className="h-100 text-center border-0 shadow-sm stats-card" style={{ borderRadius: '15px' }}>
                <MDBCardBody className="p-3">
                  <MDBIcon fas icon="cog" size="2x" className="mb-2" style={{ color: '#007bff' }} />
                  <h4 className="mb-1 fw-bold" style={{ color: '#2c3e50' }}>{orderStats.processing}</h4>
                  <small className="text-muted">Processing</small>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
            <MDBCol md="2" className="mb-3">
              <MDBCard className="h-100 text-center border-0 shadow-sm stats-card" style={{ borderRadius: '15px' }}>
                <MDBCardBody className="p-3">
                  <MDBIcon fas icon="shipping-fast" size="2x" className="mb-2" style={{ color: '#6f42c1' }} />
                  <h4 className="mb-1 fw-bold" style={{ color: '#2c3e50' }}>{orderStats.shipped}</h4>
                  <small className="text-muted">Shipped</small>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
            <MDBCol md="2" className="mb-3">
              <MDBCard className="h-100 text-center border-0 shadow-sm stats-card" style={{ borderRadius: '15px' }}>
                <MDBCardBody className="p-3">
                  <MDBIcon fas icon="check-circle" size="2x" className="mb-2" style={{ color: '#28a745' }} />
                  <h4 className="mb-1 fw-bold" style={{ color: '#2c3e50' }}>{orderStats.delivered}</h4>
                  <small className="text-muted">Delivered</small>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
            <MDBCol md="2" className="mb-3">
              <MDBCard className="h-100 text-center border-0 shadow-sm stats-card" style={{ borderRadius: '15px' }}>
                <MDBCardBody className="p-3">
                  <MDBIcon fas icon="times-circle" size="2x" className="mb-2" style={{ color: '#dc3545' }} />
                  <h4 className="mb-1 fw-bold" style={{ color: '#2c3e50' }}>{orderStats.cancelled}</h4>
                  <small className="text-muted">Cancelled</small>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          </MDBRow>
        </div>

        {/* Mobile View - Compact Stats */}
        <div className="d-block d-md-none mb-4">
          <MDBCard className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
            <MDBCardBody className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-center">
                  <h5 className="mb-0 fw-bold" style={{ color: '#ff6b35' }}>{orderStats.total}</h5>
                  <small className="text-muted">Total Orders</small>
                </div>
                <div className="text-center">
                  <h5 className="mb-0 fw-bold" style={{ color: '#ffc107' }}>{orderStats.pending}</h5>
                  <small className="text-muted">Pending</small>
                </div>
                <div className="text-center">
                  <h5 className="mb-0 fw-bold" style={{ color: '#28a745' }}>{orderStats.delivered}</h5>
                  <small className="text-muted">Delivered</small>
                </div>
                <div className="text-center">
                  <h5 className="mb-0 fw-bold" style={{ color: '#dc3545' }}>{orderStats.cancelled}</h5>
                  <small className="text-muted">Cancelled</small>
                </div>
              </div>
            </MDBCardBody>
          </MDBCard>
        </div>

        {/* Filters and Search - Mobile Optimized */}
        <MDBCard className="mb-4 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
          <MDBCardBody className="p-3 p-md-4">
            {/* Desktop View */}
            <div className="d-none d-md-block">
              <MDBRow className="align-items-center">
                <MDBCol md="4" className="mb-3 mb-md-0">
                  <MDBInput
                    label="Search orders or products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="shadow-sm"
                    style={{ borderRadius: '25px' }}
                  />
                </MDBCol>
                <MDBCol md="3" className="mb-3 mb-md-0">
                  <MDBDropdown>
                    <MDBDropdownToggle
                      color="light"
                      className="w-100 shadow-sm"
                      style={{ borderRadius: '25px', border: '1px solid #dee2e6' }}
                    >
                      <MDBIcon fas icon="filter" className="me-2" />
                      {filterStatus === 'all' ? 'All Orders' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                    </MDBDropdownToggle>
                    <MDBDropdownMenu>
                      <MDBDropdownItem onClick={() => setFilterStatus('all')}>All Orders</MDBDropdownItem>
                      <MDBDropdownItem onClick={() => setFilterStatus('pending')}>Pending</MDBDropdownItem>
                      <MDBDropdownItem onClick={() => setFilterStatus('processing')}>Processing</MDBDropdownItem>
                      <MDBDropdownItem onClick={() => setFilterStatus('shipped')}>Shipped</MDBDropdownItem>
                      <MDBDropdownItem onClick={() => setFilterStatus('delivered')}>Delivered</MDBDropdownItem>
                      <MDBDropdownItem onClick={() => setFilterStatus('cancelled')}>Cancelled</MDBDropdownItem>
                    </MDBDropdownMenu>
                  </MDBDropdown>
                </MDBCol>
                <MDBCol md="3" className="mb-3 mb-md-0">
                  <MDBDropdown>
                    <MDBDropdownToggle
                      color="light"
                      className="w-100 shadow-sm"
                      style={{ borderRadius: '25px', border: '1px solid #dee2e6' }}
                    >
                      <MDBIcon fas icon="sort" className="me-2" />
                      {sortBy === 'newest' ? 'Newest First' : 
                       sortBy === 'oldest' ? 'Oldest First' :
                       sortBy === 'amount_high' ? 'Amount: High to Low' : 'Amount: Low to High'}
                    </MDBDropdownToggle>
                    <MDBDropdownMenu>
                      <MDBDropdownItem onClick={() => setSortBy('newest')}>Newest First</MDBDropdownItem>
                      <MDBDropdownItem onClick={() => setSortBy('oldest')}>Oldest First</MDBDropdownItem>
                      <MDBDropdownItem onClick={() => setSortBy('amount_high')}>Amount: High to Low</MDBDropdownItem>
                      <MDBDropdownItem onClick={() => setSortBy('amount_low')}>Amount: Low to High</MDBDropdownItem>
                    </MDBDropdownMenu>
                  </MDBDropdown>
                </MDBCol>
                <MDBCol md="2" className="text-end">
                  <MDBBtn
                    color="primary"
                    onClick={fetchOrders}
                    className="shadow-sm"
                    style={{ borderRadius: '25px', backgroundColor: '#ff6b35', border: 'none' }}
                  >
                    <MDBIcon fas icon="sync-alt" className={loading ? 'fa-spin' : ''} />
                  </MDBBtn>
                </MDBCol>
              </MDBRow>
            </div>

            {/* Mobile View */}
            <div className="d-block d-md-none">
              <div className="mb-3">
                <MDBInput
                  label="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ borderRadius: '15px' }}
                />
              </div>
              <MDBRow>
                <MDBCol xs="6" className="pe-2">
                  <MDBDropdown>
                    <MDBDropdownToggle
                      color="light"
                      className="w-100"
                      style={{ borderRadius: '15px', border: '1px solid #dee2e6', fontSize: '0.9rem' }}
                    >
                      <MDBIcon fas icon="filter" className="me-1" />
                      {filterStatus === 'all' ? 'All' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                    </MDBDropdownToggle>
                    <MDBDropdownMenu>
                      <MDBDropdownItem onClick={() => setFilterStatus('all')}>All Orders</MDBDropdownItem>
                      <MDBDropdownItem onClick={() => setFilterStatus('pending')}>Pending</MDBDropdownItem>
                      <MDBDropdownItem onClick={() => setFilterStatus('processing')}>Processing</MDBDropdownItem>
                      <MDBDropdownItem onClick={() => setFilterStatus('shipped')}>Shipped</MDBDropdownItem>
                      <MDBDropdownItem onClick={() => setFilterStatus('delivered')}>Delivered</MDBDropdownItem>
                      <MDBDropdownItem onClick={() => setFilterStatus('cancelled')}>Cancelled</MDBDropdownItem>
                    </MDBDropdownMenu>
                  </MDBDropdown>
                </MDBCol>
                <MDBCol xs="6" className="ps-2">
                  <MDBDropdown>
                    <MDBDropdownToggle
                      color="light"
                      className="w-100"
                      style={{ borderRadius: '15px', border: '1px solid #dee2e6', fontSize: '0.9rem' }}
                    >
                      <MDBIcon fas icon="sort" className="me-1" />
                      {sortBy === 'newest' ? 'Newest' : 
                       sortBy === 'oldest' ? 'Oldest' :
                       sortBy === 'amount_high' ? 'High $' : 'Low $'}
                    </MDBDropdownToggle>
                    <MDBDropdownMenu>
                      <MDBDropdownItem onClick={() => setSortBy('newest')}>Newest First</MDBDropdownItem>
                      <MDBDropdownItem onClick={() => setSortBy('oldest')}>Oldest First</MDBDropdownItem>
                      <MDBDropdownItem onClick={() => setSortBy('amount_high')}>Amount: High to Low</MDBDropdownItem>
                      <MDBDropdownItem onClick={() => setSortBy('amount_low')}>Amount: Low to High</MDBDropdownItem>
                    </MDBDropdownMenu>
                  </MDBDropdown>
                </MDBCol>
              </MDBRow>
            </div>
          </MDBCardBody>
        </MDBCard>

        {loading ? (
          <div className="text-center py-5">
            <MDBSpinner size="lg" className="me-3" />
            <MDBTypography tag="h5" className="text-muted">Loading your orders...</MDBTypography>
          </div>
        ) : filteredOrders.length === 0 ? (
          <MDBCard className="text-center border-0 shadow-sm" style={{ borderRadius: '20px' }}>
            <MDBCardBody className="p-4 p-md-5">
              <div className="mb-3 mb-md-4">
                <MDBIcon 
                  fas 
                  icon={searchTerm || filterStatus !== 'all' ? "search" : "shopping-bag"} 
                  size="3x" 
                  className="d-block d-md-none"
                  style={{ color: '#ff6b35', opacity: 0.5 }} 
                />
                <MDBIcon 
                  fas 
                  icon={searchTerm || filterStatus !== 'all' ? "search" : "shopping-bag"} 
                  size="4x" 
                  className="d-none d-md-block"
                  style={{ color: '#ff6b35', opacity: 0.5 }} 
                />
              </div>
              <MDBTypography tag="h5" className="mb-2 mb-md-3 d-block d-md-none" style={{ color: '#2c3e50' }}>
                {searchTerm || filterStatus !== 'all' ? 'No Orders Found' : 'No Orders Yet'}
              </MDBTypography>
              <MDBTypography tag="h4" className="mb-3 d-none d-md-block" style={{ color: '#2c3e50' }}>
                {searchTerm || filterStatus !== 'all' ? 'No Orders Found' : 'No Orders Yet'}
              </MDBTypography>
              <p className="text-muted mb-3 mb-md-4" style={{ fontSize: '0.9rem' }}>
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start shopping to see your orders here'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <MDBBtn 
                  onClick={() => navigate('/products')}
                  size="lg"
                  className="shadow-sm"
                  style={{ backgroundColor: '#ff6b35', border: 'none', borderRadius: '25px' }}
                >
                  <MDBIcon fas icon="shopping-cart" className="me-2" />
                  <span className="d-none d-md-inline">Start Shopping</span>
                  <span className="d-inline d-md-none">Shop Now</span>
                </MDBBtn>
              )}
            </MDBCardBody>
          </MDBCard>
        ) : (
          /* Orders List - Mobile Optimized */
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <MDBCard key={order._id} className="mb-4 border-0 shadow-sm order-card" style={{ borderRadius: '20px' }}>
                <MDBCardBody className="p-3 p-md-4">
                  {/* Desktop Order Header */}
                  <div className="d-none d-md-block">
                    <MDBRow className="align-items-center mb-3">
                      <MDBCol md="6">
                        <div className="d-flex align-items-center">
                          <div 
                            className="order-icon me-3 d-flex align-items-center justify-content-center"
                            style={{
                              width: '50px',
                              height: '50px',
                              backgroundColor: getProgressColor(order.status),
                              borderRadius: '50%',
                              color: 'white'
                            }}
                          >
                            <MDBIcon fas icon="shopping-bag" size="lg" />
                          </div>
                          <div>
                            <MDBTypography tag="h5" className="mb-1 fw-bold" style={{ color: '#2c3e50' }}>
                              Order #{order._id.slice(-8).toUpperCase()}
                            </MDBTypography>
                            <small className="text-muted">
                              <MDBIcon fas icon="calendar" className="me-1" />
                              {formatDate(order.createdAt)}
                            </small>
                          </div>
                        </div>
                      </MDBCol>
                      <MDBCol md="3" className="text-center">
                        <MDBBadge 
                          color={getStatusColor(order.status)}
                          size="lg"
                          className="px-3 py-2"
                          style={{ borderRadius: '15px', fontSize: '0.9rem' }}
                        >
                          {order.status?.toUpperCase() || 'PENDING'}
                        </MDBBadge>
                      </MDBCol>
                      <MDBCol md="3" className="text-end">
                        <MDBTypography tag="h4" className="mb-0 fw-bold" style={{ color: '#ff6b35' }}>
                          {handlePrice(order.total_amount)}
                        </MDBTypography>
                        <small className="text-muted">{order.products?.length || 0} items</small>
                      </MDBCol>
                    </MDBRow>
                  </div>

                  {/* Mobile Order Header */}
                  <div className="d-block d-md-none">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center">
                        <div 
                          className="order-icon me-2 d-flex align-items-center justify-content-center"
                          style={{
                            width: '35px',
                            height: '35px',
                            backgroundColor: getProgressColor(order.status),
                            borderRadius: '50%',
                            color: 'white'
                          }}
                        >
                          <MDBIcon fas icon="shopping-bag" />
                        </div>
                        <div>
                          <h6 className="mb-0 fw-bold" style={{ color: '#2c3e50' }}>
                            #{order._id.slice(-6).toUpperCase()}
                          </h6>
                          <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                      <div className="text-end">
                        <h5 className="mb-0 fw-bold" style={{ color: '#ff6b35' }}>
                          {handlePrice(order.total_amount)}
                        </h5>
                        <MDBBadge 
                          color={getStatusColor(order.status)}
                          size="sm"
                          style={{ borderRadius: '10px', fontSize: '0.7rem' }}
                        >
                          {order.status?.toUpperCase() || 'PENDING'}
                        </MDBBadge>
                      </div>
                    </div>
                  </div>

                  {/* Order Progress - Desktop Only */}
                  <div className="mb-3 d-none d-md-block">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <small className="text-muted fw-bold">Order Progress</small>
                      <small className="text-muted">{getOrderProgress(order.status)}% Complete</small>
                    </div>
                    <MDBProgress height="8" style={{ borderRadius: '10px' }}>
                      <MDBProgressBar 
                        width={getOrderProgress(order.status)}
                        valuemin={0}
                        valuemax={100}
                        style={{ 
                          backgroundColor: getProgressColor(order.status),
                          borderRadius: '10px'
                        }}
                      />
                    </MDBProgress>
                  </div>

                  {/* Mobile Progress Bar */}
                  <div className="mb-3 d-block d-md-none">
                    <MDBProgress height="4" style={{ borderRadius: '5px' }}>
                      <MDBProgressBar 
                        width={getOrderProgress(order.status)}
                        valuemin={0}
                        valuemax={100}
                        style={{ 
                          backgroundColor: getProgressColor(order.status),
                          borderRadius: '5px'
                        }}
                      />
                    </MDBProgress>
                  </div>

                  {/* Product Preview - Desktop */}
                  <div className="mb-3 d-none d-md-block">
                    <div className="d-flex align-items-center overflow-hidden">
                      {order.products?.slice(0, 3).map((item, index) => (
                        <div key={index} className="d-flex align-items-center me-4">
                          <img
                            src={item.product?.image || '/default-product.jpg'}
                            alt={item.product?.title || 'Product'}
                            className="product-image me-2"
                            style={{ 
                              width: '40px', 
                              height: '40px', 
                              objectFit: 'cover', 
                              borderRadius: '8px',
                              border: '2px solid #f8f9fa'
                            }}
                          />
                          <div>
                            <small className="fw-bold d-block" style={{ color: '#2c3e50' }}>
                              {item.product?.title?.substring(0, 20) || 'Product'}
                              {item.product?.title?.length > 20 && '...'}
                            </small>
                            <small className="text-muted">Qty: {item.quantity}</small>
                          </div>
                        </div>
                      ))}
                      {order.products?.length > 3 && (
                        <small className="text-muted">+{order.products.length - 3} more</small>
                      )}
                    </div>
                  </div>

                  {/* Mobile Product Preview */}
                  <div className="mb-3 d-block d-md-none">
                    <div className="d-flex align-items-center">
                      {order.products?.slice(0, 2).map((item, index) => (
                        <img
                          key={index}
                          src={item.product?.image || '/default-product.jpg'}
                          alt={item.product?.title || 'Product'}
                          style={{ 
                            width: '30px', 
                            height: '30px', 
                            objectFit: 'cover', 
                            borderRadius: '6px',
                            border: '2px solid #f8f9fa',
                            marginRight: '8px'
                          }}
                        />
                      ))}
                      <small className="text-muted">
                        {order.products?.length || 0} item{order.products?.length !== 1 ? 's' : ''}
                        {order.products?.length > 2 && ` (+${order.products.length - 2} more)`}
                      </small>
                    </div>
                  </div>

                  {/* Action Buttons - Desktop */}
                  <div className="d-none d-md-flex gap-2 flex-wrap">
                    <MDBBtn 
                      color="primary"
                      size="sm"
                      onClick={() => openOrderDetails(order)}
                      style={{ borderRadius: '20px', backgroundColor: '#ff6b35', border: 'none' }}
                    >
                      <MDBIcon fas icon="eye" className="me-2" />
                      View Details
                    </MDBBtn>
                    
                    {canCancelOrder(order) && (
                      <MDBBtn 
                        color="danger" 
                        size="sm"
                        outline
                        onClick={() => {
                          setSelectedOrder(order);
                          setCancelModal(true);
                        }}
                        style={{ borderRadius: '20px' }}
                      >
                        <MDBIcon fas icon="times" className="me-2" />
                        Cancel
                      </MDBBtn>
                    )}
                    
                    <MDBBtn 
                      color="info" 
                      size="sm"
                      outline
                      onClick={() => handleContactSupport(order)}
                      style={{ borderRadius: '20px' }}
                    >
                      <MDBIcon fas icon="headset" className="me-2" />
                      Support
                    </MDBBtn>

                    {order.status === 'delivered' && (
                      <MDBBtn 
                        color="warning" 
                        size="sm"
                        outline
                        onClick={() => navigate(`/review/${order._id}`)}
                        style={{ borderRadius: '20px' }}
                      >
                        <MDBIcon fas icon="star" className="me-2" />
                        Review
                      </MDBBtn>
                    )}

                    {order.tracking_number && (
                      <MDBBtn 
                        color="secondary" 
                        size="sm"
                        outline
                        onClick={() => window.open(`https://track.example.com/${order.tracking_number}`, '_blank')}
                        style={{ borderRadius: '20px' }}
                      >
                        <MDBIcon fas icon="truck" className="me-2" />
                        Track
                      </MDBBtn>
                    )}
                  </div>

                  {/* Mobile Action Buttons */}
                  <div className="d-block d-md-none">
                    <MDBRow>
                      <MDBCol xs="6" className="pe-1 mb-2">
                        <MDBBtn 
                          color="primary"
                          size="sm"
                          onClick={() => openOrderDetails(order)}
                          className="w-100"
                          style={{ borderRadius: '15px', backgroundColor: '#ff6b35', border: 'none', fontSize: '0.8rem' }}
                        >
                          <MDBIcon fas icon="eye" className="me-1" />
                          Details
                        </MDBBtn>
                      </MDBCol>
                      <MDBCol xs="6" className="ps-1 mb-2">
                        <MDBBtn 
                          color="info" 
                          size="sm"
                          outline
                          onClick={() => handleContactSupport(order)}
                          className="w-100"
                          style={{ borderRadius: '15px', fontSize: '0.8rem' }}
                        >
                          <MDBIcon fas icon="headset" className="me-1" />
                          Support
                        </MDBBtn>
                      </MDBCol>
                      {canCancelOrder(order) && (
                        <MDBCol xs="6" className="pe-1">
                          <MDBBtn 
                            color="danger" 
                            size="sm"
                            outline
                            onClick={() => {
                              setSelectedOrder(order);
                              setCancelModal(true);
                            }}
                            className="w-100"
                            style={{ borderRadius: '15px', fontSize: '0.8rem' }}
                          >
                            <MDBIcon fas icon="times" className="me-1" />
                            Cancel
                          </MDBBtn>
                        </MDBCol>
                      )}
                      {order.tracking_number && (
                        <MDBCol xs="6" className="ps-1">
                          <MDBBtn 
                            color="secondary" 
                            size="sm"
                            outline
                            onClick={() => window.open(`https://track.example.com/${order.tracking_number}`, '_blank')}
                            className="w-100"
                            style={{ borderRadius: '15px', fontSize: '0.8rem' }}
                          >
                            <MDBIcon fas icon="truck" className="me-1" />
                            Track
                          </MDBBtn>
                        </MDBCol>
                      )}
                    </MDBRow>
                  </div>
                </MDBCardBody>
              </MDBCard>
            ))}
          </div>
        )}
      </MDBContainer>

      {/* Order Details Modal */}
      <MDBModal open={orderDetailsModal} setOpen={setOrderDetailsModal} size="xl">
        <MDBModalDialog centered>
          <MDBModalContent style={{ borderRadius: '20px', border: 'none' }}>
            <MDBModalHeader style={{ borderBottom: '2px solid #f1f3f4', padding: '1.5rem' }}>
              <MDBModalTitle>
                <div className="d-flex align-items-center">
                  <div 
                    className="me-3 p-2 rounded-circle d-flex align-items-center justify-content-center"
                    style={{ 
                      backgroundColor: selectedOrder ? getProgressColor(selectedOrder.status) : '#ff6b35', 
                      color: 'white', 
                      width: '50px', 
                      height: '50px' 
                    }}
                  >
                    <MDBIcon fas icon="shopping-bag" size="lg" />
                  </div>
                  <div>
                    <h4 className="mb-0 fw-bold" style={{ color: '#2c3e50' }}>
                      Order #{selectedOrder?._id.slice(-8).toUpperCase()}
                    </h4>
                    <small className="text-muted">Complete order information</small>
                  </div>
                </div>
              </MDBModalTitle>
            </MDBModalHeader>
            <MDBModalBody style={{ padding: '2rem', maxHeight: '70vh', overflowY: 'auto' }}>
              {selectedOrder && (
                <div>
                  {/* Order Status & Progress */}
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h5 className="mb-1" style={{ color: '#2c3e50' }}>Order Status</h5>
                        <small className="text-muted">Track your order progress</small>
                      </div>
                      <MDBBadge 
                        color={getStatusColor(selectedOrder.status)}
                        size="lg"
                        className="px-4 py-2"
                        style={{ borderRadius: '20px', fontSize: '1rem' }}
                      >
                        {selectedOrder.status?.toUpperCase() || 'PENDING'}
                      </MDBBadge>
                    </div>
                    
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-2">
                        <small className="fw-bold text-muted">Progress: {getOrderProgress(selectedOrder.status)}%</small>
                        <small className="text-muted">
                          <MDBIcon fas icon="calendar" className="me-1" />
                          {formatDate(selectedOrder.createdAt)}
                        </small>
                      </div>
                      <MDBProgress height="12" style={{ borderRadius: '10px' }}>
                        <MDBProgressBar 
                          width={getOrderProgress(selectedOrder.status)}
                          valuemin={0}
                          valuemax={100}
                          style={{ 
                            backgroundColor: getProgressColor(selectedOrder.status),
                            borderRadius: '10px'
                          }}
                        />
                      </MDBProgress>
                    </div>
                    
                    {/* Status Timeline */}
                    <div className="mt-4">
                      <h6 className="mb-3 fw-bold" style={{ color: '#2c3e50' }}>Order Timeline</h6>
                      <div className="timeline">
                        {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((status, index) => {
                          const isCompleted = getOrderProgress(selectedOrder.status) > (index * 20);
                          const isCurrent = selectedOrder.status?.toLowerCase() === status;
                          return (
                            <div key={status} className="d-flex align-items-center mb-3">
                              <div 
                                className="timeline-icon me-3 d-flex align-items-center justify-content-center"
                                style={{
                                  width: '30px',
                                  height: '30px',
                                  borderRadius: '50%',
                                  backgroundColor: isCompleted || isCurrent ? getProgressColor(status) : '#e9ecef',
                                  color: isCompleted || isCurrent ? 'white' : '#6c757d'
                                }}
                              >
                                <MDBIcon fas icon="check" size="sm" />
                              </div>
                              <div>
                                <div className="fw-bold" style={{ 
                                  color: isCompleted || isCurrent ? '#2c3e50' : '#6c757d',
                                  fontSize: '0.9rem'
                                }}>
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </div>
                                {isCurrent && (
                                  <small className="text-primary fw-bold">Current Status</small>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4">
                    <h5 className="mb-3 fw-bold" style={{ color: '#2c3e50' }}>
                      <MDBIcon fas icon="box" className="me-2" style={{ color: '#ff6b35' }} />
                      Order Items ({selectedOrder.products?.length || 0})
                    </h5>
                    <div className="row g-3">
                      {selectedOrder.products?.map((item, index) => (
                        <div key={index} className="col-12">
                          <div 
                            className="d-flex align-items-center p-3"
                            style={{ 
                              backgroundColor: '#f8f9fa', 
                              borderRadius: '15px',
                              border: '1px solid #e9ecef'
                            }}
                          >
                            <img
                              src={item.product?.image || '/default-product.jpg'}
                              alt={item.product?.title || 'Product'}
                              style={{ 
                                width: '80px', 
                                height: '80px', 
                                objectFit: 'cover', 
                                borderRadius: '12px',
                                border: '2px solid white'
                              }}
                              className="me-3"
                            />
                            <div className="flex-grow-1">
                              <h6 className="mb-1 fw-bold" style={{ color: '#2c3e50' }}>
                                {item.product?.title || 'Product Unavailable'}
                              </h6>
                              <p className="mb-1 text-muted" style={{ fontSize: '0.9rem' }}>
                                {item.product?.description?.substring(0, 100) || 'No description available'}
                                {item.product?.description?.length > 100 && '...'}
                              </p>
                              <div className="d-flex align-items-center">
                                <MDBBadge color="light" className="me-2">
                                  Qty: {item.quantity}
                                </MDBBadge>
                                <MDBBadge color="light">
                                  Unit Price: {handlePrice(item.price)}
                                </MDBBadge>
                              </div>
                            </div>
                            <div className="text-end">
                              <h5 className="mb-0 fw-bold" style={{ color: '#ff6b35' }}>
                                {handlePrice(item.price * item.quantity)}
                              </h5>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="mb-4">
                    <h5 className="mb-3 fw-bold" style={{ color: '#2c3e50' }}>
                      <MDBIcon fas icon="receipt" className="me-2" style={{ color: '#ff6b35' }} />
                      Order Summary
                    </h5>
                    <div 
                      className="p-4"
                      style={{ 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '15px',
                        border: '1px solid #e9ecef'
                      }}
                    >
                      <MDBRow>
                        <MDBCol md="6">
                          <div className="mb-3">
                            <small className="text-muted d-block">Order ID</small>
                            <div className="fw-bold">{selectedOrder._id}</div>
                          </div>
                          <div className="mb-3">
                            <small className="text-muted d-block">Order Date</small>
                            <div className="fw-bold">{formatDate(selectedOrder.createdAt)}</div>
                          </div>
                          <div className="mb-3">
                            <small className="text-muted d-block">Payment Method</small>
                            <div className="fw-bold">
                              {selectedOrder.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                            </div>
                          </div>
                        </MDBCol>
                        <MDBCol md="6">
                          <div className="mb-3">
                            <small className="text-muted d-block">Payment Status</small>
                            <MDBBadge color={getPaymentStatusColor(selectedOrder.payment_status)}>
                              {selectedOrder.payment_status?.toUpperCase() || 'PENDING'}
                            </MDBBadge>
                          </div>
                          <div className="mb-3">
                            <small className="text-muted d-block">Total Items</small>
                            <div className="fw-bold">{selectedOrder.products?.length || 0} items</div>
                          </div>
                          <div className="mb-3">
                            <small className="text-muted d-block">Order Total</small>
                            <h4 className="mb-0 fw-bold" style={{ color: '#ff6b35' }}>
                              {handlePrice(selectedOrder.total_amount)}
                            </h4>
                          </div>
                        </MDBCol>
                      </MDBRow>
                    </div>
                  </div>

                  {/* Shipping Information */}
                  {selectedOrder.shipping_address && (
                    <div className="mb-4">
                      <h5 className="mb-3 fw-bold" style={{ color: '#2c3e50' }}>
                        <MDBIcon fas icon="shipping-fast" className="me-2" style={{ color: '#ff6b35' }} />
                        Shipping Information
                      </h5>
                      <div 
                        className="p-4"
                        style={{ 
                          backgroundColor: '#f8f9fa', 
                          borderRadius: '15px',
                          border: '1px solid #e9ecef'
                        }}
                      >
                        <div className="mb-3">
                          <small className="text-muted d-block">Delivery Address</small>
                          <div className="fw-bold">
                            {selectedOrder.shipping_address.fullName}<br />
                            {selectedOrder.shipping_address.streetAddress}<br />
                            {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.pincode}
                            {selectedOrder.shipping_address.phone && (
                              <><br />Phone: {selectedOrder.shipping_address.phone}</>
                            )}
                          </div>
                        </div>
                        {selectedOrder.tracking_number && (
                          <div className="mb-3">
                            <small className="text-muted d-block">Tracking Number</small>
                            <div className="d-flex align-items-center">
                              <code className="me-3">{selectedOrder.tracking_number}</code>
                              <MDBBtn 
                                size="sm"
                                color="primary"
                                onClick={() => window.open(`https://track.example.com/${selectedOrder.tracking_number}`, '_blank')}
                                style={{ borderRadius: '15px' }}
                              >
                                <MDBIcon fas icon="external-link-alt" className="me-1" />
                                Track Package
                              </MDBBtn>
                            </div>
                          </div>
                        )}
                        {selectedOrder.special_instructions && (
                          <div className="mb-3">
                            <small className="text-muted d-block">Special Instructions</small>
                            <div className="fw-bold">{selectedOrder.special_instructions}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </MDBModalBody>
            <MDBModalFooter style={{ borderTop: '2px solid #f1f3f4', padding: '1.5rem' }}>
              <div className="d-flex gap-2 w-100">
                {selectedOrder && canCancelOrder(selectedOrder) && (
                  <MDBBtn 
                    color="danger" 
                    outline
                    onClick={() => {
                      setOrderDetailsModal(false);
                      setCancelModal(true);
                    }}
                    style={{ borderRadius: '25px' }}
                  >
                    <MDBIcon fas icon="times" className="me-2" />
                    Cancel Order
                  </MDBBtn>
                )}
                
                <MDBBtn 
                  color="info" 
                  outline
                  onClick={() => {
                    setOrderDetailsModal(false);
                    setSupportModal(true);
                  }}
                  style={{ borderRadius: '25px' }}
                >
                  <MDBIcon fas icon="headset" className="me-2" />
                  Contact Support
                </MDBBtn>
                
                <div className="ms-auto">
                  <MDBBtn 
                    color="light"
                    onClick={() => setOrderDetailsModal(false)}
                    style={{ 
                      borderRadius: '25px',
                      border: '2px solid #6c757d'
                    }}
                  >
                    <MDBIcon fas icon="times" className="me-2" />
                    Close
                  </MDBBtn>
                </div>
              </div>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>

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
    </div>
  );
}

export default Orders;
