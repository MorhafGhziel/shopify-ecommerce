"use client";

import { GridTileImage } from "@/components/ui/grid/tile";
import { getProducts } from "@/lib/shopify";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

export function SlidingProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await getProducts({});
        if (fetchedProducts?.length) {
          setProducts([
            ...fetchedProducts,
            ...fetchedProducts,
            ...fetchedProducts,
          ]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  if (!products?.length) return null;

  return (
    <div className="relative w-full overflow-hidden py-8">
      <motion.div
        className="flex space-x-8 w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 25,
            ease: "linear",
          },
        }}
        onHoverStart={() => setIsPaused(true)}
        onHoverEnd={() => setIsPaused(false)}
        style={{
          animationPlayState: isPaused ? "paused" : "running",
        }}
      >
        {products.map((product, i) => (
          <div
            key={`${product.handle}-${i}`}
            className="relative aspect-square h-[30vh] max-h-[275px] w-2/3 max-w-[475px] flex-none md:w-1/3"
          >
            <Link
              href={`/product/${product.handle}`}
              className="relative h-full w-full block"
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
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              />
            </Link>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
