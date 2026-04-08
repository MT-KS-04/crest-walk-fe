import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import adminCategoriesApi from "@/api/adminCategories.api";

const AdminCategories = () => {
  const [items, setItems] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", slug: "" });
  const [search, setSearch] = useState("");

  const fetchCategories = async () => {
    setIsFetching(true);
    try {
      const data = await adminCategoriesApi.list();
      setItems(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Không tải được danh mục.";
      toast.error(message);
      setItems([]);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((c) => {
      const name = (c?.name || "").toLowerCase();
      const slug = (c?.slug || "").toLowerCase();
      return name.includes(q) || slug.includes(q);
    });
  }, [items, search]);

  const handleSave = async () => {
    if (!form.name) {
      toast.error("Vui lòng nhập tên danh mục!");
      return;
    }

    const payload = {
      name: form.name,
    };
    if (form.slug) payload.slug = form.slug;

    try {
      if (editingId) {
        await adminCategoriesApi.update(editingId, payload);
        toast.success("Đã cập nhật danh mục!");
      } else {
        await adminCategoriesApi.create(payload);
        toast.success("Đã thêm danh mục!");
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ name: "", slug: "" });
      await fetchCategories();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Lưu danh mục thất bại.";
      toast.error(message);
    }
  };

  const handleDelete = async (id) => {
    const ok = confirm("Xóa danh mục này?");
    if (!ok) return;
    try {
      await adminCategoriesApi.remove(id);
      toast.success("Đã xóa!");
      await fetchCategories();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Xóa danh mục thất bại.";
      toast.error(message);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-3xl font-bold">QUẢN LÝ DANH MỤC</h1>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", slug: "" }); }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Thêm danh mục
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input placeholder="Tìm danh mục..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6 mb-6 animate-slide-up">
          <h3 className="font-heading text-sm font-semibold mb-4">{editingId ? "SỬA DANH MỤC" : "THÊM DANH MỤC"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input placeholder="Tên danh mục" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            <input placeholder="Slug (tùy chọn)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground">{editingId ? "Cập nhật" : "Thêm"}</button>
            <button onClick={() => setShowForm(false)} className="rounded-lg border border-border px-6 py-2 text-sm text-muted-foreground">Hủy</button>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground mb-4">{filtered.length} danh mục</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isFetching ? (
          <p className="text-center text-muted-foreground py-8 col-span-full">
            Đang tải...
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 col-span-full">
            Không tìm thấy danh mục.
          </p>
        ) : (
          filtered.map((cat) => (
          <div key={cat._id} className="rounded-xl border border-border bg-card p-5 flex items-center justify-between">
            <div>
              <h3 className="font-heading font-semibold">{cat.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">/{cat.slug}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setEditingId(cat._id); setForm({ name: cat.name, slug: cat.slug }); setShowForm(true); }}
                className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => handleDelete(cat._id)}
                className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
