import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import cartApi from "@/api/cart.api";
import { toast } from "sonner";

const CartContext = createContext(undefined);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Lấy giỏ hàng từ API
  const fetchCart = async () => {
    if (!isAuthenticated) {
      setItems([]);
      setTotalItems(0);
      setTotalPrice(0);
      return;
    }
    
    try {
      setIsLoading(true);
      const res = await cartApi.getCart();
      if (res && res.success) {
        // Map backend product_id (populated object) back to 'product' field so UI components don't break
        const mappedItems = (res.items || []).map(item => ({
          ...item,
          product: {
            ...item.product_id,
            id: item.product_id._id || item.product_id.id,
          }
        }));
        setItems(mappedItems);
        setTotalItems(res.total_items || 0);
        setTotalPrice(res.total_price || 0);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (product, size, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
      return;
    }

    try {
      setIsLoading(true);
      await cartApi.addToCart({
        product_id: product.id || product._id,
        size,
        quantity
      });
      // Refresh cart sau khi thêm thành công
      await fetchCart();
      toast.success("Đã thêm vào giỏ hàng");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Lỗi khi thêm vào giỏ hàng");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId, size) => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      await cartApi.removeFromCart({ product_id: productId, size });
      await fetchCart();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Lỗi khi xoá sản phẩm");
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId, size, quantity) => {
    if (!isAuthenticated) return;
    if (quantity <= 0) return removeFromCart(productId, size);
    
    try {
      setIsLoading(true);
      await cartApi.updateCart({ product_id: productId, size, quantity });
      await fetchCart();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Lỗi cập nhật số lượng");
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = () => {
    // Để xoá giỏ hàng hiện tại (thường gọi sau khi thanh toán thành công)
    setItems([]);
    setTotalItems(0);
    setTotalPrice(0);
    // Có thể không cần gọi API clearCart vì Checkout backend đã tự clear
  };

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, isLoading }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
