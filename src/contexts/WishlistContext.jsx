import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import wishlistApi from "@/api/wishlist.api";
import { toast } from "sonner";

const WishlistContext = createContext(undefined);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      setWishlistItems([]);
      return;
    }

    try {
      setIsLoading(true);
      const res = await wishlistApi.getWishlist();
      if (res && res.success) {
        setWishlistItems(res.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  const addToWishlist = async (productId) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thêm vào danh sách yêu thích");
      return;
    }

    try {
      setIsLoading(true);
      await wishlistApi.addToWishlist(productId);
      await fetchWishlist();
      toast.success("Đã thêm vào danh sách yêu thích");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Lỗi khi thêm vào danh sách yêu thích");
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      await wishlistApi.removeFromWishlist(productId);
      await fetchWishlist();
      toast.success("Đã xóa khỏi danh sách yêu thích");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Lỗi khi xóa khỏi danh sách yêu thích");
    } finally {
      setIsLoading(false);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => (item.product_id?._id || item.product_id) === productId);
  };

  const toggleWishlist = async (productId) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};
