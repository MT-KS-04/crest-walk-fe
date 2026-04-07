import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Truck, Shield, RotateCcw } from "lucide-react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/data/products";

const Index = () => {
  const featuredProducts = products.slice(0, 4);
  const newProducts = products.filter((p) => p.isNew);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
        <div className="container relative py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-primary mb-4">
              Bộ sưu tập mới 2026
            </p>
            <h1 className="font-heading text-5xl md:text-7xl font-bold leading-[0.95] mb-6">
              BƯỚC ĐI<br />
              <span className="text-gradient">PHONG CÁCH</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mb-8 leading-relaxed">
              Khám phá bộ sưu tập sneaker chính hãng mới nhất từ các thương hiệu hàng đầu thế giới.
            </p>
            <div className="flex gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-fire px-8 py-3 text-sm font-semibold text-primary-foreground transition-all hover:shadow-glow"
              >
                Mua ngay <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/products?isNew=true"
                className="inline-flex items-center gap-2 rounded-full border border-border px-8 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Hàng mới về
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16">
        <h2 className="font-heading text-3xl font-bold mb-8">DANH MỤC</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat}
              to={`/products?category=${cat}`}
              className="group rounded-xl border border-border bg-card p-6 text-center transition-all hover:border-primary hover:shadow-glow"
            >
              <h3 className="font-heading text-lg font-semibold group-hover:text-primary transition-colors">
                {cat}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-heading text-3xl font-bold">SẢN PHẨM NỔI BẬT</h2>
          <Link to="/products" className="text-sm text-primary hover:underline flex items-center gap-1">
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featuredProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>

      {/* Banner */}
      <section className="container py-16">
        <div className="rounded-2xl bg-gradient-fire p-12 md:p-16 text-center">
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
            GIẢM ĐẾN 30%
          </h2>
          <p className="text-primary-foreground/80 mb-6 text-lg">
            Ưu đãi đặc biệt cho bộ sưu tập mùa hè 2026
          </p>
          <Link
            to="/products?sale=true"
            className="inline-flex rounded-full bg-background px-8 py-3 text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
          >
            Xem ngay
          </Link>
        </div>
      </section>

      {/* New Arrivals */}
      {newProducts.length > 0 && (
        <section className="container py-16">
          <h2 className="font-heading text-3xl font-bold mb-8">HÀNG MỚI VỀ</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {newProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Benefits */}
      <section className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Truck, title: "Giao hàng miễn phí", desc: "Cho đơn hàng từ 1.000.000đ" },
            { icon: Shield, title: "Cam kết chính hãng", desc: "100% sản phẩm authentic" },
            { icon: RotateCcw, title: "Đổi trả dễ dàng", desc: "Trong vòng 30 ngày" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4 rounded-xl border border-border bg-card p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Index;
