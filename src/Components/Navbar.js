import React, { useState, useContext, useEffect } from 'react';
import { PetContext } from '../Context/Context';
import { useNavigate } from 'react-router-dom';
import {
  MDBContainer,
  MDBNavbar,
  MDBNavbarToggler,
  MDBNavbarNav,
  MDBNavbarLink,
  MDBIcon,
  MDBCollapse,
  MDBBadge,
  MDBBtn,
} from 'mdb-react-ui-kit';
import '../Styles/NavbarModern.css';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [searchInput, setSearchInput] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [showCollapse, setShowCollapse] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { products, loginStatus, handleLogout: contextLogout, cart } = useContext(PetContext);
  const name = localStorage.getItem('name');
  const navigate = useNavigate();

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 992);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCollapse && !event.target.closest('.navbar-nav-modern') && !event.target.closest('.mobile-toggler')) {
        setShowCollapse(false);
      }
      if (showProfileDropdown && !event.target.closest('.profile-container-modern')) {
        setShowProfileDropdown(false);
      }
      if (showSearchBox && !event.target.closest('.search-container')) {
        setShowSearchBox(false);
        setFilteredProducts([]);
        setSearchInput('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCollapse, showProfileDropdown, showSearchBox]);

  const toggleSearchBox = () => {
    setShowSearchBox(!showSearchBox);
    if (searchInput) {
      setFilteredProducts([]);
      setSearchInput('');
    }
    // Close other dropdowns on mobile
    if (isMobile) {
      setShowProfileDropdown(false);
    }
  };

  const toggleNavbar = () => {
    setShowCollapse(!showCollapse);
    // Close other dropdowns when opening mobile menu
    setShowSearchBox(false);
    setShowProfileDropdown(false);
  };
  
  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
    // Close other dropdowns on mobile
    if (isMobile) {
      setShowSearchBox(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    const searchText = event.target.value;
    setSearchInput(searchText);

    if (searchText !== '') {
      const filtered = products?.filter((product) => 
        product.title.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredProducts(filtered.slice(0, 8));
    } else {
      setFilteredProducts([]);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setShowCollapse(false);
    setShowSearchBox(false);
    setShowProfileDropdown(false);
    setFilteredProducts([]);
    setSearchInput('');
  };

  const handleLogout = () => {
    contextLogout();
    setShowProfileDropdown(false);
    toast.success('Logged out successfully');
  };

  const handleProductSelect = (productId) => {
    setFilteredProducts([]);
    setSearchInput('');
    setShowSearchBox(false);
    navigate(`/products/${productId}`);
  };

  return (
    <div className="navbar-wrapper">
      <MDBNavbar expand="lg" className="modern-navbar">
        <MDBContainer fluid>
          {/* Logo */}
          <div className="navbar-brand" onClick={() => handleNavigation('/')}>
            <div className="logo-container">
              <MDBIcon fas icon="paw" className="logo-icon" />
              <h1 className="logo-text">MotluPets</h1>
            </div>
          </div>

          {/* Main Navigation Links */}
          <MDBCollapse navbar show={showCollapse} className="navbar-collapse-custom">
            <MDBNavbarNav className="navbar-nav-modern">
              <MDBNavbarLink className="nav-link-modern" onClick={() => handleNavigation('/')}>
                <MDBIcon fas icon="home" className="nav-icon" />
                <span>Home</span>
              </MDBNavbarLink>
              <MDBNavbarLink className="nav-link-modern" onClick={() => handleNavigation('/products')}>
                <MDBIcon fas icon="th-large" className="nav-icon" />
                <span>Products</span>
              </MDBNavbarLink>
              <div className="nav-dropdown">
                <MDBNavbarLink className="nav-link-modern dropdown-trigger">
                  <MDBIcon fas icon="utensils" className="nav-icon" />
                  <span>Pet Food</span>
                  <MDBIcon fas icon="chevron-down" className="dropdown-arrow" />
                </MDBNavbarLink>
                <div className="dropdown-menu-modern">
                  <div className="dropdown-item" onClick={() => handleNavigation('/cat-food')}>
                    <MDBIcon fas icon="cat" className="dropdown-icon" />
                    Cat Food
                  </div>
                  <div className="dropdown-item" onClick={() => handleNavigation('/dog-food')}>
                    <MDBIcon fas icon="dog" className="dropdown-icon" />
                    Dog Food
                  </div>
                </div>
              </div>
              
              {/* Mobile-only navigation items */}
              {isMobile && (
                <>
                  <MDBNavbarLink className="nav-link-modern" onClick={() => handleNavigation('/about')}>
                    <MDBIcon fas icon="info-circle" className="nav-icon" />
                    <span>About</span>
                  </MDBNavbarLink>
                  <MDBNavbarLink className="nav-link-modern" onClick={() => handleNavigation('/contact')}>
                    <MDBIcon fas icon="phone" className="nav-icon" />
                    <span>Contact</span>
                  </MDBNavbarLink>
                  
                  {/* Mobile Auth Links */}
                  {!loginStatus && (
                    <>
                      <MDBNavbarLink className="nav-link-modern" onClick={() => handleNavigation('/login')}>
                        <MDBIcon fas icon="sign-in-alt" className="nav-icon" />
                        <span>Sign In</span>
                      </MDBNavbarLink>
                      <MDBNavbarLink className="nav-link-modern" onClick={() => handleNavigation('/registration')}>
                        <MDBIcon fas icon="user-plus" className="nav-icon" />
                        <span>Sign Up</span>
                      </MDBNavbarLink>
                    </>
                  )}
                  
                  {/* Mobile User Menu Items */}
                  {loginStatus && (
                    <>
                      <MDBNavbarLink className="nav-link-modern" onClick={() => handleNavigation('/profile')}>
                        <MDBIcon fas icon="user-circle" className="nav-icon" />
                        <span>My Profile</span>
                      </MDBNavbarLink>
                      <MDBNavbarLink className="nav-link-modern" onClick={() => handleNavigation('/orders')}>
                        <MDBIcon fas icon="shopping-bag" className="nav-icon" />
                        <span>My Orders</span>
                      </MDBNavbarLink>
                      <MDBNavbarLink className="nav-link-modern" onClick={() => handleNavigation('/wishlist')}>
                        <MDBIcon fas icon="heart" className="nav-icon" />
                        <span>Wishlist</span>
                      </MDBNavbarLink>
                      <MDBNavbarLink className="nav-link-modern logout" onClick={handleLogout}>
                        <MDBIcon fas icon="sign-out-alt" className="nav-icon" />
                        <span>Log Out</span>
                      </MDBNavbarLink>
                    </>
                  )}
                </>
              )}
            </MDBNavbarNav>
          </MDBCollapse>

          {/* Right Side Actions */}
          <div className="navbar-actions">
            {/* Search */}
            <div className="search-container">
              <div className={`search-box-modern ${showSearchBox ? 'active' : ''}`}>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  className="search-input"
                />
                <MDBIcon fas icon="search" className="search-icon-input" />
              </div>
              <button className="action-btn search-toggle" onClick={toggleSearchBox}>
                <MDBIcon fas icon={showSearchBox ? 'times' : 'search'} />
              </button>

              {/* Search Results */}
              {filteredProducts.length > 0 && showSearchBox && (
                <div className="search-results-modern">
                  {filteredProducts.map((product) => (
                    <div
                      key={product._id}
                      className="search-result-item"
                      onClick={() => handleProductSelect(product._id)}
                    >
                      <img src={product.image} alt={product.title} className="search-result-image" />
                      <div className="search-result-content">
                        <h6>{product.title}</h6>
                        <p className="search-result-category">{product.category}</p>
                        <span className="search-result-price">₹{product.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart */}
            <div className="cart-container">
              <button 
                className="action-btn cart-btn" 
                onClick={() => loginStatus ? handleNavigation('/cart') : handleNavigation('/login')}
              >
                <MDBIcon fas icon="shopping-cart" />
                {loginStatus && cart.length > 0 && (
                  <MDBBadge color="danger" className="cart-badge" pill>
                    {cart.length}
                  </MDBBadge>
                )}
              </button>
            </div>

            {/* Desktop User Profile */}
            {!isMobile && (
              <div className="profile-container-modern">
                {loginStatus ? (
                  <div className="profile-dropdown">
                    <button className="profile-btn" onClick={toggleProfileDropdown}>
                      <div className="profile-avatar">
                        <MDBIcon fas icon="user" />
                      </div>
                      <div className="profile-info">
                        <span className="profile-greeting">Hello,</span>
                        <span className="profile-name">{name ? name.split(' ')[0] : 'User'}</span>
                      </div>
                      <MDBIcon fas icon="chevron-down" className="profile-arrow" />
                    </button>

                    {showProfileDropdown && (
                      <div className="profile-menu">
                        <div className="profile-menu-header">
                          <div className="profile-avatar-large">
                            <MDBIcon fas icon="user" />
                          </div>
                          <div>
                            <h6>{name || 'User'}</h6>
                            <p>Manage your account</p>
                          </div>
                        </div>
                        <hr />
                        <div className="profile-menu-item" onClick={() => handleNavigation('/profile')}>
                          <MDBIcon fas icon="user-circle" />
                          My Profile
                        </div>
                        <div className="profile-menu-item" onClick={() => handleNavigation('/orders')}>
                          <MDBIcon fas icon="shopping-bag" />
                          My Orders
                        </div>
                        <div className="profile-menu-item" onClick={() => handleNavigation('/wishlist')}>
                          <MDBIcon fas icon="heart" />
                          Wishlist
                        </div>
                        <hr />
                        <div className="profile-menu-item logout" onClick={handleLogout}>
                          <MDBIcon fas icon="sign-out-alt" />
                          Log Out
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="auth-buttons">
                    <MDBBtn 
                      outline 
                      className="auth-btn signin-btn" 
                      onClick={() => handleNavigation('/login')}
                      size="sm"
                    >
                      Sign In
                    </MDBBtn>
                    <MDBBtn 
                      className="auth-btn signup-btn" 
                      onClick={() => handleNavigation('/registration')}
                      size="sm"
                    >
                      Sign Up
                    </MDBBtn>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <MDBNavbarToggler
              className="mobile-toggler"
              onClick={toggleNavbar}
              aria-label="Toggle navigation"
            >
              <div className={`hamburger-menu ${showCollapse ? 'active' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </MDBNavbarToggler>
          </div>
        </MDBContainer>
      </MDBNavbar>

      {/* Overlay for mobile menu */}
      {showCollapse && <div className="navbar-overlay" onClick={toggleNavbar}></div>}
    </div>
  );
};

export default Navbar;
