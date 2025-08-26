import { CartModal } from "@/components/ui/cart/modal";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Search, SearchSkeleton } from "./search";

const { SITE_NAME } = process.env;

export function Navbar() {
  return (
    <nav className="relative flex items-center justify-between p-4 lg:px-6">
      <div className="flex w-full items-center">
        {/* Left - Logo */}
        <div className="flex-none">
          <Link href="/" prefetch={true} className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="MRHFMARKET logo"
              width={40}
              height={40}
              className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-black"
            />
            <div className="ml-2 text-sm font-medium uppercase">
              {SITE_NAME}
            </div>
          </Link>
        </div>

        {/* Center - Search */}
        <div className="flex-1 px-6">
          <Suspense fallback={<SearchSkeleton />}>
            <Search />
          </Suspense>
        </div>

        {/* Right - Cart */}
        <div className="flex-none">
          <CartModal />
        </div>
      </div>
    </nav>
  );
}
