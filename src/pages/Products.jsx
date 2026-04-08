import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, ChevronDown, Check } from "lucide-react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import productsApi from "@/api/products.api";
import brandsApi from "@/api/brands.api";
import { sizeOptions, formatPrice } from "@/data/products";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // States cho bộ lọc
  const [search, setSearch] = useState(searchParams.get("keyword") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [selectedSize, setSelectedSize] = useState(
    searchParams.get("size") || "",
  );
  const [selectedBrand, setSelectedBrand] = useState(
    searchParams.get("brand") || "",
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "newest");

  const [items, setItems] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [brands, setBrands] = useState([]);

  // Lấy danh sách thương hiệu từ API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await brandsApi.list();
        setBrands(Array.isArray(res?.data) ? res.data : []);
      } catch (error) {
        console.error("Fetch brands error:", error);
      }
    };
    fetchBrands();
  }, []);

  // Lấy danh sách sản phẩm từ API (Filter & Search)
  const fetchProducts = useCallback(async () => {
    setIsFetching(true);
    try {
      const hasFilters =
        minPrice ||
        maxPrice ||
        selectedSize ||
        selectedBrand ||
        sortBy !== "newest";

      let response;
      if (search && !hasFilters) {
        // Chỉ tìm kiếm theo từ khóa
        response = await productsApi.search(search);
      } else {
        // Sử dụng bộ lọc (giá, size, brand, sortBy)
        // Lưu ý: Backend filter hiện tại không hỗ trợ keyword đồng thời
        const params = {
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          size: selectedSize || undefined,
          brand: selectedBrand || undefined,
          sortBy: sortBy || undefined,
        };
        response = await productsApi.filter(params);
      }

      const data = response.products || response.data || response;
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch products error:", error);
      setItems([]);
    } finally {
      setIsFetching(false);
    }
  }, [search, minPrice, maxPrice, selectedSize, selectedBrand, sortBy]);

  // Sync với URL và trigger fetch
  useEffect(() => {
    const params = {};
    if (search) params.keyword = search;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (selectedSize) params.size = selectedSize;
    if (selectedBrand) params.brand = selectedBrand;
    if (sortBy !== "newest") params.sortBy = sortBy;

    setSearchParams(params);

    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [
    search,
    minPrice,
    maxPrice,
    selectedSize,
    selectedBrand,
    sortBy,
    fetchProducts,
    setSearchParams,
  ]);

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setSelectedSize("");
    setSelectedBrand("");
    setSortBy("newest");
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="font-heading text-4xl font-bold uppercase">
            Tất cả sản phẩm
          </h1>
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá: Thấp đến Cao</option>
              <option value="price_desc">Giá: Cao đến Thấp</option>
              <option value="rating">Đánh giá cao</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-lg border px-6 py-2 text-sm font-medium transition-all ${
                showFilters
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-secondary"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {showFilters ? "Đóng bộ lọc" : "Bộ lọc"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside
            className={`lg:block ${showFilters ? "block" : "hidden"} space-y-8 animate-in fade-in slide-in-from-left-4`}
          >
            {/* Search */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-4">
                Tìm kiếm
              </p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Tên sản phẩm..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Price Range */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold uppercase tracking-widest">
                  Khoảng giá
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Từ"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="number"
                  placeholder="Đến"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Size */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-4">
                Kích cỡ (Size)
              </p>
              <div className="grid grid-cols-5 gap-2">
                {sizeOptions.map((size) => (
                  <button
                    key={size}
                    onClick={() =>
                      setSelectedSize(selectedSize == size ? "" : size)
                    }
                    className={`flex h-10 items-center justify-center rounded-lg border text-xs font-bold transition-all ${
                      selectedSize == size
                        ? "border-primary bg-primary text-primary-foreground shadow-glow"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-4">
                Thương hiệu
              </p>
              <div className="space-y-2">
                {brands.map((brand) => (
                  <button
                    key={brand._id}
                    onClick={() =>
                      setSelectedBrand(selectedBrand === brand._id ? "" : brand._id)
                    }
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-secondary"
                  >
                    <span
                      className={
                        selectedBrand === brand._id
                          ? "font-bold text-primary"
                          : "text-muted-foreground"
                      }
                    >
                      {brand.name}
                    </span>
                    {selectedBrand === brand._id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={clearFilters}
              className="w-full rounded-lg border border-dashed border-border py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:border-primary hover:text-primary transition-all"
            >
              Xóa tất cả bộ lọc
            </button>
          </aside>

          {/* Product Grid */}
          <main className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {isFetching
                  ? "Đang tải dữ liệu..."
                  : `Hiển thị ${items.length} sản phẩm`}
              </p>
            </div>

            {isFetching ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[4/5] bg-muted animate-pulse rounded-2xl"
                  />
                ))}
              </div>
            ) : items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {items.map((product, i) => (
                  <ProductCard
                    key={product._id || product.id}
                    product={product}
                    index={i}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-dashed border-border text-center px-4">
                <div className="bg-muted rounded-full p-6 mb-4">
                  <X className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-2">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-muted-foreground max-w-xs mb-6">
                  Chúng tôi không tìm thấy sản phẩm nào khớp với bộ lọc hiện tại
                  của bạn.
                </p>
                <button
                  onClick={clearFilters}
                  className="rounded-full bg-gradient-fire px-8 py-3 text-sm font-bold text-primary-foreground shadow-glow"
                >
                  Xóa bộ lọc và thử lại
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default Products;
