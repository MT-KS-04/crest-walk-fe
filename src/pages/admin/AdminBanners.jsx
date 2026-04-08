import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import adminBannersApi from "@/api/adminBanners.api";

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    imageUrl: "",
    link: "",
    position: "hero",
    isActive: true,
    order: 0,
  });

  const fetchBanners = async () => {
    setIsFetching(true);
    try {
      const data = await adminBannersApi.list({ page: 1, limit: 200 });
      const list = Array.isArray(data?.data?.banners) ? data.data.banners : [];
      setBanners(list.map((b) => ({
        id: b._id,
        title: b.title,
        imageUrl: b.image_url,
        link: b.link_url || "",
        position: b.position,
        isActive: Boolean(b.is_active),
        order: b.order_index ?? 0,
      })));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không tải được banner.");
      setBanners([]);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const toggleActive = async (id) => {
    const target = banners.find((b) => b.id === id);
    if (!target) return;
    try {
      await adminBannersApi.update(id, { is_active: !target.isActive });
      toast.success("Đã cập nhật!");
      await fetchBanners();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Cập nhật banner thất bại.");
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.imageUrl) { toast.error("Vui lòng điền đầy đủ!"); return; }
    const payload = {
      title: form.title,
      image_url: form.imageUrl,
      link_url: form.link || "",
      position: form.position,
      order_index: Number(form.order || 0),
      is_active: Boolean(form.isActive),
    };
    try {
      if (editingId) {
        await adminBannersApi.update(editingId, payload);
        toast.success("Đã cập nhật banner!");
      } else {
        await adminBannersApi.create(payload);
        toast.success("Đã thêm banner!");
      }
      await fetchBanners();
      setShowForm(false); setEditingId(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Lưu banner thất bại.");
    }
  };

  const positionLabels = { hero: "Hero", sidebar: "Sidebar", popup: "Popup" };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-3xl font-bold">QUẢN LÝ BANNER</h1>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ title: "", imageUrl: "", link: "", position: "hero", isActive: true, order: banners.length + 1 }); }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Thêm banner
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6 mb-6 animate-slide-up">
          <h3 className="font-heading text-sm font-semibold mb-4">{editingId ? "SỬA BANNER" : "THÊM BANNER"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input placeholder="Tiêu đề" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="hero">Hero</option>
              <option value="sidebar">Sidebar</option>
              <option value="popup">Popup</option>
            </select>
            <input placeholder="URL hình ảnh" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            <input placeholder="Đường dẫn khi click" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })}
              className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            <input placeholder="Thứ tự hiển thị" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })}
              className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          {form.imageUrl && (
            <div className="mb-4 rounded-lg overflow-hidden border border-border max-w-md">
              <img src={form.imageUrl} alt="Preview" className="w-full h-32 object-cover" />
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={handleSave} className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground">{editingId ? "Cập nhật" : "Thêm"}</button>
            <button onClick={() => setShowForm(false)} className="rounded-lg border border-border px-6 py-2 text-sm text-muted-foreground">Hủy</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {isFetching ? (
          <p className="text-center text-muted-foreground py-8">Đang tải...</p>
        ) : banners.map((banner) => (
          <div key={banner.id} className="rounded-xl border border-border bg-card overflow-hidden flex">
            <div className="w-48 h-28 flex-shrink-0">
              <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 p-4 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-semibold">{banner.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{positionLabels[banner.position]}</span>
                  <span className="text-xs text-muted-foreground">· {banner.link}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium mt-2 inline-block ${banner.isActive ? "bg-green-500/10 text-green-400" : "bg-muted text-muted-foreground"}`}>
                  {banner.isActive ? "Đang hiển thị" : "Ẩn"}
                </span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => toggleActive(banner.id)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground">
                  {banner.isActive ? <ToggleRight className="h-4 w-4 text-green-400" /> : <ToggleLeft className="h-4 w-4" />}
                </button>
                <button onClick={() => { setEditingId(banner.id); setForm({ title: banner.title, imageUrl: banner.imageUrl, link: banner.link, position: banner.position, isActive: banner.isActive, order: banner.order }); setShowForm(true); }}
                  className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                <button onClick={async () => { if (!confirm("Xóa banner này?")) return; try { await adminBannersApi.remove(banner.id); toast.success("Đã xóa!"); await fetchBanners(); } catch (error) { toast.error(error?.response?.data?.message || "Xóa banner thất bại."); } }}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminBanners;
