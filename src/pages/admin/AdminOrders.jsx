import { useEffect, useMemo, useState, useCallback } from "react";
import AdminLayout from "@/components/AdminLayout";
import { AdminPaginationBar } from "@/components/AdminPaginationBar";
import { formatPrice } from "@/data/products";
import { normalizeListPagination } from "@/lib/normalizeListPagination";
import { Eye, Search } from "lucide-react";
import { toast } from "sonner";
import adminOrdersApi from "@/api/adminOrders.api";

const ADMIN_PAGE_SIZE = 20;

const statusLabels = {
  pending: "Chờ xử lý", confirmed: "Đã xác nhận", shipping: "Đang giao", delivered: "Đã giao", cancelled: "Đã hủy",
};
const statusColors = {
  pending: "bg-muted text-muted-foreground", confirmed: "bg-yellow-500/10 text-yellow-400",
  shipping: "bg-blue-500/10 text-blue-400", delivered: "bg-green-500/10 text-green-400", cancelled: "bg-red-500/10 text-red-400",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: ADMIN_PAGE_SIZE,
    totalPages: 0,
  });
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    setIsFetching(true);
    try {
      const data = await adminOrdersApi.list({
        page,
        limit: ADMIN_PAGE_SIZE,
        status: filterStatus || undefined,
        search: search.trim() || undefined,
      });
      setOrders(Array.isArray(data?.orders) ? data.orders : []);
      setPagination(normalizeListPagination(data, page, ADMIN_PAGE_SIZE));
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Không tải được danh sách đơn hàng.";
      toast.error(message);
      setOrders([]);
      setPagination({
        total: 0,
        page: 1,
        limit: ADMIN_PAGE_SIZE,
        totalPages: 0,
      });
    } finally {
      setIsFetching(false);
    }
  }, [page, filterStatus, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (isFetching) return;
    const { totalPages } = pagination;
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [isFetching, pagination, page]);

  const filtered = useMemo(() => orders, [orders]);

  const updateStatus = async (id, status) => {
    try {
      await adminOrdersApi.updateStatus(id, { status });
      toast.success(`Đã cập nhật trạng thái đơn hàng!`);
      await fetchOrders();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Cập nhật trạng thái thất bại.";
      toast.error(message);
    }
  };

  return (
    <AdminLayout>
      <h1 className="font-heading text-3xl font-bold mb-6">QUẢN LÝ ĐƠN HÀNG</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input placeholder="Tìm đơn hàng..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
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
            <h3 className="font-heading text-lg font-semibold mb-4">CHI TIẾT ĐƠN HÀNG {selectedOrder._id}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Khách hàng:</span><span>{selectedOrder.user_id?.full_name || "-"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">SĐT:</span><span>{selectedOrder.phone || "-"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Email:</span><span>{selectedOrder.user_id?.email || "-"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Địa chỉ:</span><span className="text-right max-w-[200px]">{selectedOrder.address}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Thanh toán:</span><span>{selectedOrder.payment_method || "-"}</span></div>
              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground uppercase mb-2">Sản phẩm:</p>
                {(selectedOrder.items || []).map((item, i) => (
                  <div key={i} className="flex justify-between py-1">
                    <span>{item.product_name} (Size {item.size}) x{item.quantity}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-semibold">
                <span>Tổng:</span><span className="text-primary">{formatPrice(selectedOrder.total_price || 0)}</span>
              </div>
              <div className="pt-3">
                <p className="text-xs text-muted-foreground uppercase mb-2">Cập nhật trạng thái:</p>
                <div className="flex flex-wrap gap-2">
                  {(["pending", "confirmed", "shipping", "delivered", "cancelled"]).map((s) => (
                    <button key={s} onClick={async () => { await updateStatus(selectedOrder._id, s); setSelectedOrder({ ...selectedOrder, status: s }); }}
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
            {isFetching ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Đang tải...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Không có đơn hàng.
                </td>
              </tr>
            ) : (
              filtered.map((order) => (
              <tr key={order._id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                <td className="px-4 py-3 font-medium">{order._id}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{order.user_id?.full_name || "-"}</td>
                <td className="px-4 py-3 font-medium text-primary">{formatPrice(order.total_price || 0)}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[order.status]}`}>{statusLabels[order.status]}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "-"}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setSelectedOrder(order)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"><Eye className="h-4 w-4" /></button>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        {pagination.total > 0 ? `Tổng ${pagination.total} đơn hàng` : null}
      </p>
      <AdminPaginationBar
        page={page}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
      />
    </AdminLayout>
  );
};

export default AdminOrders;
