"use client";

import { CartModal } from "@/components/ui/cart/modal";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";
import { Search, SearchSkeleton } from "./search";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <>
      <nav className="relative flex items-center justify-between p-4 lg:px-6">
        <div className="flex items-center space-x-6">
          <Link href="/" prefetch={true} className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="MRHFMARKET logo"
              width={40}
              height={40}
              className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-black"
            />
            <div className="ml-2 text-sm font-medium uppercase">Mrhf Store</div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/search"
              className="text-sm font-medium text-[#e5e7eb]/70 hover:text-white transition-colors"
            >
              All
            </Link>
          </nav>
        </div>

        <div className="hidden md:flex flex-1 px-6">
          <Suspense fallback={<SearchSkeleton />}>
            <Search />
          </Suspense>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMobileMenu}
            className="md:hidden relative flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white"
          >
            <Bars3Icon className="h-4 w-4" />
          </button>

          <CartModal />
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30"
              onClick={toggleMobileMenu}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 200,
                duration: 0.3,
              }}
              className="fixed right-0 top-0 h-full w-80 bg-black text-white"
            >
              <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                <h2 className="text-lg font-semibold">Menu</h2>
                <button
                  onClick={toggleMobileMenu}
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-neutral-700 bg-neutral-800 text-white transition-colors hover:bg-neutral-700"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 border-b border-neutral-800">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for products..."
                    className="w-full rounded-lg bg-neutral-800 border-neutral-700 px-4 py-3 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg
                      className="h-5 w-5 text-neutral-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-3">
                  Categories
                </h3>
                <nav className="space-y-2">
                  <Link
                    href="/search"
                    onClick={toggleMobileMenu}
                    className="block py-2 text-white hover:text-blue-400 transition-colors"
                  >
                    All
                  </Link>
                </nav>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
