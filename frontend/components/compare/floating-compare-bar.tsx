"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCompareStore } from "@/store/compare-store";

export function FloatingCompareBar() {
  const { selectedProperties, removeFromCompare, clearCompare } = useCompareStore();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || selectedProperties.length === 0) {
    return null;
  }

  const isCompareReady = selectedProperties.length === 2;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-[92%] max-w-4xl -translate-x-1/2 animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-black/60 p-5 shadow-2xl backdrop-blur-2xl md:flex-row md:items-center md:justify-between">
        
        {/* Properties Container */}
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-xs font-semibold text-blue-400">
              {selectedProperties.length}
            </span>
            <p className="text-sm font-semibold tracking-wide text-white">
              Selected to Compare
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* Slot A & B */}
            {[0, 1].map((index) => {
              const property = selectedProperties[index];
              if (property) {
                return (
                  <div
                    key={property.id}
                    className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-2 pr-10 transition duration-300 hover:border-white/20"
                  >
                    <img
                      src={
                        property.imageUrl?.startsWith("http")
                          ? property.imageUrl
                          : "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=120&q=80"
                      }
                      alt={property.title}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-white max-w-[120px] sm:max-w-[150px]">
                        {property.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        ₹ {property.price?.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCompare(property.id)}
                      className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-[10px] font-bold text-white transition hover:bg-red-500"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                );
              } else {
                return (
                  <div
                    key={index}
                    className="flex h-14 w-[180px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 text-xs text-muted-foreground"
                  >
                    Select another property...
                  </div>
                );
              }
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 border-t border-white/10 pt-4 md:border-t-0 md:pt-0">
          <button
            onClick={clearCompare}
            className="text-xs font-medium text-muted-foreground transition hover:text-white"
          >
            Clear All
          </button>
          
          <Link
            href={isCompareReady ? "/compare" : "#"}
            onClick={(e) => {
              if (!isCompareReady) {
                e.preventDefault();
              }
            }}
            className={`flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold tracking-wide shadow-md transition duration-300 ${
              isCompareReady
                ? "bg-blue-600 text-white hover:bg-blue-500 active:scale-95"
                : "cursor-not-allowed bg-white/10 text-white/40 border border-white/5"
            }`}
          >
            Compare Now
          </Link>
        </div>

      </div>
    </div>
  );
}
