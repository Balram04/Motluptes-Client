import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { PetProvider } from './Context/Context';
import { Toaster } from 'react-hot-toast';
import Home from './Pages/Home';
import Registration from './Pages/Registration';
import OTPVerification from './Pages/OTPVerification';
import AllProducts from './Pages/AllProducts';
import Navbar from './Components/Navbar';
import Login from './Pages/Login';
import AdminLogin from './Pages/AdminLogin';
import Cart from './Pages/Cart';
import Checkout from './Pages/Checkout';
import Orders from './Pages/Orders';
import DogFood from './Pages/DogFood';
import CatFood from './Pages/CatFood';
import Details from './Pages/Details';
import Wishlist from './Pages/Wishlist';
import Footer from './Components/Footer';
import FixedAdmin from './Admin/FixedAdmin';
import SuccessPayment from './Pages/SuccessPayment';
import About from './Pages/About';
import Profile from './Pages/Profile';

function App() {
  // Check if the current route is within the admin dashboard or admin login
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard');
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      <PetProvider>
        {/* Navbar & Footer is common for every route except Dashboard and Admin Login */}
        {!isDashboardRoute && !isAdminRoute && <Navbar />}
        <Toaster />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/verify-otp" element={<OTPVerification />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/dog-food" element={<DogFood />} />
            <Route path="/cat-food" element={<CatFood />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/products" element={<AllProducts />} />
            <Route path="/products/:id" element={<Details />} />
            <Route path="/dog-food/:id" element={<Details />} />
            <Route path="/cat-food/:id" element={<Details />} />
            <Route path="/payment/success" element={<SuccessPayment />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/dashboard" element={<FixedAdmin />} />
            <Route path="/dashboard/users" element={<FixedAdmin />} />
            <Route path="/dashboard/users/:id" element={<FixedAdmin />} />
            <Route path="/dashboard/products" element={<FixedAdmin />} />
            <Route path="/dashboard/products/:id" element={<FixedAdmin />} />
            <Route path="/dashboard/orders" element={<FixedAdmin />} />
            <Route path="/dashboard/add-products" element={<FixedAdmin />} />
          </Routes>
        </div>
        {!isDashboardRoute && !isAdminRoute && <Footer />}
      </PetProvider>
    </>
  );
}

export default App;
