import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { bestSelling } from "@/data/adminData";
import { formatPrice } from "@/data/products";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Search } from "lucide-react";

const AdminBestsellers = () => {
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");

  const brands = [...new Set(bestSelling.map((b) => b.brand))];

  const filtered = bestSelling.filter((item) => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    const matchBrand = !brandFilter || item.brand === brandFilter;
    return matchSearch && matchBrand;
  });

  return (
    <AdminLayout>
      <h1 className="font-heading text-3xl font-bold mb-6">SẢN PHẨM BÁN CHẠY</h1>

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
      </div>

      <div className="rounded-xl border border-border bg-card p-6 mb-8">
        <h3 className="font-heading text-sm font-semibold mb-4">BIỂU ĐỒ SỐ LƯỢNG BÁN</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filtered} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 16%)" />
            <XAxis type="number" stroke="hsl(0 0% 55%)" fontSize={12} />
            <YAxis type="category" dataKey="name" stroke="hsl(0 0% 55%)" fontSize={11} width={150} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(0 0% 8%)", border: "1px solid hsl(0 0% 16%)", borderRadius: "8px", color: "hsl(0 0% 95%)" }} />
            <Bar dataKey="sold" fill="hsl(20 100% 50%)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-muted-foreground mb-4">{filtered.length} sản phẩm</p>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Hạng</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Sản phẩm</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Thương hiệu</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Đã bán</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Doanh thu</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, i) => (
              <tr key={item.name} className="border-b border-border hover:bg-secondary/50 transition-colors">
                <td className="px-4 py-3">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i < 3 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {i + 1}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">{item.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{item.brand}</td>
                <td className="px-4 py-3 font-semibold">{item.sold}</td>
                <td className="px-4 py-3 font-medium text-primary">{formatPrice(item.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminBestsellers;
