import { useEffect, useMemo, useRef, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { formatPrice } from "@/data/products";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ImagePlus,
  X,
  Star,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import adminProductsApi from "@/api/adminProducts.api";
import adminCategoriesApi from "@/api/adminCategories.api";
import adminBrandsApi from "@/api/adminBrands.api";

const MAX_IMAGE_DIMENSION = 1280;
const JPEG_QUALITY = 0.82;

const newImageId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => resolve(ev.target?.result || "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

const compressImageFile = async (file) => {
  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);

  const ratio = Math.min(
    1,
    MAX_IMAGE_DIMENSION / Math.max(image.width, image.height),
  );
  const width = Math.max(1, Math.round(image.width * ratio));
  const height = Math.max(1, Math.round(image.height * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
};

/**
 * Thử tải trực tiếp trong trình duyệt; nếu CORS chặn (vd. gstatic) thì gọi API admin proxy.
 * @param {string} url
 */
const urlToFile = async (url, filename) => {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (res.ok) {
      const blob = await res.blob();
      const ct = res.headers.get("content-type")?.split(";")[0]?.trim();
      return new File([blob], filename, {
        type: ct || blob.type || "image/jpeg",
      });
    }
  } catch {
    /* CORS hoặc mạng — fallback server */
  }

  try {
    const blob = await adminProductsApi.fetchRemoteImageBlob(url);
    return new File([blob], filename, {
      type:
        blob.type && blob.type !== "application/octet-stream"
          ? blob.type
          : "image/jpeg",
    });
  } catch (error) {
    let msg =
      error?.response?.data?.message ||
      (typeof error?.response?.data === "string" ? error.response.data : null) ||
      error?.message;
    if (!msg && error?.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const parsed = JSON.parse(text);
        msg = parsed?.message;
      } catch {
        /* ignore */
      }
    }
    throw new Error(
      msg ||
        "Không tải được ảnh từ URL. Hãy tải ảnh về máy rồi dùng Tải lên.",
    );
  }
};

const appendDefaultSizes = (formData) => {
  const defaultSizes = [39, 40, 41, 42, 43].map((s) => ({
    size: s,
    quantity: 0,
  }));
  defaultSizes.forEach((row, i) => {
    formData.append(`sizes[${i}][size]`, String(row.size));
    formData.append(`sizes[${i}][quantity]`, String(row.quantity));
  });
};

const appendProductTextFields = (formData, form, { includeSizes }) => {
  formData.append("name", form.name);
  formData.append("price", String(Number(form.price)));
  formData.append("category_id", form.category_id);
  formData.append("brand_id", form.brand_id);
  formData.append("description", form.description || "");
  if (form.original_price) {
    formData.append("original_price", String(Number(form.original_price)));
  }
  if (includeSizes) appendDefaultSizes(formData);
};

const AdminProducts = () => {
  const [items, setItems] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    category_id: "",
    brand_id: "",
    description: "",
    original_price: "",
  });
  const [images, setImages] = useState([]);
  const [thumbIndex, setThumbIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const fetchProducts = async () => {
    setIsFetching(true);
    try {
      const data = await adminProductsApi.list({ page: 1, limit: 200 });
      setItems(Array.isArray(data?.products) ? data.products : []);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Không tải được danh sách sản phẩm.";
      toast.error(message);
      setItems([]);
    } finally {
      setIsFetching(false);
    }
  };

  const fetchLookups = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        adminCategoriesApi.list(),
        adminBrandsApi.list(),
      ]);
      setCategories(Array.isArray(catRes?.data) ? catRes.data : []);
      setBrands(Array.isArray(brandRes?.data) ? brandRes.data : []);
    } catch {
      // keep existing; individual page actions will show error if needed
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchLookups();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) => {
      const name = (p?.name || "").toLowerCase();
      const brandName = (p?.brand_id?.name || "").toLowerCase();
      return name.includes(q) || brandName.includes(q);
    });
  }, [items, search]);

  const handleDelete = async (id) => {
    const ok = confirm("Xóa sản phẩm này?");
    if (!ok) return;
    try {
      await adminProductsApi.remove(id);
      toast.success("Đã xóa sản phẩm!");
      await fetchProducts();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Xóa sản phẩm thất bại.";
      toast.error(message);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product?.name || "",
      price: product?.price != null ? String(product.price) : "",
      original_price:
        product?.original_price != null ? String(product.original_price) : "",
      category_id:
        typeof product?.category_id === "object"
          ? product?.category_id?._id || ""
          : product?.category_id || "",
      brand_id:
        typeof product?.brand_id === "object"
          ? product?.brand_id?._id || ""
          : product?.brand_id || "",
      description: product?.description || "",
    });
    const urls = Array.isArray(product?.images) ? product.images : [];
    setImages(
      urls.map((url) => ({
        id: newImageId(),
        preview: url,
        sourceUrl: url,
      })),
    );
    setThumbIndex(0);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setShowForm(true);
    setEditingId(null);
    setForm({
      name: "",
      price: "",
      original_price: "",
      category_id: "",
      brand_id: "",
      description: "",
    });
    setImages([]);
    setThumbIndex(0);
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files) return;
    try {
      const newItems = await Promise.all(
        Array.from(files).map(async (file) => {
          const dataUrl = await compressImageFile(file);
          const blob = await (await fetch(dataUrl)).blob();
          const outFile = new File(
            [blob],
            `${(file.name.replace(/\.[^.]+$/, "") || "image")}.jpg`,
            { type: "image/jpeg" },
          );
          return {
            id: newImageId(),
            preview: dataUrl,
            file: outFile,
          };
        }),
      );
      setImages((prev) => [...prev, ...newItems]);
      toast.success(`Đã thêm ${newItems.length} ảnh (đã nén).`);
    } catch {
      toast.error("Không thể đọc/nén ảnh. Vui lòng thử ảnh khác.");
    }
    e.target.value = "";
  };

  const handleAddImageUrl = () => {
    const url = prompt("Nhập URL ảnh:");
    if (url?.trim()) {
      const u = url.trim();
      setImages((prev) => [
        ...prev,
        { id: newImageId(), preview: u, sourceUrl: u },
      ]);
    }
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (thumbIndex === index) setThumbIndex(0);
    else if (thumbIndex > index) setThumbIndex((prev) => prev - 1);
  };

  /**
   * Trả về File cho từng ảnh (upload hoặc fetch URL) theo thứ tự đã chọn thumbnail trước.
   */
  const buildImageFilesInOrder = async (ordered) => {
    const files = [];
    for (let i = 0; i < ordered.length; i++) {
      const item = ordered[i];
      if (item.file) {
        files.push(item.file);
        continue;
      }
      const url = item.sourceUrl || item.preview;
      if (!url || url.startsWith("blob:")) {
        throw new Error("Thiếu file hoặc URL ảnh hợp lệ.");
      }
      files.push(await urlToFile(url, `image-${i}.jpg`));
    }
    return files;
  };

  const handleSave = async () => {
    if (isSaving) return;
    if (!form.name || !form.price || !form.category_id || !form.brand_id) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    if (images.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 ảnh!");
      return;
    }

    const ordered = [
      images[thumbIndex],
      ...images.filter((_, i) => i !== thumbIndex),
    ];

    const hasLocalUpload = ordered.some((item) => item.file);
    const imageUrlStrings = ordered.map((item) => item.sourceUrl || item.preview);

    setIsSaving(true);
    try {
      if (editingId) {
        if (hasLocalUpload) {
          const fd = new FormData();
          appendProductTextFields(fd, form, { includeSizes: false });
          const imageFiles = await buildImageFilesInOrder(ordered);
          imageFiles.forEach((file) => fd.append("images", file));
          await adminProductsApi.update(editingId, fd);
          toast.success("Đã cập nhật sản phẩm!");
        } else {
          const payload = {
            name: form.name,
            price: Number(form.price),
            category_id: form.category_id,
            brand_id: form.brand_id,
            description: form.description || "",
            images: imageUrlStrings,
          };
          if (form.original_price) {
            payload.original_price = Number(form.original_price);
          }
          await adminProductsApi.update(editingId, payload);
          toast.success("Đã cập nhật sản phẩm!");
        }
      } else {
        const fd = new FormData();
        appendProductTextFields(fd, form, { includeSizes: true });
        const imageFiles = await buildImageFilesInOrder(ordered);
        imageFiles.forEach((file) => fd.append("images", file));
        await adminProductsApi.create(fd);
        toast.success("Đã thêm sản phẩm mới!");
      }

      setShowForm(false);
      setEditingId(null);
      setForm({
        name: "",
        price: "",
        original_price: "",
        category_id: "",
        brand_id: "",
        description: "",
      });
      setImages([]);
      setThumbIndex(0);
      await fetchProducts();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Lưu sản phẩm thất bại.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-3xl font-bold">QUẢN LÝ SẢN PHẨM</h1>
        <button
          type="button"
          onClick={handleAddNew}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Thêm sản phẩm
        </button>
      </div>

      {showForm && (
        <div className="relative rounded-xl border border-border bg-card p-6 mb-6 animate-slide-up overflow-hidden">
          {isSaving && (
            <div
              className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-xl bg-background/85 backdrop-blur-sm px-6 text-center"
              aria-busy="true"
              aria-live="polite"
            >
              <Loader2 className="h-10 w-10 animate-spin text-primary shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Đang xử lý…
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Đang tải ảnh lên Cloudinary, có thể mất vài giây.
                </p>
              </div>
            </div>
          )}
          <h3 className="font-heading text-sm font-semibold mb-4">
            {editingId ? "SỬA SẢN PHẨM" : "THÊM SẢN PHẨM MỚI"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              placeholder="Tên sản phẩm"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={isSaving}
              className={inputClass}
            />
            <input
              placeholder="Giá (VND)"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              disabled={isSaving}
              className={inputClass}
            />
            <input
              placeholder="Giá gốc (tuỳ chọn)"
              type="number"
              value={form.original_price}
              onChange={(e) =>
                setForm({ ...form, original_price: e.target.value })
              }
              disabled={isSaving}
              className={inputClass}
            />
            <select
              value={form.brand_id}
              onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
              disabled={isSaving}
              className={inputClass}
            >
              <option value="">Chọn thương hiệu</option>
              {brands.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
            <select
              value={form.category_id}
              onChange={(e) =>
                setForm({ ...form, category_id: e.target.value })
              }
              disabled={isSaving}
              className={inputClass}
            >
              <option value="">Chọn danh mục</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <textarea
            placeholder="Mô tả sản phẩm"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            disabled={isSaving}
            className={`w-full ${inputClass} mb-4`}
            rows={3}
          />

          {/* Image Management */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-foreground mb-2">
              Ảnh sản phẩm
            </label>
            <div className="flex flex-wrap gap-3 mb-3">
              {images.map((img, index) => (
                <div
                  key={img.id}
                  className={`relative group rounded-lg overflow-hidden border-2 transition-all ${index === thumbIndex ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-muted-foreground"}`}
                >
                  <img
                    src={img.preview}
                    alt={`Ảnh ${index + 1}`}
                    className="h-24 w-24 object-cover"
                  />
                  {/* Thumb badge */}
                  {index === thumbIndex && (
                    <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
                      THUMB
                    </div>
                  )}
                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setThumbIndex(index)}
                      disabled={isSaving}
                      title="Đặt làm ảnh đại diện"
                      className="p-1.5 rounded-full bg-background/90 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
                    >
                      <Star className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      disabled={isSaving}
                      title="Xóa ảnh"
                      className="p-1.5 rounded-full bg-background/90 text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add image buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSaving}
                  className="h-24 w-24 rounded-lg border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors disabled:pointer-events-none disabled:opacity-50"
                >
                  <ImagePlus className="h-5 w-5" />
                  <span className="text-[10px] font-medium">Tải lên</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  disabled={isSaving}
                  className="h-24 w-24 rounded-lg border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors disabled:pointer-events-none disabled:opacity-50"
                >
                  <Plus className="h-5 w-5" />
                  <span className="text-[10px] font-medium">URL</span>
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                disabled={isSaving}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Hover vào ảnh để chọn <Star className="inline h-3 w-3" /> làm ảnh
              đại diện (thumbnail) hoặc <X className="inline h-3 w-3" /> xóa.
              Ảnh đầu tiên được chọn mặc định.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Ảnh tải lên sẽ tự nén trước khi gửi (multipart) giống Postman. Thêm
              mới bắt buộc có ảnh file hoặc URL (sẽ tải về rồi gửi).
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang gửi…
                </>
              ) : editingId ? (
                "Cập nhật"
              ) : (
                "Thêm"
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              disabled={isSaving}
              className="rounded-lg border border-border px-6 py-2 text-sm text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Tìm sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                Sản phẩm
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">
                Thương hiệu
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                Giá
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">
                Ảnh
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">
                Danh mục
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {isFetching ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Đang tải...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Không có sản phẩm.
                </td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr
                  key={product._id}
                  className="border-b border-border hover:bg-secondary/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images?.[0]}
                        alt=""
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {product.brand_id?.name || "-"}
                  </td>
                  <td className="px-4 py-3 font-medium text-primary">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex -space-x-2">
                      {(product.images || []).slice(0, 3).map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover border-2 border-card"
                        />
                      ))}
                      {(product.images || []).length > 3 && (
                        <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground border-2 border-card">
                          +{(product.images || []).length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {product.category_id?.name || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(product)}
                        className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product._id)}
                        className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
