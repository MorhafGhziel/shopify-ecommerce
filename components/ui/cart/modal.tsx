"use client";

import { LoadingDots } from "@/components/ui/common/loading-dots";
import { Price } from "@/components/ui/common/price";
import { useCart } from "@/hooks/useCart";
import { DEFAULT_OPTION } from "@/lib/constants";
import { createUrl } from "@/lib/utils";
import { CartItem } from "@/types/shopify";
import { Dialog, Transition } from "@headlessui/react";
import { ShoppingCartIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { redirectToCheckout } from "./actions";
import { DeleteItemButton } from "./delete-item-button";
import { EditItemQuantityButton } from "./edit-item-quantity-button";

function CheckoutButton() {
  const { pending } = useFormStatus();
  const [isPending, startTransition] = useTransition();

  const handleCheckout = async (formData: FormData) => {
    const checkoutUrl = await redirectToCheckout();
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  };

  return (
    <button
      formAction={(formData) => {
        startTransition(async () => {
          await handleCheckout(formData);
        });
      }}
      className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white opacity-90 hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending || isPending}
    >
      {pending || isPending ? (
        <LoadingDots className="bg-white" />
      ) : (
        "Proceed to Checkout"
      )}
    </button>
  );
}

export function CartModal() {
  const { cart, updateCartItem, isLoading } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const quantityRef = useRef(0);
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  useEffect(() => {
    if (!isLoading && cart && cart.totalQuantity > quantityRef.current) {
      setIsOpen(true);
    }
    if (cart) {
      quantityRef.current = cart.totalQuantity;
    }
  }, [cart, isLoading]);

  if (isLoading || !cart) {
    return (
      <div className="relative flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white">
        <LoadingDots className="bg-black dark:bg-white" />
      </div>
    );
  }

  return (
    <>
      <button
        aria-label="Open cart"
        onClick={openCart}
        className="relative flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white"
      >
        <ShoppingCartIcon className="h-4" />
        {cart.totalQuantity > 0 && (
          <div className="absolute right-0 top-0 -mr-1 -mt-1 h-4 w-4 rounded-full bg-blue-600 text-[11px] font-medium text-white">
            {cart.totalQuantity}
          </div>
        )}
      </button>

      <Transition show={isOpen}>
        <Dialog onClose={closeCart} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="opacity-0 backdrop-blur-none"
            enterTo="opacity-100 backdrop-blur-[.5px]"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="opacity-100 backdrop-blur-[.5px]"
            leaveTo="opacity-0 backdrop-blur-none"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="fixed bottom-0 right-0 top-0 flex h-full w-full flex-col border-l border-neutral-200 bg-white p-6 text-black dark:border-neutral-700 dark:bg-black dark:text-white md:w-[390px]">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">My Cart</p>
                <button
                  aria-label="Close cart"
                  onClick={closeCart}
                  className="flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white"
                >
                  <XMarkIcon className="h-6" />
                </button>
              </div>

              {cart.lines.length === 0 ? (
                <div className="mt-20 flex w-full flex-col items-center justify-center overflow-hidden">
                  <ShoppingCartIcon className="h-16" />
                  <p className="mt-6 text-center text-2xl font-bold">
                    Your cart is empty.
                  </p>
                </div>
              ) : (
                <div className="flex h-full flex-col justify-between overflow-hidden">
                  <ul className="flex-grow overflow-auto py-4">
                    {cart.lines.map((item: CartItem) => {
                      const merchandiseUrl = createUrl(
                        `/product/${item.merchandise.product.handle}`,
                        new URLSearchParams({
                          variant: item.merchandise.id,
                        })
                      );

                      return (
                        <li
                          key={item.id}
                          className="flex w-full flex-col border-b border-neutral-300 dark:border-neutral-700"
                        >
                          <div className="relative flex w-full flex-row justify-between px-1 py-4">
                            <div className="absolute z-40 -mt-2 ml-[55px]">
                              <DeleteItemButton
                                item={item}
                                onDelete={() =>
                                  updateCartItem(item.merchandise.id, "delete")
                                }
                              />
                            </div>
                            <Link
                              href={merchandiseUrl}
                              onClick={closeCart}
                              className="z-30 flex flex-row space-x-4"
                            >
                              <div className="relative h-16 w-16 cursor-pointer overflow-hidden rounded-md border border-neutral-300 bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-900">
                                <Image
                                  className="h-full w-full object-cover"
                                  width={64}
                                  height={64}
                                  alt={
                                    item.merchandise.product.featuredImage
                                      ?.altText ||
                                    `${item.merchandise.product.title} - ${item.merchandise.title}`
                                  }
                                  src={
                                    item.merchandise.product.featuredImage
                                      ?.url || ""
                                  }
                                />
                              </div>
                              <div className="flex flex-1 flex-col text-base">
                                <span className="leading-tight">
                                  {item.merchandise.product.title}
                                </span>
                                {item.merchandise.title !== DEFAULT_OPTION ? (
                                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    {item.merchandise.title}
                                  </p>
                                ) : null}
                              </div>
                            </Link>
                            <div className="flex h-16 flex-col justify-between">
                              <Price
                                className="flex justify-end space-y-2 text-right text-sm"
                                amount={item.cost.totalAmount.amount}
                                currencyCode={
                                  item.cost.totalAmount.currencyCode
                                }
                              />
                              <div className="ml-auto flex h-9 flex-row items-center rounded-full border border-neutral-200 dark:border-neutral-700">
                                <EditItemQuantityButton
                                  item={item}
                                  type="minus"
                                  onClickAction={() =>
                                    updateCartItem(item.merchandise.id, "minus")
                                  }
                                />
                                <p className="w-6 text-center">
                                  <span className="w-full text-sm">
                                    {item.quantity}
                                  </span>
                                </p>
                                <EditItemQuantityButton
                                  item={item}
                                  type="plus"
                                  onClickAction={() =>
                                    updateCartItem(item.merchandise.id, "plus")
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="py-4">
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-3 dark:border-neutral-700">
                      <p className="text-sm">Taxes</p>
                      <Price
                        className="text-right text-sm"
                        amount={cart.cost.totalTaxAmount.amount}
                        currencyCode={cart.cost.totalTaxAmount.currencyCode}
                      />
                    </div>
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-3 dark:border-neutral-700">
                      <p className="text-sm">Shipping</p>
                      <p className="text-sm">Calculated at checkout</p>
                    </div>
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-3 dark:border-neutral-700">
                      <p className="text-sm">Total</p>
                      <Price
                        className="text-right text-sm"
                        amount={cart.cost.totalAmount.amount}
                        currencyCode={cart.cost.totalAmount.currencyCode}
                      />
                    </div>
                    <div>
                      <CheckoutButton />
                    </div>
                  </div>
                </div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}
