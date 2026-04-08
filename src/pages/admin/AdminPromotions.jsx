import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { formatPrice } from "@/data/products";
import { Plus, Trash2, ToggleLeft, ToggleRight, Search } from "lucide-react";
import { toast } from "sonner";
import voucherApi from "../../api/voucher.api"; // Đã thêm API call

const AdminPromotions = () => {
  const [promos, setPromos] = useState([]); // Khởi tạo rỗng để fetch từ API
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [form, setForm] = useState({ 
    code: "", 
    description: "", 
    discountType: "percent", 
    discountValue: "", 
    minOrder: "", 
    maxUses: "", 
    startDate: "", 
    endDate: "" 
  });

  // Gọi API lấy danh sách
  const fetchPromotions = async () => {
    try {
      setIsLoading(true);
      const res = await voucherApi.getAll();
      const fetchedVouchers = res.data.vouchers || [];
      
      // Mapping dữ liệu từ Backend (snake_case) sang Frontend (camelCase)
      const formattedPromos = fetchedVouchers.map((v) => ({
        id: v._id,
        code: v.code,
        description: v.description || "",
        discountType: v.discount_type,
        discountValue: v.discount_amount,
        minOrder: v.min_order,
        maxUses: v.max_uses,
        usedCount: v.used_count || 0,
        startDate: v.start_date.split("T")[0],
        endDate: v.end_date.split("T")[0],
        isActive: v.is_active,
      }));
      setPromos(formattedPromos);
    } catch (error) {
      toast.error("Lỗi tải danh sách Khuyến mãi");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const filtered = promos.filter((p) => {
    const matchSearch = !search || p.code.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || (statusFilter === "active" ? p.isActive : !p.isActive);
    return matchSearch && matchStatus;
  });

  const toggleActive = async (id, currentStatus) => {
    try {
      // API call trước
      await voucherApi.update(id, { is_active: !currentStatus });
      // Cập nhật giao diện tự động nhanh mà không cần lót refetch nếu tự tin
      setPromos((prev) => prev.map((p) => p.id === id ? { ...p, isActive: !p.isActive } : p));
      toast.success(currentStatus ? "Đã tắt mã khuyến mãi!" : "Đã bật mã khuyến mãi!");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể cập nhật trạng thái");
    }
  };

  const handleSave = async () => {
    if (!form.code || !form.discountValue || !form.startDate || !form.endDate) { 
      toast.error("Vui lòng điền các trường bắt buộc!"); 
      return; 
    }
    
    // Đóng gói data để gửi về backend (phải xài y hệt DB Schema Backend)
    const payload = {
      code: form.code,
      description: form.description,
      discount_type: form.discountType,
      discount_amount: Number(form.discountValue),
      min_order: Number(form.minOrder || 0),
      max_uses: Number(form.maxUses),
      start_date: form.startDate,
      end_date: form.endDate,
    };

    try {
      if (editingId) {
        await voucherApi.update(editingId, payload);
        toast.success("Cập nhật mã khuyến mãi thành công!");
      } else {
        await voucherApi.create(payload);
        toast.success("Tạo mã khuyến mãi mới thành công!");
      }
      
      // Gọi lại lấy danh sách mới nhất
      fetchPromotions();
      
      setShowForm(false); 
      setEditingId(null);
    } catch (error) {
      const apiMessage = error?.response?.data?.message;
      const validationErrors = error?.response?.data?.error;
      const errorMsg = validationErrors 
        ? Object.values(validationErrors).map(e => e.msg).join(" | ") 
        : apiMessage || "Có lỗi xảy ra khi lưu Khuyến mãi";
      toast.error(errorMsg);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Bạn có chắc chắn muốn xóa mã này?")) {
      try {
        await voucherApi.delete(id);
        setPromos((prev) => prev.filter((p) => p.id !== id)); 
        toast.success("Đã xóa vĩnh viễn hạn khuyến mãi!"); 
      } catch (error) {
        toast.error("Không thể xóa lúc này");
      }
    }
  }

  // Set dữ liệu vào Form khi Cập nhật
  const handleEditClick = (promo) => {
    setEditingId(promo.id);
    setForm({
      code: promo.code,
      description: promo.description,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      minOrder: promo.minOrder,
      maxUses: promo.maxUses,
      startDate: promo.startDate,
      endDate: promo.endDate
    });
    setShowForm(true);
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-3xl font-bold">KHUYẾN MÃI</h1>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ code: "", description: "", discountType: "percent", discountValue: "", minOrder: "", maxUses: "", startDate: "", endDate: "" }); }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Thêm mã
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input placeholder="Tìm mã khuyến mãi..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="inactive">Đã tắt</option>
        </select>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6 mb-6 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input placeholder="Mã khuyến mãi*" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary uppercase" />
            <input placeholder="Mô tả" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}
              className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="percent">Giảm %</option>
              <option value="fixed">Giảm cố định (VND)</option>
            </select>
            <input placeholder="Giá trị giảm*" type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
              className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            <input placeholder="Đơn hàng tối thiểu" type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
              className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            <input placeholder="Số lượt sử dụng tối đa*" type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
              className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1">Ngày bắt đầu*</span>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1">Ngày kết thúc*</span>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground">{editingId ? "Cập nhật" : "Thêm"}</button>
            <button onClick={() => setShowForm(false)} className="rounded-lg border border-border px-6 py-2 text-sm text-muted-foreground">Hủy</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-center text-muted-foreground py-8 animate-pulse">Đang tải cấu hình Khuyến mãi từ máy chủ Backend...</p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground mb-4">{filtered.length} mã khuyến mãi</p>

          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-card border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Mã</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">Mô tả</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Giảm</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">Sử dụng</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Thời gian</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Trạng thái</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((promo) => (
                  <tr key={promo.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-primary cursor-pointer hover:underline" 
                        onClick={() => handleEditClick(promo)}>
                      {promo.code}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{promo.description}</td>
                    <td className="px-4 py-3 font-semibold">{promo.discountType === "percent" ? `${promo.discountValue}%` : formatPrice(promo.discountValue)}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{promo.usedCount}/{promo.maxUses}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground min-w-[170px]">
                      {promo.startDate} <br/><span className="text-muted-foreground/60">đến</span> {promo.endDate}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${promo.isActive ? "bg-green-500/10 text-green-400" : "bg-muted text-muted-foreground"}`}>
                        {promo.isActive ? "Hoạt động" : "Tắt"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => toggleActive(promo.id, promo.isActive)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground">
                          {promo.isActive ? <ToggleRight className="h-4 w-4 text-green-400" /> : <ToggleLeft className="h-4 w-4" />}
                        </button>
                        <button onClick={() => handleDelete(promo.id)}
                          className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={7} className="text-center text-muted-foreground py-8">Không có mã khuyến mãi nào tồn tại trên Database.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminPromotions;
