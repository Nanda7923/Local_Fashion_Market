"use client";

import { useState } from "react";
import Link from "next/link";
import NavBar from "@/app/products/components/nav-bar/NavBar";
import { useAuth } from "@/app/products/hooks/useAuth";
import {
    useClearCartMutation,
    useGetCartQuery,
    useRemoveCartItemMutation,
    useUpdateCartItemQuantityMutation,
    type CartItem,
    type CartProduct,
} from "@/lib/features/product/cartApiSlice";
import CheckoutModal from "@/app/cart/CheckoutModal";

export default function CartPage() {
    const { isAuthenticated, token } = useAuth();
    const { data: cart, isLoading, isError } = useGetCartQuery(undefined, {
        skip: !isAuthenticated,
    });
    const [updateQuantity] = useUpdateCartItemQuantityMutation();
    const [removeItem, { isLoading: isRemoving }] = useRemoveCartItemMutation();
    const [clearCart, { isLoading: isClearing }] = useClearCartMutation();
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [cartError, setCartError] = useState<string | null>(null);

    const items = cart?.items ?? [];
    const validItems = items.filter(
        (item): item is CartItem & { product: CartProduct } => Boolean(item.product)
    );
    const invalidItems = items.filter((item) => !item.product);

    const subtotal = validItems.reduce(
        (total, item) => total + (item.product?.price || 0) * item.quantity,
        0,
    );

    const handleClearCart = async () => {
        if (typeof window !== "undefined") {
            const confirmed = window.confirm("Are you sure you want to clear your shopping cart?");
            if (!confirmed) return;
        }
        setCartError(null);
        try {
            await clearCart().unwrap();
        } catch (err: any) {
            setCartError(err?.data?.message || err?.message || "Failed to clear cart. Please try again.");
        }
    };

    const handleRemoveItem = async (itemId: string) => {
        setCartError(null);
        try {
            await removeItem(itemId).unwrap();
        } catch (err: any) {
            setCartError(err?.data?.message || err?.message || "Failed to remove item. Please try again.");
        }
    };

    const handleUpdateQuantity = async (itemId: string, quantity: number) => {
        setCartError(null);
        try {
            await updateQuantity({ itemId, quantity }).unwrap();
        } catch (err: any) {
            setCartError(err?.data?.message || err?.message || "Failed to update quantity. Please try again.");
        }
    };

    return (
        <>
            <NavBar />
            <main className="mx-auto min-h-[70vh] w-[92%] max-w-6xl py-10 md:py-16">
                <div className="mb-8 flex items-center justify-between gap-4">
                    <h1 className="font-cormorant text-4xl tracking-wide md:text-5xl">Shopping Cart</h1>
                    {items.length > 0 && (
                        <button
                            onClick={handleClearCart}
                            disabled={isClearing}
                            className="text-sm underline underline-offset-4 transition-colors hover:text-stone-900 disabled:opacity-50 cursor-pointer"
                        >
                            {isClearing ? "Clearing..." : "Clear cart"}
                        </button>
                    )}
                </div>

                {cartError && (
                    <div role="alert" className="mb-6 border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800">
                        {cartError}
                    </div>
                )}

                {!isAuthenticated ? (
                    <section className="border-y border-gray-200 py-12 text-center">
                        <p className="mb-3 text-lg">Log in to view your shopping cart.</p>
                        <p className="text-sm text-gray-500">Use the account button in the navigation bar to sign in.</p>
                    </section>
                ) : isLoading ? (
                    <p className="py-12 text-center text-gray-500">Loading your cart...</p>
                ) : isError ? (
                    <p role="alert" className="py-12 text-center text-red-700">Your cart could not be loaded. Please try again.</p>
                ) : items.length === 0 ? (
                    <section className="border-y border-gray-200 py-12 text-center">
                        <p className="mb-5 text-lg">Your cart is empty.</p>
                        <Link href="/products" className="inline-block bg-gray-900 px-6 py-3 text-sm uppercase tracking-widest !text-white hover:bg-gray-700">
                            Continue shopping
                        </Link>
                    </section>
                ) : (
                    <div>
                        {invalidItems.length > 0 && (
                            <div role="status" className="mb-6 border-l-2 border-amber-600 bg-amber-50/70 p-4 text-xs text-stone-700">
                                <p className="font-medium text-amber-900">Unavailable items detected</p>
                                <p className="mt-1 leading-relaxed text-stone-600">
                                    {invalidItems.length === 1
                                        ? "One item in your cart is no longer available in our collection and has been excluded from the order subtotal. You can remove it below."
                                        : `${invalidItems.length} items in your cart are no longer available in our collection and have been excluded from the order subtotal. You can remove them below.`}
                                </p>
                            </div>
                        )}

                        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
                            <div className="divide-y divide-gray-200 border-y border-gray-200">
                                {items.map((item) => {
                                    if (!item.product) {
                                        return (
                                            <article
                                                key={item._id}
                                                className="my-3 flex gap-4 border border-stone-200 bg-stone-50/70 p-4 sm:gap-6"
                                            >
                                                <div className="flex h-32 w-24 shrink-0 items-center justify-center bg-stone-100 text-stone-400 sm:h-40 sm:w-32">
                                                    <svg
                                                        className="h-8 w-8 text-stone-400"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        aria-hidden="true"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={1.5}
                                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                                        />
                                                    </svg>
                                                </div>
                                                <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 sm:flex-row">
                                                    <div>
                                                        <span className="inline-block border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-800">
                                                            Item Unavailable
                                                        </span>
                                                        <h2 className="mt-2 font-cormorant text-2xl text-stone-800">
                                                            Product No Longer Available
                                                        </h2>
                                                        <p className="mt-1 text-xs text-stone-500">
                                                            This piece has been removed from the catalog and cannot be purchased.
                                                        </p>
                                                        {(item.size || item.color) && (
                                                            <p className="mt-2 text-sm text-stone-600">
                                                                {item.size ? `Size: ${item.size}` : ""}
                                                                {item.size && item.color ? " · " : ""}
                                                                {item.color ? `Color: ${item.color}` : ""}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-end justify-between gap-4 sm:flex-col sm:items-end">
                                                        <span className="text-xs text-stone-400">Qty: {item.quantity}</span>
                                                        <button
                                                            type="button"
                                                            disabled={isRemoving}
                                                            onClick={() => handleRemoveItem(item._id)}
                                                            className="text-sm text-rose-700 underline underline-offset-4 hover:text-rose-900 disabled:opacity-50 cursor-pointer"
                                                        >
                                                            Remove item
                                                        </button>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    }

                                    const product = item.product;
                                    const brand = typeof product.brand === "string"
                                        ? product.brand
                                        : product.brand?.name;
                                    const thumbnail = product.imageUrl?.[0] || "/placeholder.png";
                                    const title = product.title || "Product";
                                    const price = typeof product.price === "number" ? product.price : 0;

                                    return (
                                        <article key={item._id} className="flex gap-4 py-6 sm:gap-6">
                                            <img
                                                src={thumbnail}
                                                alt={title}
                                                className="h-32 w-24 shrink-0 bg-gray-100 object-cover sm:h-40 sm:w-32"
                                            />
                                            <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 sm:flex-row">
                                                <div>
                                                    <h2 className="font-cormorant text-2xl">{title}</h2>
                                                    {brand && <p className="mt-1 text-sm text-gray-500">{brand}</p>}
                                                    <p className="mt-2 text-sm text-gray-600">Size: {item.size} · Color: {item.color}</p>
                                                    <p className="mt-2 text-sm">{price.toLocaleString()} MMK</p>
                                                </div>
                                                <div className="flex items-end justify-between gap-4 sm:flex-col sm:items-end">
                                                    <div className="flex items-center border border-gray-300">
                                                        <button
                                                            aria-label={`Decrease quantity of ${title}`}
                                                            disabled={item.quantity <= 1}
                                                            onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                                                            className="px-3 py-2 disabled:opacity-40 cursor-pointer"
                                                        >−</button>
                                                        <span className="min-w-8 text-center text-sm">{item.quantity}</span>
                                                        <button
                                                            aria-label={`Increase quantity of ${title}`}
                                                            onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                                                            className="px-3 py-2 cursor-pointer"
                                                        >+</button>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        disabled={isRemoving}
                                                        onClick={() => handleRemoveItem(item._id)}
                                                        className="text-sm text-gray-500 underline underline-offset-4 hover:text-gray-900 disabled:opacity-50 cursor-pointer"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                            <aside className="h-fit bg-gray-50 p-6">
                                <h2 className="mb-5 font-cormorant text-2xl">Order summary</h2>
                                <div className="flex justify-between border-b border-gray-200 pb-4 text-sm">
                                    <span>Subtotal</span>
                                    <span>{subtotal.toLocaleString()} MMK</span>
                                </div>
                                <p className="py-4 text-xs leading-5 text-gray-500">Shipping and any applicable fees are calculated at checkout.</p>
                                <button
                                    onClick={() => setIsCheckoutOpen(true)}
                                    disabled={validItems.length === 0}
                                    className="w-full border border-black bg-black py-4 text-xs uppercase tracking-[0.2em] text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 cursor-pointer"
                                >
                                    Checkout
                                </button>
                                {items.length > 0 && validItems.length === 0 && (
                                    <p className="mt-2 text-center text-xs text-amber-800">
                                        Remove unavailable items or clear cart to proceed.
                                    </p>
                                )}
                                <Link href="/products" className="mt-4 block text-center text-sm underline underline-offset-4">
                                    Continue shopping
                                </Link>
                            </aside>
                        </div>
                    </div>
                )}
            </main>

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                items={validItems}
                subtotal={subtotal}
                token={token}
                clearCart={clearCart}
            />
        </>
    );
}
