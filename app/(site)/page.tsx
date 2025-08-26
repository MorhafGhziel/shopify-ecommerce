import { Carousel } from "@/components/ui/carousel";
import { ThreeItemGrid } from "@/components/ui/grid/three-items";
import type { Metadata } from "next";

export const metadata: Metadata = {
  description:
    "Modern online shopping experience - Your premier destination for quality products.",
  openGraph: {
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <ThreeItemGrid />
      <Carousel />
    </>
  );
}
