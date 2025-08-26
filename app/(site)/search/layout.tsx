import { Collections } from "@/components/navigation/search/collections";
import { FilterList } from "@/components/navigation/search/filter";
import { sorting } from "@/lib/constants";

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 pb-8 min-h-screen">
      <div className="flex flex-col gap-8 pb-4 md:flex-row">
        {/* Left sidebar - Collections */}
        <div className="order-first w-full flex-none md:max-w-[125px]">
          <Collections />
        </div>

        {/* Main content */}
        <div className="order-last w-full md:order-none">
          <div className="mb-8">{children}</div>
        </div>

        {/* Right sidebar - Sort options */}
        <div className="order-none w-full flex-none md:order-last md:max-w-[125px]">
          <FilterList list={sorting} title="Sort by" />
        </div>
      </div>
    </div>
  );
}
