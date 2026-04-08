import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/data/products";
import {
  User, Package, History, Shield, Heart, Camera, Save, Eye, EyeOff,
  MapPin, Phone, Mail, Calendar, ChevronRight, Star, Trash2, Settings, LogOut
} from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

const Profile = () => {
  const { user, handleLogout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";

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

  const handleDeleteAccount = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.")) {
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
                  <img src={user.avatar} alt={user.full_name} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">{user?.full_name || "Người dùng"}</h1>
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
                    <label className="text-sm font-semibold text-foreground/80 ml-1">Họ và tên</label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nhập họ và tên"
                      className="w-full px-5 py-3.5 rounded-2xl border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/80 ml-1">Email</label>
                    <input 
                      type="email" 
                      value={email}
                      disabled
                      placeholder="email@example.com"
                      className="w-full px-5 py-3.5 rounded-2xl border border-border bg-muted/10 text-muted-foreground cursor-not-allowed text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/80 ml-1">Số điện thoại</label>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Nhập số điện thoại"
                      className="w-full px-5 py-3.5 rounded-2xl border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/80 ml-1">Địa chỉ</label>
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

            {activeTab === "settings" && (
              <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-8 text-[#1a1a1a]">Cài đặt tài khoản</h2>
                
                {/* Đổi mật khẩu */}
                <div className="mb-10">
                  <h3 className="text-sm font-bold text-foreground mb-4">Đổi mật khẩu</h3>
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
                  <p className="text-xs text-muted-foreground ml-1">Hành động này không thể hoàn tác.</p>
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
