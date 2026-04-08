import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Heart, Star, ArrowLeft, Minus, Plus } from "lucide-react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import productsApi from "@/api/products.api";
import { formatPrice } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

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
    // Scroll to top
    window.scrollTo(0, 0);
  }, [id]);

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
                    className={`h-4 w-4 ${i < 4 ? "fill-primary text-primary" : "text-muted"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(24 đánh giá)</span>
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
              <button className="flex h-14 w-14 items-center justify-center rounded-full border border-border hover:border-primary hover:text-primary transition-colors text-muted-foreground">
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        </div>

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
