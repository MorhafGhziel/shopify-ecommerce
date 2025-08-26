"use server";

import { SHOPIFY_GRAPHQL_API_ENDPOINT, TAGS } from "@/lib/constants";
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
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const domain = process.env.SHOPIFY_STORE_DOMAIN
  ? ensureStartsWith(process.env.SHOPIFY_STORE_DOMAIN, "https://")
  : "";
const endpoint = `${domain}${SHOPIFY_GRAPHQL_API_ENDPOINT}`;
const key = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

type ExtractVariables<T> = T extends { variables: object }
  ? T["variables"]
  : never;

async function shopifyFetch<T>({
  cache = "force-cache",
  headers = {},
  query,
  tags,
  variables,
}: {
  cache?: RequestCache;
  headers?: HeadersInit;
  query: string;
  tags?: string[];
  variables?: any;
}): Promise<{ status: number; body: T } | never> {
  try {
    const result = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": key,
        ...headers,
      },
      body: JSON.stringify({
        ...(query && { query }),
        ...(variables && { variables }),
      }),
      cache,
      ...(tags && { next: { tags } }),
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

const removeEdgesAndNodes = (array: Connection<any> | any[]) => {
  if (Array.isArray(array)) {
    return array;
  }
  return array.edges.map((edge) => edge.node);
};

const reshapeCart = (cart: any): Cart => {
  if (!cart.cost?.totalTaxAmount) {
    cart.cost.totalTaxAmount = {
      amount: "0.0",
      currencyCode: "USD",
    };
  }

  return {
    ...cart,
    lines: removeEdgesAndNodes(cart.lines),
  };
};

export async function createCart(): Promise<Cart> {
  const res = await shopifyFetch<{
    data: {
      cartCreate: {
        cart: Cart;
      };
    };
  }>({
    query: `
      mutation cartCreate {
        cartCreate {
          cart {
            id
            checkoutUrl
            cost {
              totalAmount {
                amount
                currencyCode
              }
              subtotalAmount {
                amount
                currencyCode
              }
              totalTaxAmount {
                amount
                currencyCode
              }
            }
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  cost {
                    totalAmount {
                      amount
                      currencyCode
                    }
                  }
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      selectedOptions {
                        name
                        value
                      }
                      product {
                        id
                        handle
                        title
                        featuredImage {
                          url
                          altText
                          width
                          height
                        }
                      }
                    }
                  }
                }
              }
            }
            totalQuantity
          }
        }
      }
    `,
    cache: "no-store",
  });

  return reshapeCart(res.body.data.cartCreate.cart);
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
    query: `
      mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
            cost {
              totalAmount {
                amount
                currencyCode
              }
              subtotalAmount {
                amount
                currencyCode
              }
              totalTaxAmount {
                amount
                currencyCode
              }
            }
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  cost {
                    totalAmount {
                      amount
                      currencyCode
                    }
                  }
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      selectedOptions {
                        name
                        value
                      }
                      product {
                        id
                        handle
                        title
                        featuredImage {
                          url
                          altText
                          width
                          height
                        }
                      }
                    }
                  }
                }
              }
            }
            totalQuantity
          }
        }
      }
    `,
    variables: {
      cartId,
      lines,
    },
    cache: "no-store",
  });

  return reshapeCart(res.body.data.cartLinesAdd.cart);
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
    query: `
      mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            id
            checkoutUrl
            cost {
              totalAmount {
                amount
                currencyCode
              }
              subtotalAmount {
                amount
                currencyCode
              }
              totalTaxAmount {
                amount
                currencyCode
              }
            }
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  cost {
                    totalAmount {
                      amount
                      currencyCode
                    }
                  }
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      selectedOptions {
                        name
                        value
                      }
                      product {
                        id
                        handle
                        title
                        featuredImage {
                          url
                          altText
                          width
                          height
                        }
                      }
                    }
                  }
                }
              }
            }
            totalQuantity
          }
        }
      }
    `,
    variables: {
      cartId,
      lineIds,
    },
    cache: "no-store",
  });

  return reshapeCart(res.body.data.cartLinesRemove.cart);
}

