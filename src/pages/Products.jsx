import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import productsApi from "@/api/products.api";
import brandsApi from "@/api/brands.api";
import categoriesApi from "@/api/categories.api";
import { sizeOptions } from "@/data/products";

const readBrandIdsFromSearch = () => {
  if (typeof window === "undefined") return [];
  const q = new URLSearchParams(window.location.search);
  const b = q.get("brands") || q.get("brand");
  return b?.trim()
    ? b
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
};

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("keyword") || "");
  const [selectedBrandIds, setSelectedBrandIds] = useState(
    readBrandIdsFromSearch,
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSize, setSelectedSize] = useState(
    searchParams.get("size") || "",
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "newest");

  const [items, setItems] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [bRes, cRes] = await Promise.all([
          brandsApi.list(),
          categoriesApi.list(),
        ]);
        setBrands(Array.isArray(bRes?.data) ? bRes.data : []);
        setCategories(Array.isArray(cRes?.data) ? cRes.data : []);
      } catch (e) {
        console.error("Fetch lookups error:", e);
      }
    };
    load();
  }, []);

  const categoryParam = searchParams.get("category") || "";
  useEffect(() => {
    if (!categoryParam || !categories.length) return;
    if (/^[0-9a-fA-F]{24}$/.test(categoryParam)) {
      setSelectedCategoryId(categoryParam);
      return;
    }
    const match = categories.find((c) => c.name === categoryParam);
    if (match) setSelectedCategoryId(match._id);
  }, [categoryParam, categories]);

  const fetchProducts = useCallback(async () => {
    setIsFetching(true);
    try {
      const params = {
        page: 1,
        limit: 48,
        sortBy,
      };
      const q = search.trim();
      if (q) params.search = q;
      if (selectedCategoryId) params.category_id = selectedCategoryId;
      if (selectedBrandIds.length) params.brand = selectedBrandIds.join(",");
      if (selectedSize) params.size = selectedSize;

      const res = await productsApi.list(params);
      const data = res?.products;
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch products error:", error);
      setItems([]);
    } finally {
      setIsFetching(false);
    }
  }, [search, selectedCategoryId, selectedBrandIds, selectedSize, sortBy]);

  useEffect(() => {
    const params = {};
    if (search.trim()) params.keyword = search.trim();

    if (selectedCategoryId) {
      const cat = categories.find((c) => c._id === selectedCategoryId);
      if (cat?.name) params.category = cat.name;
      else params.category = selectedCategoryId;
    } else if (categoryParam) {
      params.category = categoryParam;
    }

    if (selectedBrandIds.length) params.brands = selectedBrandIds.join(",");
    if (selectedSize) params.size = selectedSize;
    if (sortBy !== "newest") params.sortBy = sortBy;

    setSearchParams(params);

    const t = setTimeout(() => fetchProducts(), 400);
    return () => clearTimeout(t);
  }, [
    search,
    selectedCategoryId,
    selectedBrandIds,
    selectedSize,
    sortBy,
    fetchProducts,
    setSearchParams,
    categories,
    categoryParam,
  ]);

  const toggleBrand = (id) => {
    setSelectedBrandIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id],
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedBrandIds([]);
    setSelectedCategoryId("");
    setSelectedSize("");
    setSortBy("newest");
  };

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        search.trim() ||
        selectedBrandIds.length ||
        selectedCategoryId ||
        selectedSize,
      ),
    [search, selectedBrandIds, selectedCategoryId, selectedSize],
  );

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="font-heading text-4xl font-bold mb-8 uppercase">
          Tất cả sản phẩm
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
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
          <div className="flex gap-3 shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-full border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-[160px]"
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá: Thấp đến cao</option>
              <option value="price_desc">Giá: Cao đến thấp</option>
              <option value="rating">Đánh giá cao</option>
            </select>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-medium transition-colors ${
                showFilters
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-secondary"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Bộ lọc
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="rounded-xl border border-border bg-card p-6 mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-sm font-semibold">Bộ lọc</h3>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <X className="h-3 w-3" /> Xóa tất cả
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                  Thương hiệu
                </p>
                <div className="flex flex-wrap gap-2">
                  {brands.map((brand) => (
                    <button
                      key={brand._id}
                      type="button"
                      onClick={() => toggleBrand(brand._id)}
                      className={`rounded-full px-4 py-1.5 text-xs font-medium border transition-colors ${
                        selectedBrandIds.includes(brand._id)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      {brand.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                  Danh mục
                </p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      type="button"
                      onClick={() =>
                        setSelectedCategoryId(
                          selectedCategoryId === cat._id ? "" : cat._id,
                        )
                      }
                      className={`rounded-full px-4 py-1.5 text-xs font-medium border transition-colors ${
                        selectedCategoryId === cat._id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                  Size
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() =>
                        setSelectedSize(
                          String(selectedSize) === String(size)
                            ? ""
                            : String(size),
                        )
                      }
                      className={`rounded-md px-3 py-1.5 text-xs font-medium border transition-colors ${
                        String(selectedSize) === String(size)
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

        <p className="text-sm text-muted-foreground mb-6">
          {isFetching ? "Đang tải…" : `${items.length} sản phẩm`}
        </p>

        {isFetching ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="aspect-[4/5] bg-muted animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {items.map((product, i) => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                index={i}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-2xl border border-dashed border-border bg-card/50">
            <p className="text-muted-foreground mb-4">
              Không tìm thấy sản phẩm nào.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-full bg-gradient-fire px-8 py-3 text-sm font-semibold text-primary-foreground"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Products;
