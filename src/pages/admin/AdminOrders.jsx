import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { mockOrders } from "@/data/adminData";
import { formatPrice } from "@/data/products";
import { Eye, Search } from "lucide-react";
import { toast } from "sonner";

const statusLabels = {
  pending: "Chờ xử lý", confirmed: "Đã xác nhận", shipping: "Đang giao", delivered: "Đã giao", cancelled: "Đã hủy",
};
const statusColors = {
  pending: "bg-muted text-muted-foreground", confirmed: "bg-yellow-500/10 text-yellow-400",
  shipping: "bg-blue-500/10 text-blue-400", delivered: "bg-green-500/10 text-green-400", cancelled: "bg-red-500/10 text-red-400",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState(mockOrders);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filtered = orders.filter((o) => {
    if (filterStatus && o.status !== filterStatus) return false;
    if (search && !o.id.toLowerCase().includes(search.toLowerCase()) && !o.customerName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const updateStatus = (id, status) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
    toast.success(`Đã cập nhật trạng thái đơn hàng ${id}!`);
  };

  return (
    <AdminLayout>
      <h1 className="font-heading text-3xl font-bold mb-6">QUẢN LÝ ĐƠN HÀNG</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input placeholder="Tìm đơn hàng..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="shipping">Đang giao</option>
          <option value="delivered">Đã giao</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
          <div className="rounded-xl border border-border bg-card p-6 w-full max-w-lg mx-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg font-semibold mb-4">CHI TIẾT ĐƠN HÀNG {selectedOrder.id}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Khách hàng:</span><span>{selectedOrder.customerName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">SĐT:</span><span>{selectedOrder.customerPhone}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Email:</span><span>{selectedOrder.customerEmail}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Địa chỉ:</span><span className="text-right max-w-[200px]">{selectedOrder.address}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Thanh toán:</span><span>{selectedOrder.paymentMethod === "cod" ? "COD" : "Online"}</span></div>
              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground uppercase mb-2">Sản phẩm:</p>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between py-1">
                    <span>{item.productName} (Size {item.size}) x{item.quantity}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-semibold">
                <span>Tổng:</span><span className="text-primary">{formatPrice(selectedOrder.totalAmount)}</span>
              </div>
              <div className="pt-3">
                <p className="text-xs text-muted-foreground uppercase mb-2">Cập nhật trạng thái:</p>
                <div className="flex flex-wrap gap-2">
                  {(["pending", "confirmed", "shipping", "delivered", "cancelled"]).map((s) => (
                    <button key={s} onClick={() => { updateStatus(selectedOrder.id, s); setSelectedOrder({ ...selectedOrder, status: s }); }}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${selectedOrder.status === s ? statusColors[s] : "border border-border text-muted-foreground hover:text-foreground"}`}>
                      {statusLabels[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={() => setSelectedOrder(null)} className="mt-4 w-full rounded-lg border border-border py-2 text-sm text-muted-foreground hover:text-foreground">Đóng</button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Mã đơn</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">Khách hàng</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Tổng tiền</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Trạng thái</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">Ngày</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                <td className="px-4 py-3 font-medium">{order.id}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{order.customerName}</td>
                <td className="px-4 py-3 font-medium text-primary">{formatPrice(order.totalAmount)}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[order.status]}`}>{statusLabels[order.status]}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{order.createdAt}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setSelectedOrder(order)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"><Eye className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
