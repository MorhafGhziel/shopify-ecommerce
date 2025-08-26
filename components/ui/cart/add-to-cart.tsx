"use client";

import { addItem } from "@/components/ui/cart/actions";
import { useCart } from "@/hooks/useCart";
import { useProduct } from "@/hooks/useProduct";
import { Product, ProductVariant } from "@/types/shopify";
import { PlusIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useTransition } from "react";

function SubmitButton({
  availableForSale,
  selectedVariantId,
  isPending,
}: {
  availableForSale: boolean;
  selectedVariantId: string | undefined;
  isPending: boolean;
}) {
  const buttonClasses =
    "relative flex w-full items-center justify-center rounded-full bg-blue-600 p-4 tracking-wide text-white";
  const disabledClasses = "cursor-not-allowed opacity-60 hover:opacity-60";

  if (!availableForSale) {
    return (
      <button disabled className={clsx(buttonClasses, disabledClasses)}>
        Out Of Stock
      </button>
    );
  }

  if (!selectedVariantId) {
    return (
      <button
        aria-label="Please select an option"
        disabled
        className={clsx(buttonClasses, disabledClasses)}
      >
        <div className="absolute left-0 ml-4">
          <PlusIcon className="h-5" />
        </div>
        Add To Cart
      </button>
    );
  }

  return (
    <button
      aria-label="Add to cart"
      className={clsx(buttonClasses, {
        "hover:opacity-90": !isPending,
        [disabledClasses]: isPending,
      })}
      disabled={isPending}
    >
      <div className="absolute left-0 ml-4">
        <PlusIcon className="h-5" />
      </div>
      {isPending ? "Adding..." : "Add To Cart"}
    </button>
  );
}

export function AddToCart({ product }: { product: Product }) {
  const { variants, availableForSale } = product;
  const { addCartItem } = useCart();
  const { state } = useProduct();
  const [isPending, startTransition] = useTransition();

  const variant = variants.find((variant: ProductVariant) =>
    variant.selectedOptions.every(
      (option) => option.value === state[option.name.toLowerCase()]
    )
  );
  const defaultVariantId = variants.length === 1 ? variants[0]?.id : undefined;
  const selectedVariantId = variant?.id || defaultVariantId;
  const finalVariant = variants.find(
    (variant) => variant.id === selectedVariantId
  )!;

  return (
    <button
      onClick={() => {
        startTransition(async () => {
          if (selectedVariantId) {
            const error = await addItem(null, selectedVariantId);
            if (!error) {
              addCartItem(finalVariant, product);
            }
          }
        });
      }}
      disabled={!availableForSale || !selectedVariantId || isPending}
      className={clsx(
        "relative flex w-full items-center justify-center rounded-full bg-blue-600 p-4 tracking-wide text-white",
        {
          "hover:opacity-90":
            availableForSale && selectedVariantId && !isPending,
          "cursor-not-allowed opacity-60 hover:opacity-60":
            !availableForSale || !selectedVariantId || isPending,
        }
      )}
    >
      <div className="absolute left-0 ml-4">
        <PlusIcon className="h-5" />
      </div>
      {!availableForSale
        ? "Out Of Stock"
        : !selectedVariantId
          ? "Select Option"
          : isPending
            ? "Adding..."
            : "Add To Cart"}
    </button>
  );
}
