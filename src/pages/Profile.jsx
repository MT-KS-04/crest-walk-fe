import { useState } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { products, formatPrice } from "@/data/products";
import {
  User, Package, History, Shield, Heart, Camera, Save, Eye, EyeOff,
  MapPin, Phone, Mail, Calendar, ChevronRight, Star, Trash2
} from "lucide-react";
import { toast } from "sonner";

// Mock user data
const mockUser = {
  name: "Nguyễn Văn A",
  email: "nguyenvana@email.com",
  phone: "0901234567",
  avatar: "",
  birthday: "1995-06-15",
  gender: "male",
  addresses: [
    { id: "1", label: "Nhà", address: "123 Nguyễn Huệ, Quận 1, TP.HCM", isDefault: true },
    { id: "2", label: "Công ty", address: "456 Lê Lợi, Quận 3, TP.HCM", isDefault: false },
  ],
};

const mockOrders = [
  { id: "ORD001", date: "2024-03-15", status: "delivered", total: 4500000, items: [
    { name: "Nike Air Max 90", size: 42, qty: 1, price: 3200000, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600" },
    { name: "Adidas Ultraboost", size: 41, qty: 1, price: 1300000, image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600" },
  ]},
  { id: "ORD002", date: "2024-03-20", status: "shipping", total: 2800000, items: [
    { name: "Jordan 1 Retro High", size: 43, qty: 1, price: 2800000, image: "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=600" },
  ]},
  { id: "ORD003", date: "2024-02-10", status: "delivered", total: 1900000, items: [
    { name: "New Balance 574", size: 40, qty: 1, price: 1900000, image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600" },
  ]},
  { id: "ORD004", date: "2024-01-05", status: "cancelled", total: 3600000, items: [
    { name: "Puma RS-X", size: 42, qty: 2, price: 1800000, image: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=600" },
  ]},
];

const statusLabels = {
  pending: "Chờ xử lý", confirmed: "Đã xác nhận", shipping: "Đang giao",
  delivered: "Đã giao", cancelled: "Đã hủy",
};
const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-500", confirmed: "bg-blue-500/10 text-blue-500",
  shipping: "bg-purple-500/10 text-purple-500", delivered: "bg-green-500/10 text-green-500",
  cancelled: "bg-red-500/10 text-red-500",
};

const Profile = () => {
  const [user, setUser] = useState(mockUser);
  const [favorites, setFavorites] = useState(products.slice(0, 4));
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [orderTab, setOrderTab] = useState("all");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ ...mockUser });

  const filteredOrders = orderTab === "all"
    ? mockOrders
    : mockOrders.filter(o => o.status === orderTab);

  const historyOrders = mockOrders.filter(o => o.status === "delivered" || o.status === "cancelled");

  const handleSaveProfile = () => {
    setUser({ ...profileForm });
    setEditingProfile(false);
    toast.success("Cập nhật thông tin thành công!");
  };

  const handleChangePassword = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      toast.error("Mật khẩu mới không khớp!");
      return;
    }
    if (passwords.new.length < 6) {
      toast.error("Mật khẩu mới phải ít nhất 6 ký tự!");
      return;
    }
    setPasswords({ current: "", new: "", confirm: "" });
    toast.success("Đổi mật khẩu thành công!");
  };

  const removeFavorite = (id) => {
    setFavorites(prev => prev.filter(p => p.id !== id));
    toast.success("Đã xóa khỏi yêu thích!");
  };

  return (
    <Layout>
      <div className="container py-8 max-w-5xl">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8 p-6 rounded-2xl bg-card border border-border">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-3xl font-bold text-primary-foreground">
              {user.name.charAt(0)}
            </div>
            <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="text-center md:text-left">
            <h1 className="font-heading text-2xl font-bold uppercase">{user.name}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 justify-center md:justify-start mt-1">
              <Mail className="h-3.5 w-3.5" /> {user.email}
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 justify-center md:justify-start">
              <Phone className="h-3.5 w-3.5" /> {user.phone}
            </p>
          </div>
          <div className="md:ml-auto flex gap-3">
            <div className="text-center px-4 py-2 rounded-xl bg-secondary">
              <p className="text-xl font-bold text-primary">{mockOrders.length}</p>
              <p className="text-[10px] text-muted-foreground">Đơn hàng</p>
            </div>
            <div className="text-center px-4 py-2 rounded-xl bg-secondary">
              <p className="text-xl font-bold text-primary">{favorites.length}</p>
              <p className="text-[10px] text-muted-foreground">Yêu thích</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="w-full justify-start bg-card border border-border rounded-xl p-1 h-auto flex-wrap">
            <TabsTrigger value="info" className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
              <User className="h-3.5 w-3.5" /> Thông tin
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
              <Package className="h-3.5 w-3.5" /> Đơn hàng
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
              <History className="h-3.5 w-3.5" /> Lịch sử
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
              <Shield className="h-3.5 w-3.5" /> Bảo mật
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
              <Heart className="h-3.5 w-3.5" /> Yêu thích
            </TabsTrigger>
          </TabsList>

          {/* TAB: Thông tin cá nhân */}
          <TabsContent value="info">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-bold uppercase">Thông tin cá nhân</h2>
                {!editingProfile ? (
                  <button onClick={() => setEditingProfile(true)} className="text-xs px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-colors">
                    Chỉnh sửa
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingProfile(false); setProfileForm({ ...user }); }} className="text-xs px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors">
                      Hủy
                    </button>
                    <button onClick={handleSaveProfile} className="text-xs px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-colors flex items-center gap-1">
                      <Save className="h-3 w-3" /> Lưu
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Họ và tên</label>
                  <input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} disabled={!editingProfile}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                  <input value={profileForm.email} onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))} disabled={!editingProfile}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Số điện thoại</label>
                  <input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} disabled={!editingProfile}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Ngày sinh</label>
                  <input type="date" value={profileForm.birthday} onChange={e => setProfileForm(f => ({ ...f, birthday: e.target.value }))} disabled={!editingProfile}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Giới tính</label>
                  <select value={profileForm.gender} onChange={e => setProfileForm(f => ({ ...f, gender: e.target.value }))} disabled={!editingProfile}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60">
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              {/* Addresses */}
              <div>
                <h3 className="font-medium text-sm mb-3 flex items-center gap-1.5 uppercase"><MapPin className="h-4 w-4 text-primary" /> Địa chỉ giao hàng</h3>
                <div className="space-y-3">
                  {user.addresses.map(addr => (
                    <div key={addr.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border">
                      <div>
                        <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full mr-2">{addr.label}</span>
                        {addr.isDefault && <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">Mặc định</span>}
                        <p className="text-sm mt-1 text-muted-foreground">{addr.address}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                  <button className="w-full py-2.5 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary transition-colors">
                    + Thêm địa chỉ mới
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB: Đơn hàng */}
          <TabsContent value="orders">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h2 className="font-heading text-lg font-bold uppercase">Đơn hàng của tôi</h2>
              <div className="flex gap-2 flex-wrap">
                {[{ key: "all", label: "Tất cả" }, { key: "pending", label: "Chờ xử lý" }, { key: "shipping", label: "Đang giao" }, { key: "delivered", label: "Đã giao" }, { key: "cancelled", label: "Đã hủy" }].map(t => (
                  <button key={t.key} onClick={() => setOrderTab(t.key)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${orderTab === t.key ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {filteredOrders.length === 0 && <p className="text-center text-muted-foreground py-8">Không có đơn hàng nào.</p>}
                {filteredOrders.map(order => (
                  <div key={order.id} className="rounded-xl border border-border p-4 space-y-3 hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">#{order.id}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">{formatPrice(order.total)}</p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{order.date}</p>
                      </div>
                    </div>
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-muted" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground">Size: {item.size} · SL: {item.qty}</p>
                        </div>
                        <p className="text-sm font-medium">{formatPrice(item.price)}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* TAB: Lịch sử đơn hàng */}
          <TabsContent value="history">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h2 className="font-heading text-lg font-bold uppercase">Lịch sử đơn hàng</h2>
              <p className="text-xs text-muted-foreground">Các đơn hàng đã hoàn thành hoặc đã hủy</p>
              <div className="space-y-4">
                {historyOrders.length === 0 && <p className="text-center text-muted-foreground py-8">Chưa có lịch sử đơn hàng.</p>}
                {historyOrders.map(order => (
                  <div key={order.id} className="rounded-xl border border-border p-4 hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">#{order.id}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">{formatPrice(order.total)}</p>
                        <p className="text-[10px] text-muted-foreground">{order.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2 min-w-fit">
                          <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover bg-muted" />
                          <div>
                            <p className="text-xs font-medium">{item.name}</p>
                            <p className="text-[10px] text-muted-foreground">Size {item.size}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {order.status === "delivered" && (
                      <button className="mt-3 text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1">
                        <Star className="h-3 w-3" /> Đánh giá sản phẩm
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* TAB: Bảo mật & Quyền riêng tư */}
          <TabsContent value="security">
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <h2 className="font-heading text-lg font-bold uppercase">Đổi mật khẩu</h2>
                <div className="space-y-3 max-w-md">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Mật khẩu hiện tại</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={passwords.current}
                        onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-primary" />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Mật khẩu mới</label>
                    <input type="password" value={passwords.new} onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Xác nhận mật khẩu mới</label>
                    <input type="password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <button onClick={handleChangePassword} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 transition-colors">
                    Cập nhật mật khẩu
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <h2 className="font-heading text-lg font-bold uppercase">Quyền riêng tư</h2>
                <div className="space-y-3">
                  {[
                    { label: "Hiển thị hồ sơ công khai", desc: "Cho phép người khác xem thông tin cơ bản của bạn" },
                    { label: "Nhận email khuyến mãi", desc: "Nhận thông báo về khuyến mãi và sản phẩm mới" },
                    { label: "Nhận thông báo đơn hàng qua SMS", desc: "Cập nhật trạng thái đơn hàng qua tin nhắn" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={i < 2} className="sr-only peer" />
                        <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-background after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-red-500/20 bg-card p-6">
                <h2 className="font-heading text-lg font-bold text-red-500 mb-2 uppercase">Vùng nguy hiểm</h2>
                <p className="text-xs text-muted-foreground mb-4">Xóa tài khoản sẽ xóa tất cả dữ liệu của bạn vĩnh viễn.</p>
                <button className="text-xs px-4 py-2 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors">
                  Xóa tài khoản
                </button>
              </div>
            </div>
          </TabsContent>

          {/* TAB: Sản phẩm yêu thích */}
          <TabsContent value="favorites">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h2 className="font-heading text-lg font-bold uppercase">Sản phẩm yêu thích ({favorites.length})</h2>
              {favorites.length === 0 && <p className="text-center text-muted-foreground py-8">Chưa có sản phẩm yêu thích.</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {favorites.map(product => (
                  <div key={product.id} className="group rounded-xl border border-border overflow-hidden hover:border-primary/30 transition-colors">
                    <div className="relative aspect-square bg-secondary">
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      <button onClick={() => removeFavorite(product.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="p-3">
                      <p className="text-[10px] text-muted-foreground">{product.brand}</p>
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-sm font-bold text-primary">{formatPrice(product.price)}</p>
                        <div className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-[10px] text-muted-foreground">{product.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;
