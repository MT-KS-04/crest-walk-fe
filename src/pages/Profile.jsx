import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/data/products";
import {
  User,
  Package,
  History,
  Shield,
  Heart,
  Camera,
  Save,
  Eye,
  EyeOff,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
  Star,
  Trash2,
  Settings,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import userOrderApi from "@/api/userOrder.api";

const Profile = () => {
  const { user, isAuthenticated, handleLogout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";
  const [orders, setOrders] = useState([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);

  // Form states
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");

  // Settings states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
    }
  }, [user]);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    toast.success("Cập nhật thông tin thành công!");
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin mật khẩu!");
      return;
    }
    toast.success("Cập nhật mật khẩu thành công!");
    setCurrentPassword("");
    setNewPassword("");
  };

  const fetchOrders = async () => {
    setIsOrdersLoading(true);
    try {
      const res = await userOrderApi.getOrderHistory();
      if (res.success) {
        setOrders(res.data);
      }
    } catch (error) {
      console.error("Lỗi lấy lịch sử đơn hàng:", error);
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      toast.error(`Lỗi lấy dữ liệu đơn hàng (${status || 'Network Error'}): ${message}`);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "orders" && isAuthenticated) {
      fetchOrders();
    }
  }, [activeTab, isAuthenticated]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;
    
    try {
      const res = await userOrderApi.cancelOrder(orderId);
      if (res.success) {
        toast.success("Đã hủy đơn hàng thành công!");
        fetchOrders(); // Refresh list
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi hủy đơn hàng.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'confirmed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'shipping': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
      case 'delivered': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'cancelled': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'confirmed': return 'Đã xác nhận';
      case 'shipping': return 'Đang giao';
      case 'delivered': return 'Đã giao';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.",
      )
    ) {
      toast.error("Đã gửi yêu cầu xóa tài khoản!");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "tháng 1 năm 2026";
    const date = new Date(dateString);
    return `tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;
  };

  return (
    <Layout>
      <div className="container py-10 max-w-6xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="h-24 w-24 rounded-full border-4 border-background shadow-xl overflow-hidden bg-muted flex items-center justify-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.full_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">
                {user?.full_name || "Người dùng"}
              </h1>
              <p className="text-muted-foreground text-sm flex items-center gap-1.5">
                Thành viên từ {formatDate(user?.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center bg-muted/50 p-1.5 rounded-xl border border-border">
            <button
              onClick={() => setSearchParams({ tab: "profile" })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "profile" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <User className="h-4 w-4" />
              Hồ sơ
            </button>
            <button
              onClick={() => setSearchParams({ tab: "orders" })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "orders" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Package className="h-4 w-4" />
              Đơn hàng
            </button>
            <button
              onClick={() => setSearchParams({ tab: "settings" })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "settings" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Settings className="h-4 w-4" />
              Cài đặt
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Main Content */}
          <div className="space-y-6">
            {activeTab === "profile" && (
              <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-8">Thông tin cá nhân</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/80 ml-1">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nhập họ và tên"
                      className="w-full px-5 py-3.5 rounded-2xl border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/80 ml-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      placeholder="email@example.com"
                      className="w-full px-5 py-3.5 rounded-2xl border border-border bg-muted/10 text-muted-foreground cursor-not-allowed text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/80 ml-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Nhập số điện thoại"
                      className="w-full px-5 py-3.5 rounded-2xl border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/80 ml-1">
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Nhập địa chỉ của bạn"
                      className="w-full px-5 py-3.5 rounded-2xl border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-[#2D8A6F] hover:bg-[#24705a] text-white rounded-2xl font-bold text-sm shadow-lg shadow-[#2D8A6F]/20 transition-all hover:-translate-y-0.5"
                  >
                    Lưu thay đổi
                  </button>
                </form>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold">Lịch sử đơn hàng</h2>
                  <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">{orders.length} đơn hàng</span>
                </div>
                
                {isOrdersLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-card rounded-3xl border border-border">
                    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-sm text-muted-foreground">Đang tải lịch sử đơn hàng...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-20 bg-card rounded-3xl border border-border">
                    <History className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground mb-6">Bạn chưa có đơn hàng nào.</p>
                    <Link to="/products" className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm">
                      Mua sắm ngay
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {orders.map((order) => (
                      <div key={order._id} className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold font-mono text-muted-foreground">#{order._id.slice(-8).toUpperCase()}</span>
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>
                                {getStatusLabel(order.status)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('vi-VN')} • {order.items.length} sản phẩm</p>
                          </div>
                          
                          <div className="flex flex-col md:items-end">
                            <span className="text-lg font-bold text-primary">{formatPrice(order.total_price)}</span>
                            <span className="text-[10px] text-muted-foreground uppercase">{order.payment_method} • {order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</span>
                          </div>
                        </div>
                        
                        <div className="bg-muted/30 px-5 py-3 flex items-center justify-between border-t border-border/50">
                          <div className="flex -space-x-2 overflow-hidden">
                            {order.items.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="h-8 w-8 rounded-lg border-2 border-background overflow-hidden bg-muted">
                                <img src={item.product_id?.images?.[0]} alt="" className="h-full w-full object-cover" />
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <div className="h-8 w-8 rounded-lg border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-bold">
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {order.status === 'pending' && (
                              <button 
                                onClick={() => handleCancelOrder(order._id)}
                                className="px-4 py-1.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                              >
                                Hủy đơn
                              </button>
                            )}
                            <button 
                              onClick={() => navigate(`/order-tracking?id=${order._id}`)}
                              className="px-4 py-1.5 bg-foreground text-background rounded-lg text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
                            >
                              Theo dõi <ChevronRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-8 text-[#1a1a1a]">
                  Cài đặt tài khoản
                </h2>

                {/* Đổi mật khẩu */}
                <div className="mb-10">
                  <h3 className="text-sm font-bold text-foreground mb-4">
                    Đổi mật khẩu
                  </h3>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="password"
                        placeholder="Mật khẩu hiện tại"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-5 py-3.5 rounded-2xl border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                      />
                      <input
                        type="password"
                        placeholder="Mật khẩu mới"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-5 py-3.5 rounded-2xl border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-2.5 border border-border bg-background hover:bg-muted text-foreground rounded-xl font-bold text-xs transition-all"
                    >
                      Cập nhật mật khẩu
                    </button>
                  </form>
                </div>

                <div className="border-t border-border/60 my-8"></div>

                {/* Xóa tài khoản */}
                <div className="space-y-4">
                  <button
                    onClick={handleDeleteAccount}
                    className="px-6 py-3 bg-[#E53E3E] hover:bg-[#C53030] text-white rounded-xl font-bold text-sm shadow-lg shadow-red-500/20 transition-all hover:-translate-y-0.5"
                  >
                    Xóa tài khoản
                  </button>
                  <p className="text-xs text-muted-foreground ml-1">
                    Hành động này không thể hoàn tác.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
