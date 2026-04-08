import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, Phone, ArrowLeft, Loader2, CreditCard } from "lucide-react";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/data/products";
import userOrderApi from "@/api/userOrder.api";
import { toast } from "sonner";
import { format } from "date-fns";

const statusColor = {
  "pending": "bg-yellow-500/20 text-yellow-500",
  "confirmed": "bg-blue-500/20 text-blue-500",
  "shipping": "bg-primary/20 text-primary",
  "delivered": "bg-green-500/20 text-green-500",
  "cancelled": "bg-red-500/20 text-red-500",
};

const statusLabel = {
  "pending": "Chờ xử lý",
  "confirmed": "Đã xác nhận",
  "shipping": "Đang giao hàng",
  "delivered": "Hoàn thành",
  "cancelled": "Đã hủy",
};

const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get("id") || "";
  const [orderId, setOrderId] = useState(initialId);
  const [searchedId, setSearchedId] = useState(initialId);
  
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!initialId);

  const fetchOrder = async (id) => {
    if (!id) return;
    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await userOrderApi.getOrderDetail(id);
      if (res && res.success) {
        setOrder(res.data);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không tìm thấy đơn hàng");
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchOrder(initialId);
    }
  }, [initialId]);

  useEffect(() => {
    const paymentStatus = searchParams.get("payment_status");
    if (paymentStatus === "success") {
      toast.success("Thanh toán VNPAY thành công!");
      // Clean up parameter
      searchParams.delete("payment_status");
    } else if (paymentStatus === "failed") {
      toast.error("Thanh toán VNPAY thất bại hoặc đã bị hủy.");
      searchParams.delete("payment_status");
    }
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setSearchedId(orderId.trim());
    fetchOrder(orderId.trim());
  };

  const getTimeline = (orderData) => {
    if (!orderData) return [];
    
    // Default flow
    const flow = [
      { key: "pending", label: "Đặt hàng thành công", desc: "Đơn hàng đã được tiếp nhận" },
      { key: "confirmed", label: "Xác nhận đơn hàng", desc: "Shop đã xác nhận và chuẩn bị hàng" },
      { key: "shipping", label: "Đang giao hàng", desc: "Đơn hàng đang giao đến bạn..." },
      { key: "delivered", label: "Giao thành công", desc: "Giao hàng hoàn tất" },
    ];
    
    const currentStatusIdx = flow.findIndex(s => s.key === orderData.status);
    const timeline = [];
    
    if (orderData.status === "cancelled") {
      timeline.push({ label: "Đặt hàng thành công", desc: "Đơn hàng đã được tiếp nhận", done: true, time: format(new Date(orderData.createdAt), "dd/MM/yyyy HH:mm") });
      timeline.push({ label: "Đã hủy", desc: "Đơn hàng đã bị hủy", done: true, time: format(new Date(orderData.updatedAt), "dd/MM/yyyy HH:mm") });
      return timeline;
    }

    // In normal cases
    for (let i = 0; i < flow.length; i++) {
        timeline.push({
            label: flow[i].label,
            desc: flow[i].desc,
            done: currentStatusIdx === -1 ? false : i <= currentStatusIdx,
            time: i === 0 ? format(new Date(orderData.createdAt), "dd/MM/yyyy HH:mm") : (i === currentStatusIdx ? format(new Date(orderData.updatedAt), "dd/MM/yyyy HH:mm") : ""),
        });
    }
    return timeline;
  };

  const timelineData = getTimeline(order);

  return (
    <Layout>
      <div className="container py-8 max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Trang chủ
        </Link>

        <h1 className="font-heading text-4xl font-bold mb-2 uppercase">Theo dõi đơn hàng</h1>
        <p className="text-muted-foreground text-sm mb-8">Nhập mã đơn hàng để kiểm tra trạng thái ngay lập tức</p>

        <form onSubmit={handleSearch} className="flex gap-3 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Nhập mã đơn hàng (VD: 660f789...)"
              className="pl-10 bg-secondary border-border"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <button type="submit" disabled={isLoading || !orderId.trim()} className="rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Tra cứu"}
          </button>
        </form>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p>Đang tải thông tin đơn hàng...</p>
          </div>
        ) : (hasSearched && !order) ? (
          <div className="flex flex-col items-center justify-center py-20 bg-secondary rounded-xl border border-border">
            <Package className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground text-center">Không tìm thấy đơn hàng {searchedId}. <br/>Vui lòng kiểm tra lại mã.</p>
          </div>
        ) : (order && (
          <div className="space-y-6 animate-fade-in text-card-foreground">
            {/* Header */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Mã đơn hàng</p>
                  <p className="font-heading text-xl font-bold">{order._id}</p>
                </div>
                <span className={`rounded-full px-4 py-1.5 text-xs font-semibold ${statusColor[order.status] || "bg-secondary text-foreground"}`}>
                  {statusLabel[order.status] || order.status}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase">Ngày đặt</p>
                  <p className="font-medium">{format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase">Thanh toán</p>
                  <p className="font-medium flex items-center gap-1.5 whitespace-nowrap">
                    <CreditCard className="w-4 h-4 text-primary" /> {order.payment_method === "COD" ? "Thanh toán lúc nhận (COD)" : "Chuyển khoản (Online)"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase">Trạng thái phí</p>
                  <p className="font-medium">
                     {order.payment_status === "paid" ? (
                       <span className="text-green-600 font-semibold px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20">Đã thanh toán</span>
                     ) : (
                       <span className="text-yellow-600 font-semibold px-2 py-0.5 bg-yellow-500/10 rounded-full border border-yellow-500/20">Chưa thanh toán</span>
                     )}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase">Lần cập nhật cuối</p>
                  <p className="font-medium">{format(new Date(order.updatedAt), "dd/MM/yy HH:mm")}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-heading text-lg font-semibold mb-6 flex items-center gap-2 uppercase">
                <Truck className="h-5 w-5 text-primary" /> Trạng thái vận chuyển
              </h2>
              <div className="space-y-0">
                {timelineData.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step.done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                        {step.done ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>
                      {i < timelineData.length - 1 && (
                        <div className={`w-0.5 h-12 ${step.done ? "bg-primary" : "bg-border"}`} />
                      )}
                    </div>
                    <div className="pb-8 pt-1">
                      <p className={`text-sm font-semibold ${step.done ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                      {step.time && <p className="text-[11px] font-medium text-primary mt-1.5 bg-primary/10 px-2 py-0.5 rounded-full inline-block border border-primary/20">{step.time}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery info */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2 uppercase">
                <MapPin className="h-5 w-5 text-primary" /> Thông tin nhận hàng
              </h2>
              <div className="space-y-2 text-sm bg-secondary/50 p-4 rounded-lg border border-border">
                <p className="text-muted-foreground flex items-center gap-2 mb-3"><Phone className="h-4 w-4 text-foreground" /> <span className="font-medium text-foreground">{order.phone}</span></p>
                <p className="text-muted-foreground flex items-start gap-2 leading-relaxed"><MapPin className="h-4 w-4 shrink-0 text-foreground translate-y-0.5" /> <span className="text-foreground">{order.address}</span></p>
              </div>
            </div>

            {/* Products */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2 uppercase">
                <Package className="h-5 w-5 text-primary" /> Sản phẩm ({order.items?.length || 0})
              </h2>
              <div className="space-y-3">
                {order.items?.map((item, i) => {
                  const imageUrl = item.product_id?.images?.[0] || 'https://via.placeholder.com/150';
                  return (
                    <div key={i} className="flex items-center gap-3 rounded-lg bg-secondary/30 p-3 border border-border">
                      <img src={imageUrl} alt={item.product_name} className="h-16 w-16 rounded-lg object-cover border border-border/50" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate text-foreground">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground mt-1">Size {item.size} • Số lượng: <span className="text-foreground font-medium">{item.quantity}</span></p>
                      </div>
                      <span className="text-sm font-semibold text-primary">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-border mt-4 pt-4 flex justify-between items-center font-semibold">
                <span className="uppercase text-muted-foreground text-sm">Tổng thanh toán</span>
                <span className="text-primary text-xl">
                  {formatPrice(order.total_price)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default OrderTracking;
