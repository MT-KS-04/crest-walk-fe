import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Search } from "lucide-react";
import { toast } from "sonner";
import adminInventoryApi from "@/api/adminInventory.api";

const AdminInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [threshold, setThreshold] = useState(5);
  const [isFetching, setIsFetching] = useState(false);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("");

  const fetchInventory = async ({ lowStock } = {}) => {
    setIsFetching(true);
    try {
      const data = await adminInventoryApi.list({
        page: 1,
        limit: 200,
        search: search.trim() || undefined,
        lowStock: lowStock ? "true" : undefined,
      });
      setInventory(Array.isArray(data?.inventory) ? data.inventory : []);
      if (typeof data?.threshold === "number") setThreshold(data.threshold);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Không tải được tồn kho.";
      toast.error(message);
      setInventory([]);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchInventory({ lowStock: stockFilter === "low" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stockFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inventory.filter((item) => {
      const matchSearch = !q || (item?.name || "").toLowerCase().includes(q);
      if (!matchSearch) return false;

      if (stockFilter === "ok") {
        const hasLow = (item?.sizes || []).some((s) => (s?.quantity ?? 0) < threshold);
        return !hasLow;
      }

      // stockFilter === "low" handled by server, but keep client-side compatible
      if (stockFilter === "low") {
        return (item?.sizes || []).some((s) => (s?.quantity ?? 0) < threshold);
      }

      return true;
    });
  }, [inventory, search, stockFilter, threshold]);

  const updateStockLocal = (productId, size, quantity) => {
    setInventory((prev) =>
      prev.map((item) =>
        item._id === productId
          ? {
              ...item,
              sizes: (item.sizes || []).map((s) =>
                s.size === size
                  ? { ...s, quantity: Math.max(0, quantity) }
                  : s,
              ),
            }
          : item
      )
    );
  };

  const saveProductInventory = async (product) => {
    try {
      const sizes = product?.sizes || [];
      await Promise.all(
        sizes.map((s) =>
          adminInventoryApi.updateSizeStock(product._id, s.size, {
            quantity: s.quantity ?? 0,
            mode: "set",
          }),
        ),
      );
      toast.success(`Đã lưu kho cho ${product.name}`);
      await fetchInventory({ lowStock: stockFilter === "low" });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Lưu kho thất bại.";
      toast.error(message);
    }
  };

  return (
    <AdminLayout>
      <h1 className="font-heading text-3xl font-bold mb-6">QUẢN LÝ KHO HÀNG</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input placeholder="Tìm sản phẩm..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}
          className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">Tất cả tồn kho</option>
          <option value="low">Sắp hết hàng (&lt;{threshold})</option>
          <option value="ok">Còn hàng (≥{threshold})</option>
        </select>
        <button
          onClick={() => fetchInventory({ lowStock: stockFilter === "low" })}
          className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary"
        >
          Tải lại
        </button>
      </div>

      <p className="text-xs text-muted-foreground mb-4">{filtered.length} sản phẩm</p>

      <div className="space-y-4">
        {isFetching ? (
          <p className="text-center text-muted-foreground py-8">Đang tải...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Không tìm thấy sản phẩm nào.</p>
        ) : (
          filtered.map((item) => {
          const totalStock = (item.sizes || []).reduce((sum, s) => sum + (s.quantity || 0), 0);
          return (
            <div key={item._id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-heading font-semibold">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    Tổng tồn kho:{" "}
                    <span className={totalStock < threshold ? "text-red-400" : "text-green-400"}>
                      {totalStock}
                    </span>
                  </p>
                </div>
                <button onClick={() => saveProductInventory(item)}
                  className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90">Lưu</button>
              </div>
              <div className="flex flex-wrap gap-3">
                {(item.sizes || []).map((s) => (
                  <div key={s.size} className="flex items-center gap-2 rounded-lg border border-border p-2">
                    <span className="text-xs text-muted-foreground w-8">Size {s.size}</span>
                    <input type="number" value={s.quantity ?? 0} onChange={(e) => updateStockLocal(item._id, s.size, Number(e.target.value))}
                      className={`w-16 rounded border border-border bg-background px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-primary ${(s.quantity ?? 0) < threshold ? "text-red-400" : ""}`} />
                  </div>
                ))}
              </div>
            </div>
          );
        })
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminInventory;
