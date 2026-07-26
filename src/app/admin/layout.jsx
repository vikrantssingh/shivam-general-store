"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Grid, ShoppingCart, Users, Settings, LogOut, Truck, Menu } from "lucide-react";
import { logoutAction } from "@/backend/actions/auth";
import NotificationBell from "@/components/admin/NotificationBell";
import AdminRoleSwitcher from "@/frontend/components/layout/AdminRoleSwitcher";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
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
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      {/* Top Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center bg-white shadow-sm border-b">
        {/* Logo and Menu Button */}
        <div className="flex h-16 w-64 items-center px-4 border-r border-gray-200 shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 mr-3 text-gray-500 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200 shrink-0"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link href="/admin" className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-gray-900 leading-none">
              ADMIN
            </span>
            <span className="text-[10px] font-bold text-gray-400 tracking-widest leading-none mt-1">
              SHIVAM STORE
            </span>
          </Link>
        </div>
        
        {/* Top Right Header Content */}
        <div className="flex flex-1 items-center justify-between px-4 md:px-8">
          <h1 className="text-xl font-bold text-gray-800 hidden sm:block">Admin Portal</h1>
          <div className="flex items-center gap-4 ml-auto">
            <AdminRoleSwitcher />
            <NotificationBell />
            <div className="h-8 w-8 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-xs">
              AD
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 md:hidden top-16 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r bg-white flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
      <main className={`flex-1 w-full pt-16 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:pl-64' : 'pl-0'}`}>
        {/* Page Content */}
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
