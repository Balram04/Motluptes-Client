import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { axios } from '../Utils/Axios';
import { filterValidCartItems, calculateCartTotal } from '../Utils/cartUtils';
import toast from 'react-hot-toast';

const PetContext = createContext();

const PetProvider = ({ children }) => {
  const [userID, setUserID] = useState(localStorage.getItem('userID'));
  const [products, setProducts] = useState([]);
  // Initialize loginStatus based on localStorage to avoid showing login prompt during auth check
  const [loginStatus, setLoginStatus] = useState(() => {
    const storedUserID = localStorage.getItem('userID');
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('role');
    return !!(userName && (storedUserID || userRole === 'admin'));
  });
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true); // Separate auth loading state
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    try {
      // Determine logout endpoint based on user role
      const userRole = localStorage.getItem('role');
      const logoutEndpoint = userRole === 'admin' ? '/api/admin/logout' : '/api/users/logout';
      
      // Call logout endpoint to clear cookies
      await axios.post(logoutEndpoint);
      
      // Clear local storage
      localStorage.clear();
      setUserID(null);
      setLoginStatus(false);
      setCart([]);
      setWishlist([]);
      
      // Redirect based on user role
      if (userRole === 'admin') {
        navigate('/'); // Admin redirects to home page
      } else {
        navigate('/login'); // Regular users redirect to login
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local cleanup even if API call fails
      
      // Determine redirect for error case too
      const userRole = localStorage.getItem('role');
      
      // Clear local storage
      localStorage.clear();
      setUserID(null);
      setLoginStatus(false);
      setCart([]);
      setWishlist([]);
      
      // Redirect based on user role
      if (userRole === 'admin') {
        navigate('/'); // Admin redirects to home page
      } else {
        navigate('/login'); // Regular users redirect to login
      }
    }
  }, [navigate]);

  const handleLoginSuccess = useCallback((userData) => {
    // Update context state after successful login
    setUserID(userData.userID);
    setLoginStatus(true);
    
    // Store additional user data for profile auto-fill
    if (userData.name) {
      localStorage.setItem('userName', userData.name);
    }
    if (userData.email) {
      localStorage.setItem('userEmail', userData.email);
    }
    
    // You might want to fetch cart and wishlist here too
  }, []);

  useEffect(() => {
    const checkAuthentication = async () => {
      setAuthLoading(true);
      try {
        // Check if user data exists in localStorage
        const storedUserID = localStorage.getItem('userID');
        const userName = localStorage.getItem('userName');
        const userRole = localStorage.getItem('role');
        
        if (userName && (storedUserID || userRole === 'admin')) {
          if (userRole === 'admin') {
            // For admin, try to make an authenticated request to verify the session
            try {
              await axios.get('/api/admin/users'); // Any protected admin endpoint
              setLoginStatus(true);
            } catch (error) {
              if (error.response?.status === 401) {
                // Authentication failed, clear local data
                localStorage.clear();
                setUserID(null);
                setLoginStatus(false);
              }
            }
          } else if (storedUserID) {
            // For regular users
            setUserID(storedUserID); // Update userID state
            // Try to make an authenticated request to verify the session
            try {
              await axios.get(`/api/users/${storedUserID}/cart`);
              setLoginStatus(true);
            } catch (error) {
              if (error.response?.status === 401) {
                // Authentication failed, clear local data
                localStorage.clear();
                setUserID(null);
                setLoginStatus(false);
              }
            }
          }
        } else {
          setUserID(null);
          setLoginStatus(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUserID(null);
        setLoginStatus(false);
      } finally {
        setLoading(false);
        setAuthLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/users/products');
        if (response?.data?.data) {
          setProducts(response.data.data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch products. Please check if the server is running.';
        toast.error(errorMessage);
        setProducts([]);
      }
    };
    fetchData();
  }, []);

  const fetchCart = useCallback(async () => {
    if (!userID) {
      setCart([]);
      return;
    }

    try {
      const response = await axios.get(`/api/users/${userID}/cart`);
      const cartData = response?.data?.data || [];
      
      // Filter out invalid cart items on the frontend as well
      const validCartItems = filterValidCartItems(cartData);
      setCart(validCartItems);
      
      // If some items were filtered out, log for debugging
      if (validCartItems.length !== cartData.length) {
        console.log(`Filtered out ${cartData.length - validCartItems.length} invalid cart items`);
      }
    } catch (error) {
      console.error('Cart fetch error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch cart items');
      setCart([]);
    }
  }, [userID]);

  const fetchWishlist = useCallback(async () => {
    try {
      if (loginStatus) {
        const response = await axios.get(`/api/users/${userID}/wishlist`);
        setWishlist(response?.data?.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch wishlist');
      setWishlist([]);
    }
  }, [loginStatus, userID]);

  useEffect(() => {
    if (loginStatus && userID) {
      fetchCart();
      fetchWishlist();
    }
  }, [loginStatus, userID, fetchCart, fetchWishlist]);

  const fetchCatFood = async () => {
    try {
      const response = await axios.get('/api/users/products/category/Cat');
      return response.data.data || [];
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch cat food');
      return [];
    }
  };

  const fetchDogFood = async () => {
    try {
      const response = await axios.get('/api/users/products/category/Dog');
      return response.data.data || [];
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch dog food');
      return [];
    }
  };

  const fetchProductDetails = async (id) => {
    try {
      const response = await axios.get(`/api/users/products/${id}`);
      return response?.data?.data || null;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch product details');
      return null;
    }
  };

  const addToCart = async (productID) => {
    try {
      await axios.post(`/api/users/${userID}/cart`, { productID });
      const response = await axios.get(`/api/users/${userID}/cart`);
      setCart(response?.data?.data || []);
      toast.success('Added to cart');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add item to cart');
    }
  };

  const removeFromCart = async (productID) => {
    try {
      await axios.delete(`/api/users/${userID}/cart/${productID}`);
      const response = await axios.get(`/api/users/${userID}/cart`);
      setCart(response?.data?.data || []);
      toast.success('Removed from cart');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove item from cart');
    }
  };

  const handleQuantity = async (cartID, quantityChange) => {
    try {
      await axios.put(`/api/users/${userID}/cart`, { id: cartID, quantityChange });
      await fetchCart();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update quantity');
    }
  };

  const addToWishlist = async (productID) => {
    try {
      await axios.post(`/api/users/${userID}/wishlist`, { productID });
      const response = await axios.get(`/api/users/${userID}/wishlist`);
      setWishlist(response?.data?.data || []);
      toast.success('Added to wishlist');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to wishlist');
    }
  };

  const removeFromWishlist = async (productID) => {
    try {
      await axios.delete(`/api/users/${userID}/wishlist/${productID}`);
      const response = await axios.get(`/api/users/${userID}/wishlist`);
      setWishlist(response?.data?.data || []);
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove from wishlist');
    }
  };

  const handlePrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;

  // ✅ Safe total price calculation using utility function
  const totalPrice = calculateCartTotal(cart);

  const handleCheckout = async () => {
    try {
      if (!userID) {
        toast.error('Please log in to proceed with checkout');
        return;
      }

      if (cart.length === 0) {
        toast.error('Your cart is empty');
        return;
      }

      // Navigate to checkout page instead of direct payment
      navigate('/checkout');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to proceed to checkout.');
    }
  };

  const fetchPaymentStatus = async () => {
    try {
      await axios.get(`/api/users/payment/success`);
      setCart([]);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify payment');
      navigate('/');
    }
  };

  return (
    <PetContext.Provider
      value={{
        products,
        userID,
        fetchProductDetails,
        fetchCatFood,
        fetchDogFood,
        fetchCart,
        addToCart,
        removeFromCart,
        handleQuantity,
        cart,
        loginStatus,
        setLoginStatus,
        loading,
        authLoading,
        handleLogout,
        handleLoginSuccess,
        fetchWishlist,
        addToWishlist,
        removeFromWishlist,
        wishlist,
        handlePrice,
        totalPrice,
        handleCheckout,
        fetchPaymentStatus,
      }}
    >
      {children}
    </PetContext.Provider>
  );
};

export { PetContext, PetProvider };
