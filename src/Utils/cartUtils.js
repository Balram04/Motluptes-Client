// Cart utilities for handling cart data safely
export const filterValidCartItems = (cartItems) => {
  if (!Array.isArray(cartItems)) {
    return [];
  }
  
  return cartItems.filter(item => {
    // Check if the item has a valid product
    return item && 
           item.product && 
           item.product._id && 
           typeof item.product.price === 'number' &&
           item.quantity && 
           item.quantity > 0;
  });
};

export const calculateCartTotal = (cartItems) => {
  const validItems = filterValidCartItems(cartItems);
  
  return validItems.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);
};

export const isValidCartItem = (item) => {
  return item && 
         item.product && 
         item.product._id && 
         typeof item.product.price === 'number' &&
         item.quantity && 
         item.quantity > 0;
};

export const isProductInCart = (productId, cartItems) => {
  const validItems = filterValidCartItems(cartItems);
  return validItems.some(item => item.product._id === productId);
};
