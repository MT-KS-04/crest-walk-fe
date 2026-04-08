import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Heart, Star, ArrowLeft, Minus, Plus } from "lucide-react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import productsApi from "@/api/products.api";
import { formatPrice } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import reviewApi from "@/api/review.api";
import { toast } from "sonner";
import { User as UserIcon, MessageSquare, Send } from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();

  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const response = await productsApi.getById(id);
        // Backend trả về { product: { ... } }
        const data = response.product || response.data || response;
        setProduct(data);

        // Fetch related products - Lấy theo category_id của sản phẩm hiện tại
        const catId = data?.category_id?._id || data?.category_id;
        if (catId) {
          try {
            // Sử dụng API filter để lấy sản phẩm cùng danh mục
            const relatedRes = await productsApi.filter({ category: catId, limit: 5 });
            const relatedData = relatedRes.products || relatedRes.data || [];
            if (Array.isArray(relatedData)) {
              // Loại bỏ sản phẩm hiện tại khỏi danh sách liên quan
              setRelatedProducts(relatedData.filter(p => (p._id || p.id) !== id).slice(0, 4));
            }
          } catch (relErr) {
            console.error("Fetch related products error:", relErr);
          }
        }
      } catch (error) {
        console.error("Fetch detail error:", error);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
    fetchReviews();
    if (isAuthenticated) {
      checkReviewEligibility();
    }
    // Scroll to top
    window.scrollTo(0, 0);
  }, [id, isAuthenticated]);

  const fetchReviews = async () => {
    setIsReviewsLoading(true);
    try {
      const res = await reviewApi.getProductReviews(id);
      if (res.success) {
        setReviews(res.data);
      }
    } catch (error) {
      console.error("Fetch reviews error:", error);
    } finally {
      setIsReviewsLoading(false);
    }
  };

  const checkReviewEligibility = async () => {
    try {
      const res = await reviewApi.checkCanReview(id);
      if (res.success) {
        setCanReview(res.data.canReview);
      }
    } catch (error) {
      console.error("Check review eligibility error:", error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (newRating < 1 || newRating > 5) {
      toast.error("Vui lòng chọn số sao từ 1 đến 5!");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await reviewApi.createReview({
        product_id: id,
        rating: newRating,
        comment: newComment
      });

      if (res.success) {
        toast.success("Cảm ơn bạn đã để lại đánh giá!");
        setNewComment("");
        setCanReview(false);
        fetchReviews(); // Refresh list
        // Update local product rating info if possible
        setProduct(prev => ({
          ...prev,
          rating: ((prev.rating * prev.review_count) + newRating) / (prev.review_count + 1),
          review_count: prev.review_count + 1
        }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể gửi đánh giá.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
          <p className="mt-4 text-muted-foreground">Đang tải thông tin sản phẩm...</p>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <p className="text-muted-foreground">Sản phẩm không tồn tại.</p>
          <Link to="/products" className="text-primary hover:underline mt-4 inline-block">
            Quay lại cửa hàng
          </Link>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error("Vui lòng chọn size!");
      return;
    }
    await addToCart(product, selectedSize, quantity);
  };

  const brandName = product?.brand_id?.name || product?.brand || "Thương hiệu";
  const originalPrice = product?.original_price || product?.originalPrice;
  const sizes = Array.isArray(product?.sizes) 
    ? (typeof product.sizes[0] === 'object' 
        ? product.sizes.filter(s => s.quantity > 0).map(s => s.size) 
        : product.sizes)
    : [];

  return (
    <Layout>
      <div className="container py-8">
        <Link to="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 group">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Quay lại
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="aspect-square overflow-hidden rounded-2xl bg-card mb-4 border border-border">
              <img
                src={product?.images?.[selectedImage] || ""}
                alt={product?.name || "Product"}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {(product?.images || []).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-square w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    selectedImage === i ? "border-primary scale-105" : "border-transparent hover:border-muted"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-bold mb-2">{brandName}</p>
            <h1 className="font-heading text-4xl font-bold mb-4">{product.name}</h1>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.round(product.rating || 0) ? "fill-primary text-primary" : "text-muted"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({product.review_count || 0} đánh giá)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-8">
              <span className="font-heading text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
              {originalPrice && (
                <span className="text-lg text-muted-foreground line-through">{formatPrice(originalPrice)}</span>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed mb-8">{product.description || "Chưa có mô tả cho sản phẩm này."}</p>

            {/* Size */}
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-wider mb-4">Chọn Size</p>
              <div className="flex flex-wrap gap-2">
                {sizes.length > 0 ? sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`flex h-12 w-14 items-center justify-center rounded-lg border text-sm font-bold transition-all ${
                      selectedSize === size
                        ? "border-primary bg-primary text-primary-foreground shadow-glow"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    {size}
                  </button>
                )) : "Sản phẩm hiện đang hết hàng."}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-wider mb-4">Số lượng</p>
              <div className="inline-flex items-center rounded-lg border border-border bg-card">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-12 w-12 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="flex h-12 w-12 items-center justify-center text-sm font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex h-12 w-12 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={sizes.length === 0}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-fire px-8 py-4 text-sm font-bold text-primary-foreground hover:shadow-glow transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="h-5 w-5" /> Thêm vào giỏ hàng
              </button>
              <button 
                onClick={() => toggleWishlist(product._id || product.id)}
                className={`flex h-14 w-14 items-center justify-center rounded-full border border-border transition-colors ${
                  isInWishlist(product._id || product.id) 
                    ? "border-primary text-primary fill-primary" 
                    : "hover:border-primary hover:text-primary text-muted-foreground"
                }`}
              >
                <Heart className={`h-5 w-5 ${isInWishlist(product._id || product.id) ? "fill-primary" : ""}`} />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <section className="mt-24">
          <div className="flex flex-col md:flex-row gap-12">
            {/* Review Form */}
            <div className="w-full md:w-1/3">
              <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-primary" /> Đánh giá sản phẩm
              </h2>
              
              {canReview ? (
                <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
                  <p className="text-sm text-muted-foreground mb-4">Bạn đã mua sản phẩm này. Hãy chia sẻ cảm nhận của bạn với mọi người nhé!</p>
                  <form onSubmit={handleSubmitReview}>
                    <div className="mb-4">
                      <p className="text-xs font-bold uppercase tracking-wider mb-2">Số sao</p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            className="transition-transform active:scale-90"
                          >
                            <Star className={`h-6 w-6 ${star <= newRating ? "fill-primary text-primary" : "text-muted hover:text-primary/50"}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-6">
                      <p className="text-xs font-bold uppercase tracking-wider mb-2">Nhận xét</p>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Cảm nhận của bạn về đôi giày này..."
                        className="w-full min-h-[120px] rounded-xl bg-background border border-border p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                      {isSubmittingReview ? "Đang gửi..." : <><Send className="h-4 w-4" /> Gửi đánh giá</>}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-muted/30 rounded-2xl p-6 border border-dashed border-border text-center">
                  <p className="text-sm text-muted-foreground">
                    {!isAuthenticated 
                      ? "Bạn cần đăng nhập để đánh giá sản phẩm." 
                      : "Bạn chỉ có thể đánh giá sản phẩm đã mua và nhận hàng thành công."}
                  </p>
                </div>
              )}
            </div>

            {/* Review List */}
            <div className="flex-1">
              <h2 className="font-heading text-2xl font-bold mb-6">Nhận xét từ khách hàng ({reviews.length})</h2>
              
              {isReviewsLoading ? (
                <div className="py-10 text-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-r-transparent inline-block"></div>
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <motion.div
                      key={review._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card/50 rounded-2xl p-6 border border-border"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-bold text-sm">{review.user_id?.full_name || "Khách hàng"}</p>
                            <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString("vi-VN")}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < review.rating ? "fill-primary text-primary" : "text-muted"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed italic">"{review.comment}"</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center bg-card/30 rounded-2xl border border-dashed border-border">
                  <p className="text-muted-foreground italic">Chưa có nhận xét nào cho sản phẩm này.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <section className="mt-24">
            <h2 className="font-heading text-2xl font-bold mb-8 uppercase tracking-wider">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p._id || p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
