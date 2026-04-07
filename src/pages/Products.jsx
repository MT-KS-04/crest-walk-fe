import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { products, brands, categories, sizeOptions } from "@/data/products";

const Products = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [search, setSearch] = useState("");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "");
  const [selectedSize, setSelectedSize] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [showFilters, setShowFilters] = useState(false);

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.brand.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedBrands.length && !selectedBrands.includes(p.brand)) return false;
      if (selectedCategory && p.category !== selectedCategory) return false;
      if (selectedSize && !p.sizes.includes(selectedSize)) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      return true;
    });
  }, [search, selectedBrands, selectedCategory, selectedSize, priceRange]);

  const clearFilters = () => {
    setSearch("");
    setSelectedBrands([]);
    setSelectedCategory("");
    setSelectedSize(null);
    setPriceRange([0, 10000000]);
  };

  const hasActiveFilters = search || selectedBrands.length || selectedCategory || selectedSize;

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="font-heading text-4xl font-bold mb-8">TẤT CẢ SẢN PHẨM</h1>

        {/* Search & Filter Toggle */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-border bg-card pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-secondary transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Bộ lọc
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="rounded-xl border border-border bg-card p-6 mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-sm font-semibold">BỘ LỌC</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-primary hover:underline flex items-center gap-1">
                  <X className="h-3 w-3" /> Xóa tất cả
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Brand */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Thương hiệu</p>
                <div className="flex flex-wrap gap-2">
                  {brands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => toggleBrand(brand)}
                      className={`rounded-full px-4 py-1.5 text-xs font-medium border transition-colors ${
                        selectedBrands.includes(brand)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Danh mục</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(selectedCategory === cat ? "" : cat)}
                      className={`rounded-full px-4 py-1.5 text-xs font-medium border transition-colors ${
                        selectedCategory === cat
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Size</p>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium border transition-colors ${
                        selectedSize === size
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <p className="text-sm text-muted-foreground mb-6">{filtered.length} sản phẩm</p>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Không tìm thấy sản phẩm nào.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Products;
