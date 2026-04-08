import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/contexts/WishlistContext";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Wishlist = () => {
  const { wishlistItems, isLoading } = useWishlist();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-8">
            <Heart className="w-6 h-6 text-primary fill-primary" />
            <h1 className="text-3xl font-bold">Danh sách yêu thích</h1>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : wishlistItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlistItems.map((item) => (
                <ProductCard 
                  key={item._id} 
                  product={{
                    ...item.product_id,
                    id: item.product_id._id || item.product_id.id
                  }} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Danh sách của bạn đang trống</h2>
              <p className="text-gray-500 mb-6">Hãy thêm các sản phẩm bạn yêu thích để dễ dàng theo dõi.</p>
              <Link
                to="/products"
                className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium transition-transform hover:scale-105"
              >
                Khám phá sản phẩm
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;
