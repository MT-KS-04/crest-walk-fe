import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import productsApi from "@/api/products.api";
import { brands as mockBrands, categories as mockCategories, sizeOptions } from "@/data/products";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialKeyword = searchParams.get("keyword") || "";

  const [items, setItems] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [search, setSearch] = useState(initialKeyword);
  const [showFilters, setShowFilters] = useState(false);

  // Lọc UI (Client-side) - Sẽ được nâng cấp ở nhánh feature/product-filter
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSize, setSelectedSize] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 10000000]);

  const fetchProducts = async (keyword) => {
    setIsFetching(true);
    try {
      let response;
      if (keyword) {
        response = await productsApi.search(keyword);
      } else {
        response = await productsApi.list();
      }
      
      const data = response.products || response.data || response;
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch products error:", error);
      setItems([]);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts(search);
      // Cập nhật URL
      if (search) {
        setSearchParams({ keyword: search });
      } else {
        setSearchParams({});
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const filtered = useMemo(() => {
    return items.filter((p) => {
      if (selectedBrands.length) {
        const bName = p.brand_id?.name || p.brand;
        if (!selectedBrands.includes(bName)) return false;
      }
      if (selectedCategory) {
        const cName = p.category_id?.name || p.category;
        if (cName !== selectedCategory) return false;
      }
      return true;
    });
  }, [items, selectedBrands, selectedCategory]);

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="font-heading text-4xl font-bold mb-8 uppercase">Sản phẩm</h1>

        {/* Search Bar */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-border bg-card pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
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

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {isFetching ? "Đang tìm kiếm..." : `Tìm thấy ${filtered.length} sản phẩm`}
          </p>
        </div>

        {isFetching ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-xl" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filtered.map((product, i) => (
              <ProductCard key={product._id || product.id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
            <p className="text-muted-foreground">Không tìm thấy sản phẩm nào phù hợp với "{search}".</p>
            <button 
              onClick={() => setSearch("")}
              className="mt-4 text-primary font-semibold hover:underline"
            >
              Xóa lịch sử tìm kiếm
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Products;
