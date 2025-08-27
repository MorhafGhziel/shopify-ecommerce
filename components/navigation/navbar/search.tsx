"use client";

import { Price } from "@/components/ui/common/price";
import { GridTileImage } from "@/components/ui/grid/tile";
import { getProducts } from "@/lib/shopify";
import { Product } from "@/types/shopify";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function Search() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams?.get("q") || "");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        try {
          const products = await getProducts({ query: query.trim() });
          setSuggestions(products.slice(0, 2)); // Show only 2 products
          setShowSuggestions(true);
        } catch (error) {
          console.error("Search error:", error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (e.target.value.trim().length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = () => {
    setShowSuggestions(false);
    setQuery("");
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      <form action="/search" className="relative">
        <input
          key={searchParams?.get("q")}
          type="text"
          name="q"
          placeholder="Search for products..."
          autoComplete="off"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.trim().length >= 2 && setShowSuggestions(true)}
          className="text-md w-full rounded-lg border bg-white px-4 py-2 text-black placeholder:text-neutral-500 md:text-sm dark:border-neutral-800 dark:bg-transparent dark:text-white dark:placeholder:text-neutral-400"
        />
        <div className="absolute right-0 top-0 mr-3 flex h-full items-center">
          <MagnifyingGlassIcon className="h-4" />
        </div>
      </form>

      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-neutral-500 dark:text-neutral-400">
              Searching...
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-2">
              {suggestions.map((product) => (
                <Link
                  key={product.handle}
                  href={`/product/${product.handle}`}
                  onClick={handleSuggestionClick}
                  className="flex items-center gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  <div className="relative w-12 h-12 rounded-md overflow-hidden border border-neutral-200 dark:border-neutral-700">
                    {product.featuredImage && (
                      <GridTileImage
                        src={product.featuredImage.url}
                        fill
                        sizes="48px"
                        alt={product.title}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                      {product.title}
                    </h4>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                      <Price
                        amount={product.priceRange.minVariantPrice.amount}
                        currencyCode={
                          product.priceRange.minVariantPrice.currencyCode
                        }
                      />
                    </div>
                  </div>
                </Link>
              ))}
              {query.trim().length > 0 && (
                <div className="border-t border-neutral-200 dark:border-neutral-700">
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}`}
                    onClick={handleSuggestionClick}
                    className="block p-3 text-sm text-blue-600 dark:text-blue-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    View all results for "{query}"
                  </Link>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <form className="w-max-[550px] relative w-full lg:w-80 xl:w-full">
      <input
        placeholder="Search for products..."
        className="w-full rounded-lg border bg-white px-4 py-2 text-sm text-black placeholder:text-neutral-500 dark:border-neutral-800 dark:bg-transparent dark:text-white dark:placeholder:text-neutral-400"
      />
      <div className="absolute right-0 top-0 mr-3 flex h-full items-center">
        <MagnifyingGlassIcon className="h-4" />
      </div>
    </form>
  );
}
