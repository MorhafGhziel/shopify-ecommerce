import { Footer } from "@/components/navigation/footer";
import { Navbar } from "@/components/navigation/navbar";
import { CartProvider } from "@/components/ui/cart/cart-context";
import { WelcomeToast } from "@/components/ui/common/welcome-toast";
import { getCart } from "@/lib/shopify";
import { cookies } from "next/headers";
import { ReactNode } from "react";
import { Toaster } from "sonner";

export default async function SiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cartId")?.value;
  const cart = cartId ? getCart(cartId) : Promise.resolve(undefined);

  return (
    <CartProvider cartPromise={cart}>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <Toaster closeButton />
      <WelcomeToast />
    </CartProvider>
  );
}
