import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingCart,
  Users,
  Warehouse,
  Ticket,
  BarChart3,
  TrendingUp,
  MessageSquare,
  Image,
  LogOut,
  ChevronLeft,
  Menu,
  Tag,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { title: "Sản phẩm", icon: Package, path: "/admin/products" },
  { title: "Danh mục", icon: FolderOpen, path: "/admin/categories" },
  { title: "Thương hiệu", icon: Tag, path: "/admin/brands" },
  { title: "Đơn hàng", icon: ShoppingCart, path: "/admin/orders" },
  { title: "Người dùng", icon: Users, path: "/admin/users" },
  { title: "Kho hàng", icon: Warehouse, path: "/admin/inventory" },
  { title: "Khuyến mãi", icon: Ticket, path: "/admin/promotions" },
  { title: "Doanh thu", icon: BarChart3, path: "/admin/revenue" },
  { title: "Bán chạy", icon: TrendingUp, path: "/admin/bestsellers" },
  { title: "Đánh giá", icon: MessageSquare, path: "/admin/reviews" },
  { title: "Banner", icon: Image, path: "/admin/banners" },
];

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={`sticky top-0 h-screen border-r border-border bg-card flex flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          {!collapsed && (
            <Link
              to="/admin"
              className="font-heading text-lg font-bold text-gradient"
            >
              ADMIN
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            {collapsed ? (
              <Menu className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
                title={collapsed ? item.title : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>



        <div className="border-t border-border p-2 space-y-2">

          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors mt-2"
            title={collapsed ? "Về trang chủ" : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Về trang chủ</span>}
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {user && (
          <header className="h-16 flex items-center justify-end px-6 border-b border-border bg-card shrink-0">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold">{user.full_name || "Admin"}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {user.full_name?.charAt(0) || user.email?.charAt(0) || "A"}
              </div>
            </div>
          </header>
        )}
        <div className="flex-1 p-6 md:p-8 overflow-auto">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
