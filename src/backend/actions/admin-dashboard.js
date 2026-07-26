"use server";

import { createClient } from "@/backend/supabase/server";

// Helper to get today's start date
const getStartOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
};

// Helper to get yesterday's start date
const getStartOfYesterday = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
};

export async function getDashboardStats() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Verify admin
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") return { error: "Unauthorized" };

  const startOfToday = getStartOfToday();
  const startOfYesterday = getStartOfYesterday();

  try {
    // 1. Revenue
    const { data: todayOrders, error: todayOrdersError } = await supabase
      .from("orders")
      .select("total_amount")
      .gte("created_at", startOfToday)
      .neq("status", "cancelled");

    const { data: yesterdayOrders, error: yesterdayOrdersError } = await supabase
      .from("orders")
      .select("total_amount")
      .gte("created_at", startOfYesterday)
      .lt("created_at", startOfToday)
      .neq("status", "cancelled");

    const todayRevenue = todayOrders?.reduce((acc, order) => acc + Number(order.total_amount), 0) || 0;
    const yesterdayRevenue = yesterdayOrders?.reduce((acc, order) => acc + Number(order.total_amount), 0) || 0;
    
    let revenueGrowth = 0;
    if (yesterdayRevenue > 0) {
      revenueGrowth = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
    } else if (todayRevenue > 0) {
      revenueGrowth = 100; // infinite growth from 0
    }

    // 2. Orders Count
    const todayOrdersCount = todayOrders?.length || 0;
    const yesterdayOrdersCount = yesterdayOrders?.length || 0;
    
    let ordersGrowth = 0;
    if (yesterdayOrdersCount > 0) {
      ordersGrowth = ((todayOrdersCount - yesterdayOrdersCount) / yesterdayOrdersCount) * 100;
    } else if (todayOrdersCount > 0) {
      ordersGrowth = 100;
    }

    // 3. Customers
    const { count: totalCustomers } = await supabase
      .from("users")
      .select("*", { count: 'exact', head: true });

    const { count: pendingShopkeepers } = await supabase
      .from("users")
      .select("*", { count: 'exact', head: true })
      .eq("role", "shopkeeper_pending");

    // Pending Orders
    const { count: pendingOrdersCount } = await supabase
      .from("orders")
      .select("*", { count: 'exact', head: true })
      .not("status", "eq", "delivered")
      .not("status", "eq", "cancelled");

    // 4. Low Stock
    const { count: lowStockCount } = await supabase
      .from("products")
      .select("*", { count: 'exact', head: true })
      .lte("stock", 10); // Using 10 as default low stock threshold

    const { count: outOfStockCount } = await supabase
      .from("products")
      .select("*", { count: 'exact', head: true })
      .lte("stock", 4);

    return {
      revenue: {
        today: todayRevenue,
        growth: revenueGrowth
      },
      orders: {
        today: todayOrdersCount,
        growth: ordersGrowth,
        pending: pendingOrdersCount || 0
      },
      customers: {
        total: totalCustomers || 0,
        pending: pendingShopkeepers || 0
      },
      stock: {
        low: lowStockCount || 0,
        out: outOfStockCount || 0
      }
    };
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return { error: "Failed to load stats" };
  }
}

export async function getDashboardCharts() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Verify admin
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") return { error: "Unauthorized" };

  try {
    // Weekly Revenue (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const { data: weeklyOrders } = await supabase
      .from("orders")
      .select("total_amount, created_at")
      .gte("created_at", sevenDaysAgo.toISOString())
      .neq("status", "cancelled");

    // Process weekly data
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyDataMap = {};
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      weeklyDataMap[dayName] = 0;
    }

    if (weeklyOrders) {
      weeklyOrders.forEach(order => {
        const date = new Date(order.created_at);
        const dayName = days[date.getDay()];
        if (weeklyDataMap[dayName] !== undefined) {
          weeklyDataMap[dayName] += Number(order.total_amount);
        }
      });
    }

    const salesData = Object.keys(weeklyDataMap).map(key => ({
      name: key,
      sales: weeklyDataMap[key]
    }));

    // Today's Order Volume by Hour
    const startOfToday = getStartOfToday();
    const { data: todayOrders } = await supabase
      .from("orders")
      .select("created_at")
      .gte("created_at", startOfToday);

    const todayVolumeMap = {
      "8am": 0, "10am": 0, "12pm": 0, "2pm": 0, "4pm": 0, "6pm": 0, "8pm": 0
    };

    if (todayOrders) {
      todayOrders.forEach(order => {
        const hour = new Date(order.created_at).getHours();
        if (hour >= 8 && hour < 10) todayVolumeMap["8am"]++;
        else if (hour >= 10 && hour < 12) todayVolumeMap["10am"]++;
        else if (hour >= 12 && hour < 14) todayVolumeMap["12pm"]++;
        else if (hour >= 14 && hour < 16) todayVolumeMap["2pm"]++;
        else if (hour >= 16 && hour < 18) todayVolumeMap["4pm"]++;
        else if (hour >= 18 && hour < 20) todayVolumeMap["6pm"]++;
        else if (hour >= 20) todayVolumeMap["8pm"]++;
      });
    }

    const orderData = Object.keys(todayVolumeMap).map(key => ({
      name: key,
      orders: todayVolumeMap[key]
    }));

    return { salesData, orderData };
  } catch (error) {
    console.error("Dashboard Charts Error:", error);
    return { error: "Failed to load chart data" };
  }
}

