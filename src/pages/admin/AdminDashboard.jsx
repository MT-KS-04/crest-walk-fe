import AdminLayout from "@/components/AdminLayout";
import { Package, ShoppingCart, Users, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatPrice } from "@/data/products";
import { mockOrders, mockUsers, revenueData, bestSelling } from "@/data/adminData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const stats = [
  { label: "Tổng doanh thu", value: formatPrice(215300000), change: "+12.5%", up: true, icon: DollarSign, color: "text-green-400" },
  { label: "Đơn hàng", value: "156", change: "+8.2%", up: true, icon: ShoppingCart, color: "text-blue-400" },
  { label: "Sản phẩm", value: "8", change: "+2", up: true, icon: Package, color: "text-primary" },
  { label: "Người dùng", value: mockUsers.length.toString(), change: "+15%", up: true, icon: Users, color: "text-purple-400" },
];

const AdminDashboard = () => {
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
              <span className="text-xs text-green-400">{stat.change}</span>
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
            <BarChart data={revenueData.monthly}>
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
            <LineChart data={revenueData.daily}>
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
            {mockOrders.slice(0, 4).map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium">{order.id}</p>
                  <p className="text-xs text-muted-foreground">{order.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatPrice(order.totalAmount)}</p>
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
              <div key={item.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.brand}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{item.sold} đã bán</p>
                  <p className="text-xs text-muted-foreground">{formatPrice(item.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
