import AdminLayout from "@/components/AdminLayout";
import { useEffect, useMemo, useState } from "react";
import { Package, ShoppingCart, Users, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatPrice } from "@/data/products";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import adminStatsApi from "@/api/adminStats.api";
import adminOrdersApi from "@/api/adminOrders.api";
import adminUsersApi from "@/api/adminUsers.api";
import adminProductsApi from "@/api/adminProducts.api";

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [monthRevenueData, setMonthRevenueData] = useState([]);
  const [dayOrdersData, setDayOrdersData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const [statsRaw, setStatsRaw] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
  });

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const [
        revenueMonthRes,
        revenueDayRes,
        ordersRes,
        usersRes,
        productsRes,
        bestRes,
      ] = await Promise.all([
        adminStatsApi.revenue({ interval: "month" }),
        adminStatsApi.revenue({ interval: "day" }),
        adminOrdersApi.list({ page: 1, limit: 4 }),
        adminUsersApi.list({ page: 1, limit: 1 }),
        adminProductsApi.list({ page: 1, limit: 1 }),
        adminStatsApi.bestsellers({ limit: 5 }),
      ]);

      const monthData = revenueMonthRes?.data?.timeline || [];
      const dayData = revenueDayRes?.data?.timeline || [];
      const orders = ordersRes?.orders || [];
      const bestsellers = bestRes?.data || [];

      setMonthRevenueData(monthData);
      setDayOrdersData(dayData);
      setRecentOrders(orders);
      setBestSelling(bestsellers);
      setStatsRaw({
        totalRevenue: revenueMonthRes?.data?.summary?.totalRevenue || 0,
        totalOrders: usersRes ? (ordersRes?.pagination?.total || 0) : 0,
        totalUsers: usersRes?.pagination?.total || 0,
        totalProducts: productsRes?.pagination?.total || 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const stats = useMemo(
    () => [
      {
        label: "Tổng doanh thu",
        value: formatPrice(statsRaw.totalRevenue),
        change: "",
        up: true,
        icon: DollarSign,
        color: "text-green-400",
      },
      {
        label: "Đơn hàng",
        value: String(statsRaw.totalOrders),
        change: "",
        up: true,
        icon: ShoppingCart,
        color: "text-blue-400",
      },
      {
        label: "Sản phẩm",
        value: String(statsRaw.totalProducts),
        change: "",
        up: true,
        icon: Package,
        color: "text-primary",
      },
      {
        label: "Người dùng",
        value: String(statsRaw.totalUsers),
        change: "",
        up: true,
        icon: Users,
        color: "text-purple-400",
      },
    ],
    [statsRaw],
  );

  return (
    <AdminLayout>
      <h1 className="font-heading text-3xl font-bold mb-8">DASHBOARD</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold font-heading">{stat.value}</p>
            <div className="flex items-center gap-1 mt-1">
              {stat.up ? <ArrowUpRight className="h-3 w-3 text-green-400" /> : <ArrowDownRight className="h-3 w-3 text-red-400" />}
              <span className="text-xs text-green-400">{stat.change || "--"}</span>
              <span className="text-xs text-muted-foreground">vs tháng trước</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-heading text-sm font-semibold mb-4">DOANH THU THEO THÁNG</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 16%)" />
              <XAxis dataKey="date" stroke="hsl(0 0% 55%)" fontSize={12} />
              <YAxis stroke="hsl(0 0% 55%)" fontSize={12} tickFormatter={(v) => `${v / 1000000}M`} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(0 0% 8%)", border: "1px solid hsl(0 0% 16%)", borderRadius: "8px", color: "hsl(0 0% 95%)" }}
                formatter={(value) => [formatPrice(value), "Doanh thu"]}
              />
              <Bar dataKey="revenue" fill="hsl(20 100% 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-heading text-sm font-semibold mb-4">ĐƠN HÀNG THEO NGÀY</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dayOrdersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 16%)" />
              <XAxis dataKey="date" stroke="hsl(0 0% 55%)" fontSize={12} />
              <YAxis stroke="hsl(0 0% 55%)" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(0 0% 8%)", border: "1px solid hsl(0 0% 16%)", borderRadius: "8px", color: "hsl(0 0% 95%)" }}
              />
              <Line type="monotone" dataKey="orders" stroke="hsl(20 100% 50%)" strokeWidth={2} dot={{ fill: "hsl(20 100% 50%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders & Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-heading text-sm font-semibold mb-4">ĐƠN HÀNG GẦN ĐÂY</h3>
          <div className="space-y-3">
            {recentOrders.slice(0, 4).map((order) => (
              <div key={order._id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium">{order._id}</p>
                  <p className="text-xs text-muted-foreground">{order?.user_id?.full_name || "-"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatPrice(order.total_price || 0)}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    order.status === "delivered" ? "bg-green-500/10 text-green-400" :
                    order.status === "shipping" ? "bg-blue-500/10 text-blue-400" :
                    order.status === "confirmed" ? "bg-yellow-500/10 text-yellow-400" :
                    order.status === "cancelled" ? "bg-red-500/10 text-red-400" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {order.status === "pending" && "Chờ xử lý"}
                    {order.status === "confirmed" && "Đã xác nhận"}
                    {order.status === "shipping" && "Đang giao"}
                    {order.status === "delivered" && "Đã giao"}
                    {order.status === "cancelled" && "Đã hủy"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-heading text-sm font-semibold mb-4">SẢN PHẨM BÁN CHẠY</h3>
          <div className="space-y-3">
            {bestSelling.slice(0, 5).map((item, i) => (
              <div key={`${item.product_id || item.product_name}-${i}`} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground">ID: {item.product_id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{item.totalSold} đã bán</p>
                  <p className="text-xs text-muted-foreground">{formatPrice(item.totalRevenue || 0)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {isLoading && <p className="text-center text-muted-foreground py-4">Đang tải dữ liệu dashboard...</p>}
    </AdminLayout>
  );
};

export default AdminDashboard;
