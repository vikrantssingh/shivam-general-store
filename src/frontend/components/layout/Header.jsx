"use client";

import Link from "next/link";
import { Menu, Search, ShoppingCart, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/frontend/context/CartContext";
import { logoutAction } from "@/backend/actions/auth";

export default function Header({ user, isAdmin }) {
  const { totalItems } = useCart();
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
              <Button variant="outline" size="sm" className="hidden sm:flex text-green-700 border-green-200 bg-green-50 hover:bg-green-100 font-bold">
                Admin Panel
              </Button>
            </Link>
          )}

          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Search className="h-5 w-5 text-gray-700" />
            <span className="sr-only">Search</span>
          </Button>
          
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5 text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          </Link>

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
      
      {/* Mobile Search Bar - Shows below header on small screens */}
      <div className="container mx-auto p-3 sm:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input 
            type="search" 
            placeholder="Search for products..." 
            className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
          />
        </div>
      </div>
    </header>
  );
}
