import imageFragment from "./image";

const productFragment = /* GraphQL */ `
  fragment product on Product {
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
      nodes {
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
    featuredImage {
      ...image
    }
    images(first: 20) {
      nodes {
        ...image
      }
    }
    metafields(first: 10) {
      nodes {
        key
        value
      }
    }
    tags
    updatedAt
  }
  ${imageFragment}
`;

export default productFragment;
