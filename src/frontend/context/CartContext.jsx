"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from local storage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("shivam_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("shivam_cart", JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      
      const currentQty = existingItem ? existingItem.quantity : 0;
      if (product.maxLimit > 0 && currentQty + quantity > product.maxLimit) {
        toast.error(`Cannot add more. Max limit reached.`);
        return prevCart;
      }
      const purchasableStock = product.stock > 4 ? product.stock - 4 : 0;
      if (product.stock !== undefined && currentQty + quantity > purchasableStock) {
        toast.error(`Cannot add more. Only ${purchasableStock} units available in stock.`);
        return prevCart;
      }

      if (existingItem) {
        toast.success(`Updated ${product.name} quantity.`);
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      toast.success(`${product.name} added to cart.`);
      return [...prevCart, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    toast.info("Item removed from cart.");
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) => {
      const item = prevCart.find((i) => i.id === productId);
      if (item && item.maxLimit > 0 && newQuantity > item.maxLimit) {
        toast.error(`Cannot exceed max purchase limit.`);
        return prevCart;
      }
      const purchasableStock = item.stock > 4 ? item.stock - 4 : 0;
      if (item && item.stock !== undefined && newQuantity > purchasableStock) {
        toast.error(`Cannot add more. Only ${purchasableStock} units available in stock.`);
        return prevCart;
      }
      return prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const updateEntireCart = (newCartItems) => {
    setCart(newCartItems);
  };

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        updateEntireCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
