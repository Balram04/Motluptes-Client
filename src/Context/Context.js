import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { axios } from '../Utils/Axios';
import { filterValidCartItems, calculateCartTotal } from '../Utils/cartUtils';
import toast from 'react-hot-toast';

const PetContext = createContext();

const PetProvider = ({ children }) => {
  const userID = localStorage.getItem('userID');
  const [products, setProducts] = useState([]);
  const [loginStatus, setLoginStatus] = useState(false);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    localStorage.clear();
    setLoginStatus(false);
    setCart([]);
    setWishlist([]);
    navigate('/');
  }, [navigate]);

  useEffect(() => {
    const validateAuthentication = () => {
      const storedToken = localStorage.getItem('jwt_token');
      const userID = localStorage.getItem('userID');
      const role = localStorage.getItem('role');
      const loginTime = localStorage.getItem('loginTime');

      if (storedToken && (userID || role === 'admin')) {
        if (loginTime) {
          const currentTime = new Date().getTime();
          const timeDiff = currentTime - parseInt(loginTime);
          const tenMinutes = 10 * 60 * 1000;

          if (timeDiff > tenMinutes) {
            console.log('Session expired');
            handleLogout();
            toast.error('Session expired. Please login again.');
            return;
          }
        }
        setLoginStatus(true);
      } else {
        setLoginStatus(false);
      }
    };

    validateAuthentication();
  }, [handleLogout]);

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
        handleLogout,
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
