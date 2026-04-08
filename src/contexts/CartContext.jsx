import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import cartApi from "@/api/cart.api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const CartContext = createContext(undefined);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. Khởi tạo giỏ hàng ban đầu (từ LocalStorage cho khách)
  useEffect(() => {
    if (!isAuthenticated) {
      const savedCart = localStorage.getItem("guest_cart");
      try {
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          setItems(Array.isArray(parsed) ? parsed : []);
        }
      } catch (e) {
        console.error("Lỗi parse giỏ hàng tạm thời:", e);
        setItems([]);
      }
    }
    setIsInitialized(true);
  }, [isAuthenticated]);

  // 2. Lấy giỏ hàng từ server nếu đã đăng nhập
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const response = await cartApi.get();
      const cartData = response.data || response;
      
      if (cartData && Array.isArray(cartData.items)) {
        const formattedItems = cartData.items.map(item => {
          // Bảo vệ nếu product_id không tồn tại hoặc chưa được populate
          const productInfo = item.product_id || {};
          return {
            product: {
              ...productInfo,
              id: productInfo._id || productInfo.id
            },
            size: item.size,
            quantity: item.quantity
          };
        });
        setItems(formattedItems);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error("Lỗi lấy giỏ hàng từ server:", error);
      // Nếu lỗi 401 hoặc token hết hạn, có thể reset items về trống
      if (error.response?.status === 401) setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      fetchCart();
    }
  }, [isAuthenticated, isInitialized, fetchCart]);

  // 3. Lưu guest cart vào localStorage khi thay đổi (chỉ khi chưa đăng nhập)
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      localStorage.setItem("guest_cart", JSON.stringify(items));
    }
  }, [items, isAuthenticated, isInitialized]);

  // 4. CHỨC NĂNG CHÍNH: THÊM VÀO GIỎ HÀNG
  const addToCart = async (product, size, quantity = 1) => {
    if (!product) return;
    const productId = product._id || product.id;

    if (isAuthenticated) {
      try {
        setIsLoading(true);
        await cartApi.add({
          product_id: productId,
          size: Number(size),
          quantity: Number(quantity)
        });
        toast.success("Đã thêm vào giỏ hàng trực tuyến!");
        await fetchCart(); // Tải lại để đồng bộ hoàn toàn với server
      } catch (error) {
        console.error("Lỗi API Thêm vào giỏ hàng:", error);
        toast.error(error.response?.data?.message || "Không thể thêm vào giỏ hàng.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Logic cho khách (Lưu Local)
      setItems((prev) => {
        const existingIndex = prev.findIndex(
          (i) => (i.product._id || i.product.id) === productId && i.size === size
        );

        if (existingIndex > -1) {
          const newItems = [...prev];
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: newItems[existingIndex].quantity + quantity
          };
          return newItems;
        }
        return [...prev, { product, size, quantity }];
      });
      toast.success("Đã thêm vào giỏ hàng tạm thời!");
    }
  };

  const removeFromCart = async (productId, size) => {
    if (isAuthenticated) {
      try {
        await cartApi.remove({ product_id: productId, size: Number(size) });
        fetchCart();
      } catch (error) {
        toast.error("Lỗi khi xóa sản phẩm.");
      }
    } else {
      setItems((prev) => prev.filter((i) => !((i.product._id || i.product.id) === productId && i.size === size)));
    }
  };

  const updateQuantity = async (productId, size, quantity) => {
    if (quantity <= 0) return removeFromCart(productId, size);

    if (isAuthenticated) {
      try {
        await cartApi.update({ product_id: productId, size: Number(size), quantity: Number(quantity) });
        fetchCart();
      } catch (error) {
        toast.error("Lỗi khi cập nhật số lượng.");
      }
    } else {
      setItems((prev) =>
        prev.map((i) =>
          (i.product._id || i.product.id) === productId && i.size === size ? { ...i, quantity } : i
        )
      );
    }
  };

  const clearCart = () => {
    setItems([]);
    if (!isAuthenticated) localStorage.removeItem("guest_cart");
  };

  // Tính toán an toàn
  const totalItems = Array.isArray(items) ? items.reduce((sum, i) => sum + (i.quantity || 0), 0) : 0;
  const totalPrice = Array.isArray(items) ? items.reduce((sum, i) => sum + (i.product?.price || 0) * (i.quantity || 0), 0) : 0;

  return (
    <CartContext.Provider value={{ 
      items: Array.isArray(items) ? items : [], 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      totalItems, 
      totalPrice, 
      isLoading 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
