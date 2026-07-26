"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function CategoryList({ categories, currentCategoryId, q }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="mt-8 mb-6 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Shop by Category</h2>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1 text-sm font-semibold text-green-700 hover:underline cursor-pointer"
          >
            View All Categories <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 max-h-64 overflow-y-auto rounded-xl bg-white shadow-xl border border-gray-100 z-50">
              <div className="p-2 flex flex-col gap-1">
                {categories.map((category) => {
                  const isActive = currentCategoryId === category.id;
                  return (
                    <Link
                      href={`/?category=${category.id}${q ? `&q=${q}` : ''}`}
                      key={category.id || category.name}
                      onClick={() => setIsDropdownOpen(false)}
                      className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive ? "bg-green-100 text-green-800" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      {category.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 1 Line Categories - Uses max-height and overflow-hidden to keep only 1 row */}
      <div className="h-11 overflow-hidden">
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => {
            const isActive = currentCategoryId === category.id;
            return (
              <Link 
                href={`/?category=${category.id}${q ? `&q=${q}` : ''}`}
                key={category.id || category.name} 
                className={`flex items-center justify-center rounded-xl py-2 px-4 text-sm font-semibold whitespace-nowrap transition-colors ${
                  isActive ? "bg-green-700 text-white shadow-md" : "bg-white border border-gray-200 hover:bg-green-50 text-gray-700 shadow-sm"
                }`}
              >
                {category.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
