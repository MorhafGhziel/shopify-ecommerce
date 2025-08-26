"use server";

import { TAGS } from "@/lib/constants";
import {
  addToCart,
  createCart,
  getCart,
  removeFromCart,
  updateCart,
} from "@/lib/shopify";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export async function addItem(
  prevState: any,
  selectedVariantId: string | undefined
) {
  if (!selectedVariantId) {
    return "Error adding item to cart";
  }

  try {
    // Check if we have a cart ID
    const cartId = (await cookies()).get("cartId")?.value;

    // If no cart ID, create a new cart first
    if (!cartId) {
      await createCartAndSetCookie();
    }

    // Add item to cart
    const currentCartId = (await cookies()).get("cartId")?.value;
    if (!currentCartId) {
      return "Error: No cart ID found";
    }
    await addToCart(currentCartId, [
      { merchandiseId: selectedVariantId, quantity: 1 },
    ]);
    revalidateTag(TAGS.cart);
  } catch (e) {
    console.error("Error adding item to cart:", e);
    return "Error adding item to cart";
  }
}

export async function removeItem(prevState: any, merchandiseId: string) {
  try {
    const cartId = (await cookies()).get("cartId")?.value;
    if (!cartId) {
      return "Error: No cart ID found";
    }
    const cart = await getCart(cartId);

    if (!cart) {
      return "Error fetching cart";
    }

    const lineItem = cart.lines.find(
      (line) => line.merchandise.id === merchandiseId
    );

    if (lineItem && lineItem.id) {
      await removeFromCart(cartId, [lineItem.id]);
      revalidateTag(TAGS.cart);
    } else {
      return "Item not found in cart";
    }
  } catch (e) {
    return "Error removing item from cart";
  }
}

export async function updateItemQuantity(
  prevState: any,
  payload: {
    merchandiseId: string;
    quantity: number;
  }
) {
  const { merchandiseId, quantity } = payload;

  try {
    const cartId = (await cookies()).get("cartId")?.value;
    if (!cartId) {
      return "Error: No cart ID found";
    }
    const cart = await getCart(cartId);

    if (!cart) {
      return "Error fetching cart";
    }

    const lineItem = cart.lines.find(
      (line) => line.merchandise.id === merchandiseId
    );

    if (lineItem && lineItem.id) {
      if (quantity === 0) {
        await removeFromCart(cartId, [lineItem.id]);
      } else {
        await updateCart(cartId, [
          {
            id: lineItem.id,
            merchandiseId,
            quantity,
          },
        ]);
      }
    } else if (quantity > 0) {
      // If the item doesn't exist in the cart and quantity > 0, add it
      const currentCartId = (await cookies()).get("cartId")?.value;
      if (!currentCartId) {
        return "Error: No cart ID found";
      }
      await addToCart(currentCartId, [{ merchandiseId, quantity }]);
    }

    revalidateTag(TAGS.cart);
  } catch (e) {
    console.error(e);
    return "Error updating item quantity";
  }
}

export async function redirectToCheckout() {
  const cartId = (await cookies()).get("cartId")?.value;
  if (!cartId) {
    return null;
  }
  let cart = await getCart(cartId);
  return cart?.checkoutUrl || null;
}

export async function createCartAndSetCookie() {
  let cart = await createCart();
  if (cart?.id) {
    (await cookies()).set("cartId", cart.id);
  }
}
