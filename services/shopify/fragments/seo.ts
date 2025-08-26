const seoFragment = /* GraphQL */ `
  fragment seo on HasMetafields {
    seo {
      title
      description
    }
  }
`;

export default seoFragment;
