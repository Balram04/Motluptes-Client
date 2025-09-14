import React, { useContext } from 'react';
import { MDBIcon } from 'mdb-react-ui-kit';
import { PetContext } from '../Context/Context';
import { axios } from '../Utils/Axios';
import HomeAdmin from './HomeAdmin';
import UsersAdmin from './UsersAdmin';
import ProductsAdmin from './ProductsAdmin';
import OrdersAdmin from './OrdersAdmin';
import AddProductAdmin from './AddProductAdmin';
import EditProductAdmin from './EditProductAdmin';
import UserDetailsAdmin from './UserDetailsAdmin';
import { useLocation, useNavigate } from 'react-router-dom';
import '../Styles/Admin.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active dashboard sections based on the current URL
  const isDashboard = location.pathname.endsWith('/dashboard');
  const isUsers = location.pathname.endsWith('/users');
  const isProducts = location.pathname.endsWith('/products');
  const isOrders = location.pathname.endsWith('/orders');
  const isAddProducts = location.pathname.endsWith('add-products');
  const isUserDetails = location.pathname.startsWith('/dashboard/users/');
  const isEditProducts = location.pathname.startsWith('/dashboard/products/');

  const { loginStatus, setLoginStatus } = useContext(PetContext);
  const name = localStorage.getItem('userName'); // Fixed: was 'name', should be 'userName'
  const role = localStorage.getItem('role');

  return (
    <div className="admin-dashboard">
      {role === 'admin' ? (
        <>
          <aside className="sidebar">
            <ul>
              <li onClick={() => navigate('/dashboard')} className={isDashboard ? 'active' : ''}>
                <MDBIcon fas icon="cubes" />
                <span>Dashboard</span>
              </li>
              <li onClick={() => navigate('/dashboard/users')} className={isUsers ? 'active' : ''}>
                <MDBIcon fas icon="user" />
                <span>Users</span>
              </li>
              <li onClick={() => navigate('/dashboard/products')} className={isProducts ? 'active' : ''}>
                <MDBIcon fas icon="list-ul" />
                <span>Products</span>
              </li>
              <li onClick={() => navigate('/dashboard/orders')} className={isOrders ? 'active' : ''}>
                <MDBIcon fas icon="shopping-bag" />
                <span>Orders</span>
              </li>
              <li onClick={() => navigate('/dashboard/add-products')} className={isAddProducts ? 'active' : ''}>
                <MDBIcon fas icon="plus" />
                <span>Add Product</span>
              </li>
            </ul>
          </aside>

          <main className="content">
            <div className="content-main-box">
              <div className="admin-header">
                <h2>{name}</h2>
                {/* <div className="search-box-admin">
                           <MDBIcon fas icon="search" className="search-icon-admin" />
                           <input type="text" placeholder="Search..." disabled />
                        </div> */}
                <div
                  className="d-flex flex-column justify-content-center align-items-center"
                  style={{ cursor: 'pointer' }}
                  onClick={async () => {
                    try {
                      // Call admin logout endpoint to clear cookies
                      await axios.post('/api/admin/logout');
                    } catch (error) {
                      console.error('Admin logout error:', error);
                    }
                    
                    setLoginStatus(false);
                    localStorage.clear();
                    navigate('/'); // Redirect to home page after logout
                  }}
                >
                  <MDBIcon fas icon="sign-out-alt" color="dark" />
                  <span className="text-black">Log Out</span>
                </div>
              </div>
              {loginStatus && (
                <>
                  {isDashboard && <HomeAdmin />}
                  {isUsers && <UsersAdmin value={isUsers} />}
                  {isProducts && <ProductsAdmin value={isProducts} />}
                  {isOrders && <OrdersAdmin />}
                  {isAddProducts && <AddProductAdmin />}
                  {isEditProducts && <EditProductAdmin />}
                  {isUserDetails && <UserDetailsAdmin />}
                </>
              )}
            </div>
          </main>
        </>
      ) : (
        <img
          src="https://www.elegantthemes.com/blog/wp-content/uploads/2019/12/401-error-wordpress-featured-image.jpg"
          alt="Error 401 | Unauthorized"
          className="w-100"
        />
      )}
    </div>
  );
}
