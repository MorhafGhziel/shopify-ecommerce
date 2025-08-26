"use server";

import { SHOPIFY_GRAPHQL_API_ENDPOINT } from "@/lib/constants";
import { isShopifyError } from "@/lib/type-guards";
import { ensureStartsWith } from "@/lib/utils";
import {
  Cart,
  Collection,
  Connection,
  Menu,
  Page,
  Product,
} from "@/types/shopify";
import {
  addToCartMutation,
  createCartMutation,
  editCartItemsMutation,
  removeFromCartMutation,
} from "../mutations/cart";
import {
  getCartQuery,
  getCollectionProductsQuery,
  getCollectionQuery,
  getCollectionsQuery,
  getMenuQuery,
  getPageQuery,
  getProductQuery,
  getProductRecommendationsQuery,
  getProductsQuery,
} from "../queries/cart";

const domain = process.env.SHOPIFY_STORE_DOMAIN
  ? ensureStartsWith(process.env.SHOPIFY_STORE_DOMAIN, "https://")
  : "";
const endpoint = `${domain}${SHOPIFY_GRAPHQL_API_ENDPOINT}`;
const key = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

type ExtractVariables<T> = T extends { variables: object }
  ? T["variables"]
  : never;

export async function shopifyFetch<T>({
  query,
  variables,
  headers: customHeaders = {},
  cache = "force-cache",
}: {
  query: string;
  variables?: ExtractVariables<T>;
  headers?: HeadersInit;
  cache?: RequestCache;
}): Promise<{ status: number; body: T } | never> {
  try {
    const result = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": key,
        ...customHeaders,
      },
      body: JSON.stringify({
        ...(query && { query }),
        ...(variables && { variables }),
      }),
      cache,
    });

    const body = await result.json();

    if (body.errors) {
      throw body.errors[0];
    }

    return {
      status: result.status,
      body,
    };
  } catch (e) {
    if (isShopifyError(e)) {
      throw {
        status: e.status || 500,
        message: e.message,
        query,
      };
    }

    throw {
      error: e,
      query,
    };
  }
}

export async function getProducts({
  query,
  reverse,
  sortKey,
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  const res = await shopifyFetch<{
    data: {
      products: Connection<Product>;
    };
  }>({
    query: getProductsQuery,
    variables: {
      query,
      reverse,
      sortKey,
    },
  });

  return res.body.data.products.nodes;
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  const res = await shopifyFetch<{
    data: {
      product: Product;
    };
  }>({
    query: getProductQuery,
    variables: {
      handle,
    },
  });

  return res.body.data.product;
}

export async function getProductRecommendations(
  productId: string
): Promise<Product[]> {
  const res = await shopifyFetch<{
    data: {
      productRecommendations: Product[];
    };
  }>({
    query: getProductRecommendationsQuery,
    variables: {
      productId,
    },
  });

  return res.body.data.productRecommendations;
}

export async function getCollection(
  handle: string
): Promise<Collection | undefined> {
  const res = await shopifyFetch<{
    data: {
      collection: Collection;
    };
  }>({
    query: getCollectionQuery,
    variables: {
      handle,
    },
  });

  return res.body.data.collection;
}

export async function getCollectionProducts({
  collection,
  reverse,
  sortKey,
}: {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  const res = await shopifyFetch<{
    data: {
      collection: {
        products: Connection<Product>;
      };
    };
  }>({
    query: getCollectionProductsQuery,
    variables: {
      handle: collection,
      reverse,
      sortKey,
    },
  });

  return res.body.data.collection.products.nodes;
}

export async function getCollections(): Promise<Collection[]> {
  const res = await shopifyFetch<{
    data: {
      collections: Connection<Collection>;
    };
  }>({
    query: getCollectionsQuery,
  });

  return res.body.data.collections.nodes;
}

export async function getMenu(handle: string): Promise<Menu[]> {
  const res = await shopifyFetch<{
    data: {
      menu: {
        items: Menu[];
      };
    };
  }>({
    query: getMenuQuery,
    variables: {
      handle,
    },
  });

  return res.body.data.menu.items;
}

export async function getPage(handle: string): Promise<Page> {
  const res = await shopifyFetch<{
    data: {
      page: Page;
    };
  }>({
    query: getPageQuery,
    variables: {
      handle,
    },
  });

  return res.body.data.page;
}

export async function createCart(): Promise<Cart> {
  const res = await shopifyFetch<{
    data: {
      cartCreate: {
        cart: Cart;
      };
    };
  }>({
    query: createCartMutation,
    cache: "no-store",
  });

  return res.body.data.cartCreate.cart;
}

export async function addToCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const res = await shopifyFetch<{
    data: {
      cartLinesAdd: {
        cart: Cart;
      };
    };
  }>({
    query: addToCartMutation,
    variables: {
      cartId,
      lines,
    },
    cache: "no-store",
  });

  return res.body.data.cartLinesAdd.cart;
}

export async function removeFromCart(
  cartId: string,
  lineIds: string[]
): Promise<Cart> {
  const res = await shopifyFetch<{
    data: {
      cartLinesRemove: {
        cart: Cart;
      };
    };
  }>({
    query: removeFromCartMutation,
    variables: {
      cartId,
      lineIds,
    },
    cache: "no-store",
  });

  return res.body.data.cartLinesRemove.cart;
}

export async function updateCart(
  cartId: string,
  lines: {
    id: string;
    merchandiseId: string;
    quantity: number;
  }[]
): Promise<Cart> {
  const res = await shopifyFetch<{
    data: {
      cartLinesUpdate: {
        cart: Cart;
      };
    };
  }>({
    query: editCartItemsMutation,
    variables: {
      cartId,
      lines,
    },
    cache: "no-store",
  });

  return res.body.data.cartLinesUpdate.cart;
}

export async function getCart(cartId: string): Promise<Cart | undefined> {
  const res = await shopifyFetch<{
    data: {
      cart: Cart;
    };
  }>({
    query: getCartQuery,
    variables: {
      cartId,
    },
    cache: "no-store",
  });

  return res.body.data.cart;
}
