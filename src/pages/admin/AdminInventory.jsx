import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { products } from "@/data/products";
import { Search } from "lucide-react";
import { toast } from "sonner";



const initialInventory = products.map((p) => ({
  productId: p.id, name: p.name, brand: p.brand,
  sizes: p.sizes.map((s) => ({ size: s, stock: Math.floor(Math.random() * 30) + 5 })),
}));

const AdminInventory = () => {
  const [inventory, setInventory] = useState(initialInventory);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");

  const brands = [...new Set(inventory.map((i) => i.brand))];

  const filtered = inventory.filter((item) => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    const matchBrand = !brandFilter || item.brand === brandFilter;
    const totalStock = item.sizes.reduce((sum, s) => sum + s.stock, 0);
    const matchStock = !stockFilter || (stockFilter === "low" ? totalStock < 20 : totalStock >= 20);
    return matchSearch && matchBrand && matchStock;
  });

  const updateStock = (productId, size, stock) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, sizes: item.sizes.map((s) => (s.size === size ? { ...s, stock: Math.max(0, stock) } : s)) }
          : item
      )
    );
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
        <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}
          className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">Tất cả thương hiệu</option>
          {brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}
          className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">Tất cả tồn kho</option>
          <option value="low">Sắp hết hàng (&lt;20)</option>
          <option value="ok">Còn hàng (≥20)</option>
        </select>
      </div>

      <p className="text-xs text-muted-foreground mb-4">{filtered.length} sản phẩm</p>

      <div className="space-y-4">
        {filtered.map((item) => {
          const totalStock = item.sizes.reduce((sum, s) => sum + s.stock, 0);
          return (
            <div key={item.productId} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-heading font-semibold">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">{item.brand} · Tổng tồn kho: <span className={totalStock < 20 ? "text-red-400" : "text-green-400"}>{totalStock}</span></p>
                </div>
                <button onClick={() => { toast.success(`Đã lưu kho cho ${item.name}`); }}
                  className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90">Lưu</button>
              </div>
              <div className="flex flex-wrap gap-3">
                {item.sizes.map((s) => (
                  <div key={s.size} className="flex items-center gap-2 rounded-lg border border-border p-2">
                    <span className="text-xs text-muted-foreground w-8">Size {s.size}</span>
                    <input type="number" value={s.stock} onChange={(e) => updateStock(item.productId, s.size, Number(e.target.value))}
                      className={`w-16 rounded border border-border bg-background px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-primary ${s.stock < 5 ? "text-red-400" : ""}`} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Không tìm thấy sản phẩm nào.</p>}
      </div>
    </AdminLayout>
  );
};

export default AdminInventory;
