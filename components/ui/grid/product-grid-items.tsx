import { Grid } from "@/components/ui/grid";
import { GridTileImage } from "@/components/ui/grid/tile";
import { Product } from "@/types/shopify";
import Link from "next/link";

export function ProductGridItems({ products }: { products: Product[] }) {
  return (
    <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Grid.Item key={product.handle} className="animate-fadeIn">
          <Link
            className="relative inline-block h-full w-full"
            href={`/product/${product.handle}`}
            prefetch={true}
          >
            <GridTileImage
              alt={product.title}
              label={{
                title: product.title,
                amount: product.priceRange.maxVariantPrice.amount,
                currencyCode: product.priceRange.maxVariantPrice.currencyCode,
              }}
              src={product.featuredImage?.url}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 50vw"
            />
          </Link>
        </Grid.Item>
      ))}
    </Grid>
  );
}
