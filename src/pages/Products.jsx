import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import productsApi from "@/api/products.api";
import brandsApi from "@/api/brands.api";
import categoriesApi from "@/api/categories.api";
import { sizeOptions } from "@/data/products";
import { normalizeListPagination } from "@/lib/normalizeListPagination";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const PAGE_SIZE = 24;
const SEARCH_DEBOUNCE_MS = 400;

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

  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("keyword") || "",
  );
  const [debouncedSearch, setDebouncedSearch] = useState(
    () => searchParams.get("keyword") || "",
  );

  useEffect(() => {
    const t = setTimeout(
      () => setDebouncedSearch(searchInput),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(t);
  }, [searchInput]);

  const [selectedBrandIds, setSelectedBrandIds] = useState(
    readBrandIdsFromSearch,
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSize, setSelectedSize] = useState(
    searchParams.get("size") || "",
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "newest");

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 0,
  });
  const [isFetching, setIsFetching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const pageFromUrl = useMemo(() => {
    const raw = searchParams.get("page");
    const p = parseInt(raw || "1", 10);
    return Number.isFinite(p) && p >= 1 ? p : 1;
  }, [searchParams]);

  const categoryParam = searchParams.get("category") || "";

  const filterSigRef = useRef(null);

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

  useEffect(() => {
    if (!categoryParam || !categories.length) return;
    if (/^[0-9a-fA-F]{24}$/.test(categoryParam)) {
      setSelectedCategoryId(categoryParam);
      return;
    }
    const match = categories.find((c) => c.name === categoryParam);
    if (match) setSelectedCategoryId(match._id);
  }, [categoryParam, categories]);

  useEffect(() => {
    const sig = JSON.stringify({
      ds: debouncedSearch.trim(),
      cat: categoryParam || "",
      brands: selectedBrandIds.slice().sort().join(","),
      size: selectedSize,
      sort: sortBy,
    });

    const shouldResetPage =
      filterSigRef.current !== null && filterSigRef.current !== sig;
    filterSigRef.current = sig;

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams();
        if (debouncedSearch.trim()) {
          next.set("keyword", debouncedSearch.trim());
        }

        if (selectedCategoryId) {
          const cat = categories.find((c) => c._id === selectedCategoryId);
          if (cat?.name) next.set("category", cat.name);
          else next.set("category", selectedCategoryId);
        } else if (categoryParam) {
          next.set("category", categoryParam);
        }

        if (selectedBrandIds.length) {
          next.set("brands", selectedBrandIds.join(","));
        }
        if (selectedSize) next.set("size", selectedSize);
        if (sortBy !== "newest") next.set("sortBy", sortBy);

        if (!shouldResetPage) {
          const p = prev.get("page");
          if (p && parseInt(p, 10) > 1) next.set("page", p);
        }
        return next;
      },
      { replace: true },
    );
  }, [
    debouncedSearch,
    selectedCategoryId,
    selectedBrandIds,
    selectedSize,
    sortBy,
    categories,
    categoryParam,
    setSearchParams,
  ]);

  const fetchProducts = useCallback(async () => {
    setIsFetching(true);
    try {
      const params = {
        page: pageFromUrl,
        limit: PAGE_SIZE,
        sortBy,
      };
      const q = debouncedSearch.trim();
      if (q) params.search = q;
      if (selectedCategoryId) params.category_id = selectedCategoryId;
      if (selectedBrandIds.length) params.brand = selectedBrandIds.join(",");
      if (selectedSize) params.size = selectedSize;

      const res = await productsApi.list(params);
      const data = res?.products;
      setItems(Array.isArray(data) ? data : []);
      const meta = normalizeListPagination(res, pageFromUrl, PAGE_SIZE);
      setPagination(meta);
    } catch (error) {
      console.error("Fetch products error:", error);
      setItems([]);
      setPagination({
        total: 0,
        page: 1,
        limit: PAGE_SIZE,
        totalPages: 0,
      });
    } finally {
      setIsFetching(false);
    }
  }, [
    pageFromUrl,
    debouncedSearch,
    selectedCategoryId,
    selectedBrandIds,
    selectedSize,
    sortBy,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (isFetching) return;
    const { totalPages } = pagination;
    if (totalPages > 0 && pageFromUrl > totalPages) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("page", String(totalPages));
          return next;
        },
        { replace: true },
      );
    }
  }, [isFetching, pagination, pageFromUrl, setSearchParams]);

  const goToPage = (next) => {
    if (next < 1 || (pagination.totalPages > 0 && next > pagination.totalPages)) {
      return;
    }
    setSearchParams(
      (prev) => {
        const n = new URLSearchParams(prev);
        if (next <= 1) n.delete("page");
        else n.set("page", String(next));
        return n;
      },
      { replace: true },
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleBrand = (id) => {
    setSelectedBrandIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id],
    );
  };

  const clearFilters = () => {
    setSearchInput("");
    setSelectedBrandIds([]);
    setSelectedCategoryId("");
    setSelectedSize("");
    setSortBy("newest");
  };

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        searchInput.trim() ||
        selectedBrandIds.length ||
        selectedCategoryId ||
        selectedSize,
      ),
    [searchInput, selectedBrandIds, selectedCategoryId, selectedSize],
  );

  const totalCount = pagination.total;
  const showPagination =
    !isFetching && pagination.totalPages > 1;
  const rangeStart =
    totalCount === 0 ? 0 : (pageFromUrl - 1) * PAGE_SIZE + 1;
  const rangeEnd =
    totalCount === 0
      ? 0
      : Math.min(pageFromUrl * PAGE_SIZE, totalCount);

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
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
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
          {isFetching
            ? "Đang tải…"
            : totalCount === 0
              ? "0 sản phẩm"
              : `Hiển thị ${rangeStart}–${rangeEnd} / ${totalCount} sản phẩm`}
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
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {items.map((product, i) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  index={i}
                />
              ))}
            </div>
            {showPagination && (
              <nav
                role="navigation"
                aria-label="Phân trang sản phẩm"
                className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={pageFromUrl <= 1}
                    onClick={() => goToPage(pageFromUrl - 1)}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "gap-1 pl-2",
                    )}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Trước
                  </button>
                  <span className="text-sm text-muted-foreground px-2 tabular-nums">
                    Trang {pageFromUrl} / {pagination.totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={
                      pagination.totalPages > 0 &&
                      pageFromUrl >= pagination.totalPages
                    }
                    onClick={() => goToPage(pageFromUrl + 1)}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "gap-1 pr-2",
                    )}
                  >
                    Sau
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </nav>
            )}
          </>
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
