"use client";

import Link from "next/link";
import { Menu, Search, ShoppingCart, User, LogOut, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/frontend/context/CartContext";
import { logoutAction } from "@/backend/actions/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function Header({ user, isAdmin }) {
  const { totalItems } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || "");

  const handleSearch = (e) => {
    e.preventDefault();
    const currentCategory = searchParams.get('category');
    let url = '/?';
    if (currentCategory) url += `category=${currentCategory}&`;
    if (searchQuery.trim()) url += `q=${encodeURIComponent(searchQuery.trim())}`;
    
    // clean up trailing ? or &
    if (url.endsWith('&') || url.endsWith('?')) {
      url = url.slice(0, -1);
    }
    // if empty, just go to /
    if (url === '') url = '/';

    router.push(url);
  };
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Mobile Menu & Logo */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6 text-green-800" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <Link href="/" className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-green-700 leading-none">
              SHIVAM
            </span>
            <span className="text-xs font-semibold text-gray-500 tracking-widest leading-none mt-1">
              GENERAL STORE
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-green-700">Home</Link>
          <Link href="/categories" className="text-sm font-medium hover:text-green-700">Categories</Link>
          <Link href="/offers" className="text-sm font-medium hover:text-green-700">Offers</Link>
        </nav>

        {/* Actions (Search, Cart, Profile) */}
        <div className="flex items-center gap-2 md:gap-4">
          {isAdmin && (
            <Link href="/admin">
              <Button variant="outline" size="sm" className="flex text-xs sm:text-sm text-green-700 border-green-200 bg-green-50 hover:bg-green-100 font-bold px-2 sm:px-3">
                Admin Panel
              </Button>
            </Link>
          )}

          <form onSubmit={handleSearch} className="hidden sm:flex relative">
            <input 
              type="search" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 lg:w-64 rounded-full border border-gray-200 bg-gray-50 py-1.5 pl-9 pr-4 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </form>
          
          <Link href="/cart" className="relative hidden md:flex">
            <Button variant="ghost" size="icon" title="Cart">
              <ShoppingCart className="h-5 w-5 text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-[10px] font-bold text-white shadow-sm">
                  {totalItems}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          </Link>

          {user && (
            <Link href="/orders">
              <Button variant="ghost" size="icon" className="hidden md:flex text-gray-700 hover:text-green-700 hover:bg-green-50" title="My Orders">
                <Package className="h-5 w-5" />
                <span className="sr-only">My Orders</span>
              </Button>
            </Link>
          )}

          {user ? (
            <Link href="/account">
              <Button variant="ghost" size="icon" className="hidden md:flex text-green-700 hover:text-green-800 hover:bg-green-50" title="My Account">
                <User className="h-5 w-5" />
                <span className="sr-only">My Account</span>
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="icon" className="hidden md:flex" title="Login / Register">
                <User className="h-5 w-5 text-gray-700" />
                <span className="sr-only">Login</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      <div className="container mx-auto p-3 sm:hidden">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input 
            type="search" 
            placeholder="Search for products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
          />
        </form>
      </div>
    </header>
  );
}
