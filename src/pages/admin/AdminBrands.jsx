import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { brands as productBrands } from "@/data/products";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

const initialBrands = productBrands.map((b, i) => ({
  id: `brand-${i + 1}`,
  name: b,
  slug: b.toLowerCase().replace(/\s+/g, "-"),
  productCount: Math.floor(Math.random() * 10) + 1,
  description: `Thương hiệu ${b}`,
}));

const AdminBrands = () => {
  const [items, setItems] = useState(initialBrands);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "" });
  const [search, setSearch] = useState("");

  const filtered = items.filter((b) => !search || b.name.toLowerCase().includes(search.toLowerCase()));

  const handleSave = () => {
    if (!form.name) { toast.error("Vui lòng nhập tên thương hiệu!"); return; }
    if (editingId) {
      setItems((prev) => prev.map((b) => b.id === editingId ? { ...b, name: form.name, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"), description: form.description } : b));
      toast.success("Đã cập nhật thương hiệu!");
    } else {
      setItems((prev) => [...prev, { id: Date.now().toString(), name: form.name, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"), productCount: 0, description: form.description }]);
      toast.success("Đã thêm thương hiệu!");
    }
    setShowForm(false); setEditingId(null); setForm({ name: "", slug: "", description: "" });
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-3xl font-bold">QUẢN LÝ THƯƠNG HIỆU</h1>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", slug: "", description: "" }); }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Thêm thương hiệu
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input placeholder="Tìm thương hiệu..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6 mb-6 animate-slide-up">
          <h3 className="font-heading text-sm font-semibold mb-4">{editingId ? "SỬA THƯƠNG HIỆU" : "THÊM THƯƠNG HIỆU"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input placeholder="Tên thương hiệu" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            <input placeholder="Slug (tùy chọn)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            <input placeholder="Mô tả" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="col-span-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground">{editingId ? "Cập nhật" : "Thêm"}</button>
            <button onClick={() => setShowForm(false)} className="rounded-lg border border-border px-6 py-2 text-sm text-muted-foreground">Hủy</button>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground mb-4">{filtered.length} thương hiệu</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((brand) => (
          <div key={brand.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-heading font-semibold text-lg">{brand.name}</h3>
              <div className="flex gap-1">
                <button onClick={() => { setEditingId(brand.id); setForm({ name: brand.name, slug: brand.slug, description: brand.description || "" }); setShowForm(true); }}
                  className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => { setItems((prev) => prev.filter((b) => b.id !== brand.id)); toast.success("Đã xóa!"); }}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{brand.productCount} sản phẩm · /{brand.slug}</p>
            {brand.description && <p className="text-xs text-muted-foreground mt-1">{brand.description}</p>}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8 col-span-full">Không tìm thấy thương hiệu.</p>}
      </div>
    </AdminLayout>
  );
};

export default AdminBrands;
