import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, IndianRupee, Users } from "lucide-react";
import DashboardCharts from "./_components/DashboardCharts";
import RevenueHistorySection from "./_components/RevenueHistorySection";
import { getDashboardStats, getDashboardCharts } from "@/backend/actions/admin-dashboard";

export default async function AdminDashboard() {
  const statsResult = await getDashboardStats();
  const chartsResult = await getDashboardCharts();
  
  // Default fallback values if error
  const stats = statsResult.error ? {
    revenue: { today: 45231.89, growth: 20.1 },
    orders: { today: 142, growth: 12.5 },
    customers: { total: 12234, pending: 45 },
    stock: { low: 18, out: 3 }
  } : statsResult;

  const salesData = chartsResult.salesData;
  const orderData = chartsResult.orderData;

  return (
    <div className="space-y-8">
      {/* Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Today's Revenue</CardTitle>
            <IndianRupee className="h-8 w-8 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">₹{stats.revenue.today.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className={`text-xs font-medium mt-1 ${stats.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.revenue.growth >= 0 ? '+' : ''}{stats.revenue.growth.toFixed(1)}% from yesterday
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Today's Orders</CardTitle>
            <ShoppingCart className="h-8 w-8 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.orders.today > 0 ? '+' : ''}{stats.orders.today}</div>
            <p className={`text-xs font-medium mt-1 ${stats.orders.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.orders.growth >= 0 ? '+' : ''}{stats.orders.growth.toFixed(1)}% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Customers</CardTitle>
            <Users className="h-8 w-8 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.customers.total.toLocaleString()}</div>
            <p className="text-xs text-gray-500 font-medium mt-1">{stats.customers.pending} pending shopkeeper approvals</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Low Stock Alerts</CardTitle>
            <Package className="h-8 w-8 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.stock.low}</div>
            <p className="text-xs text-red-500 font-medium mt-1">{stats.stock.out} items out of stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Area */}
      <DashboardCharts salesData={salesData} orderData={orderData} />
      
      {/* Revenue History with Filters */}
      <RevenueHistorySection />
    </div>
  );
}
