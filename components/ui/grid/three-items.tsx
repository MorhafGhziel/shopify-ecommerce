import { GridTileImage } from "@/components/ui/grid/tile";
import { getProducts } from "@/lib/shopify";
import type { Product } from "@/types/shopify";
import Link from "next/link";

function ThreeItemGridItem({
  item,
  size,
  priority,
}: {
  item: Product;
  size: "full" | "half";
  priority?: boolean;
}) {
  return (
    <div
      className={
        size === "full"
          ? "md:col-span-4 md:row-span-2"
          : "md:col-span-2 md:row-span-1"
      }
    >
      <Link
        className="relative block aspect-square h-full w-full"
        href={`/product/${item.handle}`}
        prefetch={true}
      >
        <GridTileImage
          src={item.featuredImage.url}
          fill
          sizes={
            size === "full"
              ? "(min-width: 768px) 66vw, 100vw"
              : "(min-width: 768px) 33vw, 100vw"
          }
          priority={priority}
          alt={item.title}
          label={{
            position: size === "full" ? "center" : "bottom",
            title: item.title as string,
            amount: item.priceRange.maxVariantPrice.amount,
            currencyCode: item.priceRange.maxVariantPrice.currencyCode,
          }}
        />
      </Link>
    </div>
  );
}

export async function ThreeItemGrid() {
  const homepageItems = await getProducts({});

  if (!homepageItems.length) return null;

  return (
    <section className="mx-auto grid max-w-(--breakpoint-2xl) gap-4 px-4 pb-4 md:grid-cols-6 md:grid-rows-2 lg:max-h-[calc(100vh-200px)]">
      {homepageItems[0] && (
        <ThreeItemGridItem
          size="full"
          item={homepageItems[0]}
          priority={true}
        />
      )}
      {homepageItems[1] && (
        <ThreeItemGridItem
          size="half"
          item={homepageItems[1]}
          priority={true}
        />
      )}
      {homepageItems[2] && (
        <ThreeItemGridItem size="half" item={homepageItems[2]} />
      )}
    </section>
  );
}
