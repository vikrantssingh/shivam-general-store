"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Grid, ShoppingCart, Users, Settings, LogOut, Bell, Truck } from "lucide-react";
import { logoutAction } from "@/backend/actions/auth";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Package, label: "Products", href: "/admin/products" },
    { icon: Grid, label: "Categories", href: "/admin/categories" },
    { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
    { icon: Users, label: "Customers", href: "/admin/customers" },
    { icon: Truck, label: "Delivery", href: "/admin/delivery" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-white flex flex-col shadow-sm">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin" className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-gray-900 leading-none">
              ADMIN
            </span>
            <span className="text-[10px] font-bold text-gray-400 tracking-widest leading-none mt-1">
              SHIVAM STORE
            </span>
          </Link>
        </div>
        
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-green-50 text-green-700 border-l-4 border-green-600 font-bold shadow-sm" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-transparent"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-green-600" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <form action={logoutAction}>
            <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-8 shadow-sm">
          <h1 className="text-xl font-bold text-gray-800">Admin Portal</h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-red-600"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-xs">
              AD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