export async function updateCart(
  cartId: string,
  lines: { id: string; merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const res = await shopifyFetch<{
    data: {
      cartLinesUpdate: {
        cart: Cart;
      };
    };
  }>({
    query: `
      mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
            cost {
              totalAmount {
                amount
                currencyCode
              }
              subtotalAmount {
                amount
                currencyCode
              }
              totalTaxAmount {
                amount
                currencyCode
              }
            }
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  cost {
                    totalAmount {
                      amount
                      currencyCode
                    }
                  }
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      selectedOptions {
                        name
                        value
                      }
                      product {
                        id
                        handle
                        title
                        featuredImage {
                          url
                          altText
                          width
                          height
                        }
                      }
                    }
                  }
                }
              }
            }
            totalQuantity
          }
        }
      }
    `,
    variables: {
      cartId,
      lines,
    },
    cache: "no-store",
  });

  return reshapeCart(res.body.data.cartLinesUpdate.cart);
}

export async function getCart(cartId: string): Promise<Cart | undefined> {
  const res = await shopifyFetch<{
    data: {
      cart: Cart;
    };
  }>({
    query: `
      query getCart($cartId: ID!) {
        cart(id: $cartId) {
          id
          checkoutUrl
          cost {
            totalAmount {
              amount
              currencyCode
            }
            subtotalAmount {
              amount
              currencyCode
            }
            totalTaxAmount {
              amount
              currencyCode
            }
          }
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                cost {
                  totalAmount {
                    amount
                    currencyCode
                  }
                }
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    selectedOptions {
                      name
                      value
                    }
                    product {
                      id
                      handle
                      title
                      featuredImage {
                        url
                        altText
                        width
                        height
                      }
                    }
                  }
                }
              }
            }
          }
          totalQuantity
        }
      }
    `,
    variables: { cartId },
    cache: "no-store",
  });

  return reshapeCart(res.body.data.cart);
}

export async function getCollection(
  handle: string
): Promise<Collection | undefined> {
  const res = await shopifyFetch<{
    data: {
      collection: Collection;
    };
  }>({
    query: `
      query getCollection($handle: String!) {
        collection(handle: $handle) {
          id
          handle
          title
          description
          image {
            url
            altText
            width
            height
          }
        }
      }
    `,
    variables: { handle },
  });

  return res.body.data.collection;
}

export async function getCollections(): Promise<Collection[]> {
  const res = await shopifyFetch<{
    data: {
      collections: Connection<Collection>;
    };
  }>({
    query: `
      query getCollections {
        collections(first: 100) {
          edges {
            node {
              id
              handle
              title
              description
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    `,
  });

  return removeEdgesAndNodes(res.body.data.collections);
}

export async function getMenu(handle: string): Promise<Menu[]> {
  const res = await shopifyFetch<{
    data: {
      menu: {
        items: Menu[];
      };
    };
  }>({
    query: `
      query getMenu($handle: String!) {
        menu(handle: $handle) {
          items {
            title
            url
          }
        }
      }
    `,
    variables: { handle },
  });

  return res.body.data.menu.items;
}

export async function getPage(handle: string): Promise<Page> {
  const res = await shopifyFetch<{
    data: {
      page: Page;
    };
  }>({
    query: `
      query getPage($handle: String!) {
        page(handle: $handle) {
          id
          title
          handle
          body
          bodySummary
        }
      }
    `,
    variables: { handle },
  });

  return res.body.data.page;
}

export async function getPages(): Promise<Page[]> {
  const res = await shopifyFetch<{
    data: {
      pages: Connection<Page>;
    };
  }>({
    query: `
      query getPages {
        pages(first: 100) {
          edges {
            node {
              id
              title
              handle
              body
              bodySummary
              seo {
                title
                description
              }
              createdAt
              updatedAt
            }
          }
        }
      }
    `,
  });

  return removeEdgesAndNodes(res.body.data.pages);
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  const res = await shopifyFetch<{
    data: {
      product: Product;
    };
  }>({
    query: `
      query getProduct($handle: String!) {
        product(handle: $handle) {
          id
          handle
          availableForSale
          title
          description
          descriptionHtml
          options {
            id
            name
            values
          }
          priceRange {
            maxVariantPrice {
              amount
              currencyCode
            }
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 250) {
            edges {
              node {
                id
                title
                availableForSale
                selectedOptions {
                  name
                  value
                }
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
          featuredImage {
            url
            altText
            width
            height
          }
          images(first: 20) {
            edges {
              node {
                url
                altText
                width
                height
              }
            }
          }
          tags
          updatedAt
        }
      }
    `,
    variables: { handle },
  });

  return {
    ...res.body.data.product,
    variants: removeEdgesAndNodes(res.body.data.product.variants),
    images: removeEdgesAndNodes(res.body.data.product.images),
  };
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
    cache: "no-store",
    tags: [TAGS.products],
    query: `
      query getProducts(
        $sortKey: ProductSortKeys
        $reverse: Boolean
        $query: String
      ) {
        products(
          sortKey: $sortKey
          reverse: $reverse
          query: $query
          first: 100
        ) {
          edges {
            node {
              id
              handle
              availableForSale
              title
              description
              descriptionHtml
              options {
                id
                name
                values
              }
              priceRange {
                maxVariantPrice {
                  amount
                  currencyCode
                }
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              variants(first: 250) {
                edges {
                  node {
                    id
                    title
                    availableForSale
                    selectedOptions {
                      name
                      value
                    }
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
              featuredImage {
                url
                altText
                width
                height
              }
              images(first: 20) {
                edges {
                  node {
                    url
                    altText
                    width
                    height
                  }
                }
              }
              tags
              updatedAt
            }
          }
        }
      }
    `,
    variables: {
      sortKey,
      reverse,
      query,
    },
  });

  const products = removeEdgesAndNodes(res.body.data.products);
  return products.map((product) => ({
    ...product,
    variants: removeEdgesAndNodes(product.variants),
    images: removeEdgesAndNodes(product.images),
  }));
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
    query: `
      query getCollectionProducts(
        $handle: String!
        $sortKey: ProductCollectionSortKeys
        $reverse: Boolean
      ) {
        collection(handle: $handle) {
          products(sortKey: $sortKey, reverse: $reverse, first: 100) {
            edges {
              node {
                id
                handle
                availableForSale
                title
                description
                descriptionHtml
                options {
                  id
                  name
                  values
                }
                priceRange {
                  maxVariantPrice {
                    amount
                    currencyCode
                  }
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                variants(first: 250) {
                  edges {
                    node {
                      id
                      title
                      availableForSale
                      selectedOptions {
                        name
                        value
                      }
                      price {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
                featuredImage {
                  url
                  altText
                  width
                  height
                }
                images(first: 20) {
                  edges {
                    node {
                      url
                      altText
                      width
                      height
                    }
                  }
                }
                tags
                updatedAt
              }
            }
          }
        }
      }
    `,
    variables: {
      handle: collection,
      sortKey,
      reverse,
    },
  });

  const products = removeEdgesAndNodes(res.body.data.collection.products);
  return products.map((product) => ({
    ...product,
    variants: removeEdgesAndNodes(product.variants),
    images: removeEdgesAndNodes(product.images),
  }));
}

