import { ProductContext } from "@/components/ui/product/product-context";
import { useContext } from "react";

export function useProduct() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProduct must be used within a ProductProvider");
  }
  return context;
}
