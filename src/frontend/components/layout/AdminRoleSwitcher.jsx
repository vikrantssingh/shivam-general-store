"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Shield, User, Store } from "lucide-react";
import { usePathname } from "next/navigation";

export default function AdminRoleSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [viewAs, setViewAs] = useState("");
  const dropdownRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const match = document.cookie.match(new RegExp('(^| )admin_viewAs=([^;]+)'));
    if (match) {
      setViewAs(match[2]);
    } else {
      setViewAs("retail");
    }
  }, []);

  const isAdminPortal = pathname?.startsWith('/admin');

  const setViewMode = (mode) => {
    // Set a cookie so the view mode persists across navigations for the admin
    document.cookie = `admin_viewAs=${mode}; path=/; max-age=86400`;
    setViewAs(mode);
    setIsOpen(false);
  };

  let buttonLabel = "Admin Portal";
  if (!isAdminPortal) {
    if (viewAs === "shopkeeper") {
      buttonLabel = "Shopkeeper Panel";
    } else {
      buttonLabel = "Retail Panel";
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="flex items-center gap-1 text-xs sm:text-sm text-green-800 border border-green-200 bg-green-50 hover:bg-green-100 font-bold px-2 sm:px-3 py-1.5 rounded-md transition-colors"
      >
        {buttonLabel} <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 py-1">
          <Link href="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700">
            <Shield className="h-4 w-4" /> Admin Portal
          </Link>
          <a href="/" onClick={() => setViewMode('retail')} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 cursor-pointer">
            <User className="h-4 w-4" /> Retail Panel
          </a>
          <a href="/" onClick={() => setViewMode('shopkeeper')} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 cursor-pointer">
            <Store className="h-4 w-4" /> Shopkeeper Panel
          </a>
        </div>
      )}
    </div>
  );
}
