import { ProductGridItems } from "@/components/ui/grid/product-grid-items";
import { defaultSort, sorting } from "@/lib/constants";
import { getProducts } from "@/lib/shopify";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description: "Search for products in the store.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const { sort, q: searchValue } = params as { [key: string]: string };
  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sort) || defaultSort;

  // Format the search query for Shopify
  const searchQuery = searchValue
    ? `title:*${searchValue}* OR description:*${searchValue}*`
    : "";

  const products = await getProducts({
    query: searchQuery,
    sortKey,
    reverse,
  });

  return (
    <div className="flex flex-col gap-4">
      {searchValue ? (
        <p className="text-md text-neutral-500 dark:text-neutral-400">
          Showing {products.length} results for &quot;{searchValue}&quot;
        </p>
      ) : null}
      <ProductGridItems products={products} />
    </div>
  );
}
