"use client";

import { removeItem } from "@/components/ui/cart/actions";
import type { CartItem } from "@/types/shopify";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useTransition } from "react";

export function DeleteItemButton({
  item,
  onDelete,
}: {
  item: CartItem;
  onDelete: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      aria-label="Remove cart item"
      onClick={() => {
        startTransition(async () => {
          const error = await removeItem(null, item.merchandise.id);
          if (!error) {
            onDelete();
          }
        });
      }}
      disabled={isPending}
      className="ease flex h-[17px] w-[17px] items-center justify-center rounded-full bg-neutral-500 transition-all duration-200 hover:bg-neutral-800 dark:hover:bg-neutral-600"
    >
      <XMarkIcon className="h-4 w-4 text-white" />
    </button>
  );
}
