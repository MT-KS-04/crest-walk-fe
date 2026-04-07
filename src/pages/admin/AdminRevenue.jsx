import AdminLayout from "@/components/AdminLayout";
import { revenueData } from "@/data/adminData";
import { formatPrice } from "@/data/products";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const AdminRevenue = () => {
  const [view, setView] = useState("monthly");
  const data = revenueData[view];
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = data.reduce((sum, d) => sum + d.orders, 0);

  return (
    <AdminLayout>
      <h1 className="font-heading text-3xl font-bold mb-6">THỐNG KÊ DOANH THU</h1>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setView("daily")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${view === "daily" ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"}`}>
          Theo ngày
        </button>
        <button onClick={() => setView("monthly")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${view === "monthly" ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"}`}>
          Theo tháng
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Tổng doanh thu</p>
          <p className="text-2xl font-bold font-heading text-primary mt-1">{formatPrice(totalRevenue)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Tổng đơn hàng</p>
          <p className="text-2xl font-bold font-heading mt-1">{totalOrders}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Giá trị trung bình</p>
          <p className="text-2xl font-bold font-heading mt-1">{totalOrders > 0 ? formatPrice(totalRevenue / totalOrders) : "0"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-heading text-sm font-semibold mb-4">DOANH THU</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 16%)" />
              <XAxis dataKey="date" stroke="hsl(0 0% 55%)" fontSize={12} />
              <YAxis stroke="hsl(0 0% 55%)" fontSize={12} tickFormatter={(v) => `${v / 1000000}M`} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(0 0% 8%)", border: "1px solid hsl(0 0% 16%)", borderRadius: "8px", color: "hsl(0 0% 95%)" }}
                formatter={(value) => [formatPrice(value), "Doanh thu"]} />
              <Bar dataKey="revenue" fill="hsl(20 100% 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-heading text-sm font-semibold mb-4">SỐ ĐƠN HÀNG</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 16%)" />
              <XAxis dataKey="date" stroke="hsl(0 0% 55%)" fontSize={12} />
              <YAxis stroke="hsl(0 0% 55%)" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(0 0% 8%)", border: "1px solid hsl(0 0% 16%)", borderRadius: "8px", color: "hsl(0 0% 95%)" }} />
              <Area type="monotone" dataKey="orders" stroke="hsl(20 100% 50%)" fill="hsl(20 100% 50% / 0.2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminRevenue;