export async function getNotifications() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") return { error: "Unauthorized" };

  try {
    const notifications = [];

    // 1. Pending Shopkeepers
    const { data: pendingUsers } = await supabase
      .from("users")
      .select("id, full_name, business_name, created_at")
      .eq("role", "shopkeeper_pending")
      .order("created_at", { ascending: false })
      .limit(5);

    if (pendingUsers) {
      pendingUsers.forEach(u => {
        notifications.push({
          id: `user-${u.id}`,
          type: 'approval',
          title: 'New Shopkeeper Approval',
          message: `${u.full_name} (${u.business_name}) requested wholesale access.`,
          date: u.created_at,
          href: '/admin/customers'
        });
      });
    }

    // 2. New Orders (Placed today)
    const { data: newOrders } = await supabase
      .from("orders")
      .select("id, total_amount, created_at, users(full_name)")
      .eq("status", "placed")
      .gte("created_at", getStartOfToday())
      .order("created_at", { ascending: false })
      .limit(5);

    if (newOrders) {
      newOrders.forEach(o => {
        notifications.push({
          id: `order-${o.id}`,
          type: 'order',
          title: 'New Order Received',
          message: `${o.users?.full_name || 'Customer'} placed an order for ₹${o.total_amount}.`,
          date: o.created_at,
          href: '/admin/orders'
        });
      });
    }

    // 3. Out of stock products
    const { data: outOfStock } = await supabase
      .from("products")
      .select("id, name")
      .eq("stock", 0)
      .limit(5);

    if (outOfStock) {
      outOfStock.forEach(p => {
        notifications.push({
          id: `product-${p.id}`,
          type: 'stock',
          title: 'Out of Stock Alert',
          message: `${p.name} is currently out of stock.`,
          date: new Date().toISOString(),
          href: '/admin/products'
        });
      });
    }

    // Sort notifications by date descending
    notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

    return { notifications };
  } catch (error) {
    console.error("Notifications Error:", error);
    return { error: "Failed to load notifications" };
  }
}

export async function getRevenueHistory(period = '1w') {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") return { error: "Unauthorized" };

  try {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    let daysToFetch = 7;
    if (period === '1w') daysToFetch = 7;
    else if (period === '2w') daysToFetch = 14;
    else if (period === '1m') daysToFetch = 30;
    else if (period === '3m') daysToFetch = 90;

    startDate.setDate(startDate.getDate() - (daysToFetch - 1));

    const { data: orders, error } = await supabase
      .from("orders")
      .select("total_amount, created_at")
      .gte("created_at", startDate.toISOString())
      .neq("status", "cancelled");

    if (error) throw error;

    const dailyDataMap = {};
    
    // Initialize map with all days to ensure 0s for days without orders
    for (let i = 0; i < daysToFetch; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateString = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
      dailyDataMap[dateString] = {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        day: dayName,
        revenue: 0,
        sortIndex: d.getTime()
      };
    }

    if (orders) {
      orders.forEach(order => {
        const orderDate = new Date(order.created_at);
        const dateString = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        if (dailyDataMap[dateString]) {
          dailyDataMap[dateString].revenue += Number(order.total_amount);
        }
      });
    }

    const historyData = Object.values(dailyDataMap)
      .sort((a, b) => a.sortIndex - b.sortIndex) // Sort oldest to newest for chart
      .map(item => ({
        date: item.date,
        day: item.day,
        revenue: item.revenue
      }));

    return { historyData };
  } catch (error) {
    console.error("Revenue History Error:", error);
    return { error: "Failed to load revenue history" };
  }
}
