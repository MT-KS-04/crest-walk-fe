import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, Phone, ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/data/products";

const mockOrderData = {
  id: "DH12345678",
  status: "Đang giao hàng",
  createdAt: "05/04/2026 14:30",
  estimatedDelivery: "08/04/2026",
  customer: { name: "Nguyễn Văn A", phone: "0901234567", address: "123 Nguyễn Huệ, Q.1, TP.HCM" },
  payment: "COD",
  items: [
    { name: "Nike Air Max 90", size: 42, qty: 1, price: 3500000, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100" },
    { name: "Adidas Ultraboost 22", size: 43, qty: 1, price: 4200000, image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=100" },
  ],
  timeline: [
    { label: "Đặt hàng thành công", time: "05/04 14:30", desc: "Đơn hàng đã được tiếp nhận", done: true },
    { label: "Xác nhận đơn hàng", time: "05/04 15:00", desc: "Shop đã xác nhận và chuẩn bị hàng", done: true },
    { label: "Đang vận chuyển", time: "06/04 09:00", desc: "Đơn hàng đang trên đường giao đến bạn", done: true },
    { label: "Giao hàng thành công", time: "", desc: "Dự kiến: 08/04/2026", done: false },
  ],
};

const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get("id") || "";
  const [orderId, setOrderId] = useState(initialId);
  const [searchedId, setSearchedId] = useState(initialId);
  const [showResult, setShowResult] = useState(!!initialId);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setSearchedId(orderId.trim());
    setShowResult(true);
  };

  const order = mockOrderData;

  const statusColor = {
    "Chờ xử lý": "bg-yellow-500/20 text-yellow-500",
    "Đã xác nhận": "bg-blue-500/20 text-blue-500",
    "Đang giao hàng": "bg-primary/20 text-primary",
    "Hoàn thành": "bg-green-500/20 text-green-500",
    "Đã hủy": "bg-red-500/20 text-red-500",
  };

  return (
    <Layout>
      <div className="container py-8 max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Trang chủ
        </Link>

        <h1 className="font-heading text-4xl font-bold mb-2 uppercase">Theo dõi đơn hàng</h1>
        <p className="text-muted-foreground text-sm mb-8">Nhập mã đơn hàng để kiểm tra trạng thái</p>

        <form onSubmit={handleSearch} className="flex gap-3 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Nhập mã đơn hàng (VD: DH12345678)"
              className="pl-10 bg-secondary border-border"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
          </div>
          <button type="submit" className="rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all">
            Tra cứu
          </button>
        </form>

        {showResult && (
          <div className="space-y-6 animate-fade-in text-card-foreground">
            {/* Header */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Mã đơn hàng</p>
                  <p className="font-heading text-xl font-bold">{searchedId || order.id}</p>
                </div>
                <span className={`rounded-full px-4 py-1.5 text-xs font-semibold ${statusColor[order.status] || "bg-secondary text-foreground"}`}>
                  {order.status}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase">Ngày đặt</p>
                  <p className="font-medium">{order.createdAt}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase">Dự kiến giao</p>
                  <p className="font-medium">{order.estimatedDelivery}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase">Thanh toán</p>
                  <p className="font-medium">{order.payment}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-heading text-lg font-semibold mb-6 flex items-center gap-2 uppercase">
                <Truck className="h-5 w-5 text-primary" /> Trạng thái vận chuyển
              </h2>
              <div className="space-y-0">
                {order.timeline.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step.done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                        {step.done ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>
                      {i < order.timeline.length - 1 && (
                        <div className={`w-0.5 h-12 ${step.done ? "bg-primary" : "bg-border"}`} />
                      )}
                    </div>
                    <div className="pb-8">
                      <p className={`text-sm font-semibold ${step.done ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{step.desc}</p>
                      {step.time && <p className="text-xs text-primary mt-1">{step.time}</p>}
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
              <div className="space-y-2 text-sm">
                <p className="font-medium uppercase">{order.customer.name}</p>
                <p className="text-muted-foreground flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {order.customer.phone}</p>
                <p className="text-muted-foreground flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {order.customer.address}</p>
              </div>
            </div>

            {/* Products */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2 uppercase">
                <Package className="h-5 w-5 text-primary" /> Sản phẩm
              </h2>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg bg-secondary p-3">
                    <img src={item.image} alt={item.name} className="h-14 w-14 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Size {item.size} • SL: {item.qty}</p>
                    </div>
                    <span className="text-sm font-semibold text-primary">{formatPrice(item.price)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-4 pt-4 flex justify-between font-semibold">
                <span className="uppercase">Tổng cộng</span>
                <span className="text-primary text-lg">
                  {formatPrice(order.items.reduce((s, i) => s + i.price * i.qty, 0))}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OrderTracking;
