import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, CreditCard, Truck, CheckCircle2, ShieldCheck } from "lucide-react";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/data/products";
import { toast } from "sonner";
import userOrderApi from "@/api/userOrder.api";

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState("shipping");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const shippingFee = totalPrice >= 1000000 ? 0 : 30000;

  const [shippingForm, setShippingForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    ward: "",
    district: "",
    city: "",
    note: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="font-heading text-3xl font-bold mb-4 uppercase">Giỏ hàng trống</h1>
          <p className="text-muted-foreground mb-8">Vui lòng thêm sản phẩm trước khi đặt hàng.</p>
          <Link to="/products" className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
            Mua sắm ngay
          </Link>
        </div>
      </Layout>
    );
  }

  const handleShippingSubmit = () => {
    if (!shippingForm.fullName || !shippingForm.phone || !shippingForm.address || !shippingForm.district || !shippingForm.city) {
      toast.error("Vui lòng nhập đầy đủ thông tin giao hàng");
      return;
    }
    setStep("payment");
  };

  const handlePaymentSubmit = () => {
    setStep("confirm");
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      // Build full address string
      const fullAddress = [
        shippingForm.address,
        shippingForm.ward,
        shippingForm.district,
        shippingForm.city
      ].filter(Boolean).join(", ");

      const payload = {
        address: fullAddress,
        phone: shippingForm.phone,
        payment_method: paymentMethod === 'cod' ? 'COD' : 'Online'
      };

      const res = await userOrderApi.checkout(payload);
      
      if (res && res.success) {
        clearCart(); // Clean frontend context since backend is cleared
        
        if (res.paymentUrl) {
          // Redirect to VNPAY
          window.location.href = res.paymentUrl;
        } else {
          toast.success("Đặt hàng thành công!");
          navigate(
            `/order-tracking?id=${res.data._id || ""}&phone=${encodeURIComponent(shippingForm.phone || "")}`,
          );
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Lỗi khi đặt hàng");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { key: "shipping", label: "Giao hàng", icon: MapPin },
    { key: "payment", label: "Thanh toán", icon: CreditCard },
    { key: "confirm", label: "Xác nhận", icon: CheckCircle2 },
  ];

  const currentIdx = steps.findIndex((s) => s.key === step);

  return (
    <Layout>
      <div className="container py-8">
        <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Quay lại giỏ hàng
        </Link>

        <h1 className="font-heading text-4xl font-bold mb-8 uppercase">Đặt hàng</h1>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                i <= currentIdx ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}>
                <s.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < steps.length - 1 && <div className={`h-px w-8 ${i < currentIdx ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === "shipping" && (
              <div className="rounded-xl border border-border bg-card p-6 space-y-5">
                <h2 className="font-heading text-xl font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" /> Thông tin giao hàng
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input placeholder="Họ và tên *" className="bg-secondary border-border" value={shippingForm.fullName} onChange={(e) => setShippingForm({ ...shippingForm, fullName: e.target.value })} />
                  <Input placeholder="Số điện thoại *" className="bg-secondary border-border" value={shippingForm.phone} onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })} />
                  <Input placeholder="Email" type="email" className="bg-secondary border-border sm:col-span-2" value={shippingForm.email} onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })} />
                  <Input placeholder="Địa chỉ *" className="bg-secondary border-border sm:col-span-2" value={shippingForm.address} onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })} />
                  <Input placeholder="Phường/Xã" className="bg-secondary border-border" value={shippingForm.ward} onChange={(e) => setShippingForm({ ...shippingForm, ward: e.target.value })} />
                  <Input placeholder="Quận/Huyện *" className="bg-secondary border-border" value={shippingForm.district} onChange={(e) => setShippingForm({ ...shippingForm, district: e.target.value })} />
                  <Input placeholder="Tỉnh/Thành phố *" className="bg-secondary border-border" value={shippingForm.city} onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })} />
                  <Input placeholder="Ghi chú đơn hàng" className="bg-secondary border-border" value={shippingForm.note} onChange={(e) => setShippingForm({ ...shippingForm, note: e.target.value })} />
                </div>
                <button onClick={handleShippingSubmit} className="w-full rounded-full bg-primary py-4 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all">
                  Tiếp tục chọn thanh toán
                </button>
              </div>
            )}

            {step === "payment" && (
              <div className="rounded-xl border border-border bg-card p-6 space-y-5">
                <h2 className="font-heading text-xl font-semibold flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" /> Phương thức thanh toán
                </h2>
                <div className="space-y-3">
                  {[
                    { key: "cod", label: "Thanh toán khi nhận hàng (COD)", desc: "Trả tiền mặt khi nhận được hàng", icon: Truck },
                    { key: "bank", label: "Chuyển khoản ngân hàng", desc: "Chuyển khoản trước, xác nhận qua email", icon: CreditCard },
                    { key: "momo", label: "Ví MoMo", desc: "Thanh toán nhanh qua ví MoMo", icon: ShieldCheck },
                  ].map((method) => (
                    <button
                      key={method.key}
                      onClick={() => setPaymentMethod(method.key)}
                      className={`w-full flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                        paymentMethod === method.key
                          ? "border-primary bg-primary/5"
                          : "border-border bg-secondary hover:border-muted-foreground"
                      }`}
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${paymentMethod === method.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        <method.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{method.label}</p>
                        <p className="text-xs text-muted-foreground">{method.desc}</p>
                      </div>
                      <div className={`ml-auto h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === method.key ? "border-primary" : "border-muted-foreground"}`}>
                        {paymentMethod === method.key && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep("shipping")} className="flex-1 rounded-full border border-border py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Quay lại
                  </button>
                  <button onClick={handlePaymentSubmit} className="flex-1 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all">
                    Xác nhận đơn hàng
                  </button>
                </div>
              </div>
            )}

            {step === "confirm" && (
              <div className="rounded-xl border border-border bg-card p-6 space-y-6">
                <h2 className="font-heading text-xl font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" /> Xác nhận đơn hàng
                </h2>
                
                <div className="rounded-lg bg-secondary p-4 space-y-2">
                  <p className="text-sm font-semibold">Thông tin giao hàng</p>
                  <p className="text-sm text-muted-foreground">{shippingForm.fullName} • {shippingForm.phone}</p>
                  <p className="text-sm text-muted-foreground">{shippingForm.address}, {shippingForm.ward && `${shippingForm.ward}, `}{shippingForm.district}, {shippingForm.city}</p>
                  {shippingForm.note && <p className="text-sm text-muted-foreground italic">Ghi chú: {shippingForm.note}</p>}
                </div>

                <div className="rounded-lg bg-secondary p-4">
                  <p className="text-sm font-semibold mb-2">Thanh toán</p>
                  <p className="text-sm text-muted-foreground">
                    {paymentMethod === "cod" ? "Thanh toán khi nhận hàng (COD)" : paymentMethod === "bank" ? "Chuyển khoản ngân hàng" : "Ví MoMo"}
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold">Sản phẩm ({items.length})</p>
                  {items.map((item) => (
                    <div key={`${item.product.id}-${item.size}`} className="flex items-center gap-3 rounded-lg bg-secondary p-3">
                      <img src={item.product.images[0]} alt={item.product.name} className="h-14 w-14 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">Size {item.size} • SL: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold text-primary">{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep("payment")} className="flex-1 rounded-full border border-border py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Quay lại
                  </button>
                  <button 
                    onClick={handlePlaceOrder} 
                    disabled={isSubmitting}
                    className="flex-1 rounded-full bg-primary py-4 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all disabled:opacity-75 disabled:cursor-not-allowed">
                    {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="rounded-xl border border-border bg-card p-6 h-fit sticky top-24">
            <h3 className="font-heading text-lg font-semibold mb-4 uppercase">Đơn hàng của bạn</h3>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={`${item.product.id}-${item.size}`} className="flex items-center gap-3">
                  <img src={item.product.images[0]} alt={item.product.name} className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">Size {item.size} x{item.quantity}</p>
                  </div>
                  <span className="text-xs font-semibold">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t border-border pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tạm tính</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phí vận chuyển</span>
                <span className="text-primary">{shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t border-border pt-3">
                <span>Tổng cộng</span>
                <span className="text-primary">{formatPrice(totalPrice + shippingFee)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