export async function getProductRecommendations(
  productId: string
): Promise<Product[]> {
  const res = await shopifyFetch<{
    data: {
      productRecommendations: Product[];
    };
  }>({
    query: `
      query getProductRecommendations($productId: ID!) {
        productRecommendations(productId: $productId) {
          id
          handle
          availableForSale
          title
          description
          descriptionHtml
          options {
            id
            name
            values
          }
          priceRange {
            maxVariantPrice {
              amount
              currencyCode
            }
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 250) {
            edges {
              node {
                id
                title
                availableForSale
                selectedOptions {
                  name
                  value
                }
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
          featuredImage {
            url
            altText
            width
            height
                }
          images(first: 20) {
            edges {
              node {
                url
                altText
                width
                height
              }
            }
          }
          tags
          updatedAt
        }
      }
    `,
    variables: {
      productId,
    },
  });

  const products = res.body.data.productRecommendations;
  return products.map((product) => ({
    ...product,
    variants: removeEdgesAndNodes(product.variants),
    images: removeEdgesAndNodes(product.images),
  }));
}

// This is called from `app/api/revalidate.ts` so providers can control revalidation logic.
export async function revalidate(req: NextRequest): Promise<NextResponse> {
  // We always need to respond with a 200 status code to Shopify,
  // otherwise it will continue to retry the request.
  const collectionWebhooks = [
    "collections/create",
    "collections/delete",
    "collections/update",
  ];
  const productWebhooks = [
    "products/create",
    "products/delete",
    "products/update",
  ];
  const topic = (await headers()).get("x-shopify-topic") || "unknown";
  const secret = req.nextUrl.searchParams.get("secret");
  const isCollectionUpdate = collectionWebhooks.includes(topic);
  const isProductUpdate = productWebhooks.includes(topic);

  if (!secret || secret !== process.env.SHOPIFY_REVALIDATION_SECRET) {
    console.error("Invalid revalidation secret.");
    return NextResponse.json({ status: 401 });
  }

  if (!isCollectionUpdate && !isProductUpdate) {
    // We don't need to revalidate anything for any other topics.
    return NextResponse.json({ status: 200 });
  }

  if (isCollectionUpdate) {
    revalidateTag(TAGS.collections);
  }

  if (isProductUpdate) {
    revalidateTag(TAGS.products);
  }

  return NextResponse.json({ status: 200, revalidated: true, now: Date.now() });
}
