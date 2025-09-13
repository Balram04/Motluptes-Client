import React, { useContext, useEffect, useState } from 'react';
import { axios } from '../Utils/Axios';
import { MDBIcon } from 'mdb-react-ui-kit';
import { PetContext } from '../Context/Context';
import toast from 'react-hot-toast';

export default function OrdersAdmin() {
  const { handlePrice } = useContext(PetContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'all') return true;
    return order.status?.toLowerCase() === statusFilter;
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/admin/orders');
      if (response.status === 200) {
        setOrders(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch orders');
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
        return 'text-warning';
      case 'confirmed':
        return 'text-info';
      case 'processing':
        return 'text-info';
      case 'shipped':
        return 'text-primary';
      case 'out for delivery':
        return 'text-primary';
      case 'delivered':
        return 'text-success';
      case 'cancelled':
        return 'text-danger';
      case 'returned':
        return 'text-secondary';
      default:
        return 'text-muted';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-warning';
      case 'confirmed':
        return 'bg-info';
      case 'processing':
        return 'bg-info';
      case 'shipped':
        return 'bg-primary';
      case 'out for delivery':
        return 'bg-primary';
      case 'delivered':
        return 'bg-success';
      case 'cancelled':
        return 'bg-danger';
      case 'returned':
        return 'bg-secondary';
      default:
        return 'bg-muted';
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/admin/orders/${orderId}`, { status: newStatus });
      toast.success('Order status updated successfully');
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center p-5">
        <MDBIcon fas icon="shopping-bag" size="4x" className="text-muted mb-3" />
        <h4 className="text-muted">No orders found</h4>
        <p className="text-muted">Orders will appear here once customers start placing them.</p>
      </div>
    );
  }

  return (
    <div className="orders-admin" style={{ width: '100%', maxWidth: 'none' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>
          <MDBIcon fas icon="shopping-bag" className="me-2" />
          Orders Management
        </h3>
        <div className="d-flex gap-2 align-items-center">
          <select 
            className="form-select form-select-sm" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="out for delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="returned">Returned</option>
          </select>
          <span className="badge bg-primary">{filteredOrders.length} / {orders.length} Orders</span>
          <span className="badge bg-warning">{orders.filter(o => o.status === 'pending').length} Pending</span>
          <span className="badge bg-success">{orders.filter(o => o.status === 'delivered').length} Delivered</span>
          <span className="badge bg-danger">{orders.filter(o => o.status === 'cancelled').length} Cancelled</span>
          <button className="btn btn-outline-primary btn-sm" onClick={fetchOrders}>
            <MDBIcon fas icon="refresh" className="me-1" />
            Refresh
          </button>
        </div>
      </div>

      <div className="dashboard-table" style={{ width: '100%', margin: '0', padding: '20px' }}>
        <div className="table-responsive">
          <table className="table table-hover" style={{ minWidth: '1200px' }}>
            <thead>
              <tr>
                <th style={{ minWidth: '100px' }}>Order ID</th>
                <th style={{ minWidth: '150px' }}>Customer</th>
                <th style={{ minWidth: '120px' }}>Date</th>
                <th style={{ minWidth: '120px' }}>Items</th>
                <th style={{ minWidth: '100px' }}>Total Amount</th>
                <th style={{ minWidth: '150px' }}>Status</th>
                <th style={{ minWidth: '130px' }}>Payment</th>
                <th style={{ minWidth: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id} className={order.status === 'cancelled' ? 'table-danger' : ''}>
                  <td>
                    <span className="badge bg-light text-dark">
                      {order._id.slice(-6).toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div>
                      <strong>{order.user?.name || 'Unknown'}</strong>
                      <br />
                      <small className="text-muted">{order.user?.email || 'N/A'}</small>
                    </div>
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    <div>
                      {order.products?.length || 0} items
                      <br />
                      <small className="text-muted">
                        {order.products?.map((item, index) => (
                          <span key={index}>
                            {item.product?.title?.slice(0, 15) || 'Product'}
                            {index < order.products.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </small>
                    </div>
                  </td>
                  <td>
                    <strong>{handlePrice(order.total_amount || 0)}</strong>
                  </td>
                  <td>
                    <select
                      className={`form-select form-select-sm ${getStatusColor(order.status)}`}
                      value={order.status || 'pending'}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      disabled={order.status === 'cancelled' || order.status === 'delivered'}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="out for delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="returned">Returned</option>
                    </select>
                    {order.status === 'cancelled' && order.cancelledAt && (
                      <small className="text-muted d-block mt-1">
                        <MDBIcon fas icon="clock" className="me-1" />
                        Cancelled: {formatDate(order.cancelledAt)}
                      </small>
                    )}
                  </td>
                  <td>
                    <div>
                      <span className={`badge ${
                        order.payment_status === 'completed' || order.payment_status === 'paid' ? 'bg-success' : 
                        order.payment_status === 'failed' ? 'bg-danger' : 
                        order.payment_status === 'refund_pending' ? 'bg-warning' :
                        order.payment_status === 'refunded' ? 'bg-info' :
                        'bg-warning'
                      }`}>
                        {order.payment_status === 'refund_pending' ? 'REFUND PENDING' :
                         order.payment_status === 'refunded' ? 'REFUNDED' :
                         order.payment_status?.toUpperCase() || 'PENDING'}
                      </span>
                      <br />
                      <small className="text-muted">
                        {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                      </small>
                      {order.status === 'cancelled' && order.payment_method !== 'cod' && order.payment_status === 'completed' && (
                        <>
                          <br />
                          <small className="text-warning">
                            <MDBIcon fas icon="exclamation-triangle" className="me-1" />
                            Refund Required
                          </small>
                        </>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        title="View Details"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <MDBIcon fas icon="eye" />
                      </button>
                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <button
                          className="btn btn-outline-success btn-sm"
                          title="Mark as Delivered"
                          onClick={() => updateOrderStatus(order._id, 'delivered')}
                        >
                          <MDBIcon fas icon="check" />
                        </button>
                      )}
                      {order.status === 'cancelled' && order.payment_method !== 'cod' && order.payment_status === 'completed' && (
                        <button
                          className="btn btn-outline-warning btn-sm"
                          title="Process Refund"
                          onClick={() => updateOrderStatus(order._id, order.status)} // Placeholder for refund processing
                        >
                          <MDBIcon fas icon="undo" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelectedOrder(null)}
        >
          <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Order Details - #{selectedOrder._id.slice(-6).toUpperCase()}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedOrder(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Customer Information</h6>
                    <p><strong>Name:</strong> {selectedOrder.shipping_address?.fullName || selectedOrder.user?.name || 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedOrder.shipping_address?.email || selectedOrder.user?.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {selectedOrder.shipping_address?.phoneNumber || selectedOrder.phone_number || selectedOrder.user?.phone || 'N/A'}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Order Information</h6>
                    <p><strong>Order Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
                    <p><strong>Order ID:</strong> {selectedOrder.order_id || selectedOrder._id}</p>
                    <p><strong>Status:</strong> 
                      <span className={`badge ${getStatusBadgeClass(selectedOrder.status)} ms-2`}>
                        {selectedOrder.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </p>
                    <p><strong>Payment Method:</strong> {selectedOrder.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                    <p><strong>Payment Status:</strong> 
                      <span className={`badge ${
                        selectedOrder.payment_status === 'completed' || selectedOrder.payment_status === 'paid' ? 'bg-success' : 
                        selectedOrder.payment_status === 'failed' ? 'bg-danger' : 
                        selectedOrder.payment_status === 'refund_pending' ? 'bg-warning' :
                        selectedOrder.payment_status === 'refunded' ? 'bg-info' :
                        'bg-warning'
                      } ms-2`}>
                        {selectedOrder.payment_status === 'refund_pending' ? 'REFUND PENDING' :
                         selectedOrder.payment_status === 'refunded' ? 'REFUNDED' :
                         selectedOrder.payment_status?.toUpperCase() || 'PENDING'}
                      </span>
                    </p>
                    {selectedOrder.payment_id && (
                      <p><strong>Payment ID:</strong> <small>{selectedOrder.payment_id}</small></p>
                    )}
                  </div>
                </div>
                
                <h6>Delivery Address</h6>
                {selectedOrder.shipping_address ? (
                  <div className="bg-light p-3 rounded">
                    <p className="mb-1"><strong>{selectedOrder.shipping_address.fullName}</strong></p>
                    <p className="mb-1">{selectedOrder.shipping_address.streetAddress}</p>
                    <p className="mb-1">{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.pincode}</p>
                    <p className="mb-0">{selectedOrder.shipping_address.country || 'India'}</p>
                  </div>
                ) : (
                  <p className="text-muted">No delivery address provided</p>
                )}

                {selectedOrder.special_instructions && (
                  <>
                    <h6 className="mt-3">Special Instructions</h6>
                    <div className="bg-light p-2 rounded">
                      <small>{selectedOrder.special_instructions}</small>
                    </div>
                  </>
                )}

                {selectedOrder.status === 'cancelled' && (
                  <>
                    <h6 className="mt-3 text-danger">
                      <MDBIcon fas icon="exclamation-triangle" className="me-2" />
                      Cancellation Details
                    </h6>
                    <div className="bg-danger-light p-3 rounded border border-danger">
                      <div className="row">
                        <div className="col-md-6">
                          <p className="mb-1">
                            <strong>Cancelled On:</strong> {selectedOrder.cancelledAt ? formatDate(selectedOrder.cancelledAt) : 'Not specified'}
                          </p>
                          <p className="mb-1">
                            <strong>Reason:</strong> {selectedOrder.cancellationReason || 'Customer requested cancellation'}
                          </p>
                        </div>
                        <div className="col-md-6">
                          {selectedOrder.payment_method !== 'cod' && selectedOrder.payment_status === 'completed' && (
                            <div className="alert alert-warning mb-2">
                              <small>
                                <MDBIcon fas icon="exclamation-triangle" className="me-1" />
                                <strong>Refund Required:</strong> Customer paid {handlePrice(selectedOrder.total_amount)} online
                              </small>
                            </div>
                          )}
                          {selectedOrder.payment_method === 'cod' && (
                            <div className="alert alert-info mb-2">
                              <small>
                                <MDBIcon fas icon="info-circle" className="me-1" />
                                <strong>COD Order:</strong> No payment collected, no refund needed
                              </small>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <h6>Order Items</h6>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.products?.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <div className="d-flex align-items-center">
                              {item.product?.image && (
                                <img 
                                  src={item.product.image} 
                                  alt={item.product.title}
                                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                  className="me-2 rounded"
                                />
                              )}
                              <div>
                                <strong>{item.product?.title || 'Unknown Product'}</strong>
                                <br />
                                <small className="text-muted">{item.product?.category}</small>
                              </div>
                            </div>
                          </td>
                          <td>{item.quantity || 1}</td>
                          <td>{handlePrice(item.product?.price || 0)}</td>
                          <td><strong>{handlePrice((item.product?.price || 0) * (item.quantity || 1))}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-end">
                  <h5><strong>Total Amount: {handlePrice(selectedOrder.total_amount || 0)}</strong></h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
