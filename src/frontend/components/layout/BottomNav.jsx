"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, User, Package } from "lucide-react";
import { useCart } from "@/frontend/context/CartContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { totalItems } = useCart();

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: ShoppingCart, label: "Cart", href: "/cart", badge: totalItems },
    { icon: Package, label: "Orders", href: "/orders" },
    { icon: User, label: "Account", href: "/account" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-white pb-safe md:hidden shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${
              isActive ? "text-green-700" : "text-gray-500 hover:text-green-600"
            }`}
          >
            <div className="relative">
              <Icon className={`h-5 w-5 ${isActive ? "fill-green-100" : ""}`} />
              {item.badge > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-[9px] font-bold text-white">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
