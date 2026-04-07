import { useState, useRef } from "react";
import AdminLayout from "@/components/AdminLayout";
import { products, formatPrice } from "@/data/products";
import { Plus, Pencil, Trash2, Search, ImagePlus, X, Star } from "lucide-react";
import { toast } from "sonner";

const AdminProducts = () => {
  const [items, setItems] = useState(products);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", brand: "", price: "", category: "", description: "" });
  const [images, setImages] = useState([]);
  const [thumbIndex, setThumbIndex] = useState(0);
  const fileInputRef = useRef(null);

  const filtered = items.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
    toast.success("Đã xóa sản phẩm!");
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({ name: product.name, brand: product.brand, price: product.price.toString(), category: product.category, description: product.description });
    setImages(product.images);
    setThumbIndex(0);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setShowForm(true);
    setEditingId(null);
    setForm({ name: "", brand: "", price: "", category: "", description: "" });
    setImages([]);
    setThumbIndex(0);
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImages((prev) => [...prev, ev.target.result]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleAddImageUrl = () => {
    const url = prompt("Nhập URL ảnh:");
    if (url) {
      setImages((prev) => [...prev, url]);
    }
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (thumbIndex === index) setThumbIndex(0);
    else if (thumbIndex > index) setThumbIndex((prev) => prev - 1);
  };

  const handleSave = () => {
    if (!form.name || !form.brand || !form.price) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    if (images.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 ảnh!");
      return;
    }
    // Reorder images so thumb is first
    const orderedImages = [images[thumbIndex], ...images.filter((_, i) => i !== thumbIndex)];

    if (editingId) {
      setItems((prev) => prev.map((p) => p.id === editingId ? { ...p, name: form.name, brand: form.brand, price: Number(form.price), category: form.category, description: form.description, images: orderedImages } : p));
      toast.success("Đã cập nhật sản phẩm!");
    } else {
      const newProduct = {
        id: Date.now().toString(), name: form.name, brand: form.brand, price: Number(form.price),
        images: orderedImages,
        sizes: [39, 40, 41, 42, 43], category: form.category, description: form.description, rating: 0, reviews: 0,
      };
      setItems((prev) => [...prev, newProduct]);
      toast.success("Đã thêm sản phẩm mới!");
    }
    setShowForm(false);
    setEditingId(null);
    setForm({ name: "", brand: "", price: "", category: "", description: "" });
    setImages([]);
    setThumbIndex(0);
  };

  const inputClass = "rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-3xl font-bold">QUẢN LÝ SẢN PHẨM</h1>
        <button onClick={handleAddNew}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Thêm sản phẩm
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6 mb-6 animate-slide-up">
          <h3 className="font-heading text-sm font-semibold mb-4">{editingId ? "SỬA SẢN PHẨM" : "THÊM SẢN PHẨM MỚI"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input placeholder="Tên sản phẩm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
            <input placeholder="Thương hiệu" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className={inputClass} />
            <input placeholder="Giá (VND)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputClass} />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
              <option value="">Chọn danh mục</option>
              <option value="Running">Running</option>
              <option value="Basketball">Basketball</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Training">Training</option>
            </select>
          </div>
          <textarea placeholder="Mô tả sản phẩm" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={`w-full ${inputClass} mb-4`} rows={3} />

          {/* Image Management */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-foreground mb-2">Ảnh sản phẩm</label>
            <div className="flex flex-wrap gap-3 mb-3">
              {images.map((img, index) => (
                <div key={index} className={`relative group rounded-lg overflow-hidden border-2 transition-all ${index === thumbIndex ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-muted-foreground"}`}>
                  <img src={img} alt={`Ảnh ${index + 1}`} className="h-24 w-24 object-cover" />
                  {/* Thumb badge */}
                  {index === thumbIndex && (
                    <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
                      THUMB
                    </div>
                  )}
                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => setThumbIndex(index)}
                      title="Đặt làm ảnh đại diện"
                      className="p-1.5 rounded-full bg-background/90 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Star className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemoveImage(index)}
                      title="Xóa ảnh"
                      className="p-1.5 rounded-full bg-background/90 text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add image buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="h-24 w-24 rounded-lg border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                >
                  <ImagePlus className="h-5 w-5" />
                  <span className="text-[10px] font-medium">Tải lên</span>
                </button>
                <button
                  onClick={handleAddImageUrl}
                  className="h-24 w-24 rounded-lg border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span className="text-[10px] font-medium">URL</span>
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
            </div>
            <p className="text-xs text-muted-foreground">
              Hover vào ảnh để chọn <Star className="inline h-3 w-3" /> làm ảnh đại diện (thumbnail) hoặc <X className="inline h-3 w-3" /> xóa. Ảnh đầu tiên được chọn mặc định.
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              {editingId ? "Cập nhật" : "Thêm"}
            </button>
            <button onClick={() => { setShowForm(false); setEditingId(null); }}
              className="rounded-lg border border-border px-6 py-2 text-sm text-muted-foreground hover:text-foreground">Hủy</button>
          </div>
        </div>
      )}

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input placeholder="Tìm sản phẩm..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Sản phẩm</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">Thương hiệu</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Giá</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">Ảnh</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">Danh mục</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={product.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    <span className="font-medium">{product.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{product.brand}</td>
                <td className="px-4 py-3 font-medium text-primary">{formatPrice(product.price)}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="flex -space-x-2">
                    {product.images.slice(0, 3).map((img, i) => (
                      <img key={i} src={img} alt="" className="h-8 w-8 rounded-full object-cover border-2 border-card" />
                    ))}
                    {product.images.length > 3 && (
                      <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground border-2 border-card">
                        +{product.images.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{product.category}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(product)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(product.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
