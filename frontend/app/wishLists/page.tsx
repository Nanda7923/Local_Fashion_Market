"use client";

import { useState } from "react";
import Link from "next/link";
import NavBar from "@/app/products/components/nav-bar/NavBar";
import ProductCard from "@/app/products/components/ProductCard";
import ProductCardSkeleton from "@/app/products/components/ProductCardSkeleton";
import { useAuth } from "@/app/products/hooks/useAuth";
import {
    useGetWishlistQuery,
    useRemoveWishlistProductMutation,
    useClearWishlistMutation,
} from "@/lib/features/product/wishlistApiSlice";

export default function WishlistPage() {
    const { isAuthenticated } = useAuth();
    const { data: wishlist, isLoading, isError } = useGetWishlistQuery(undefined, { skip: !isAuthenticated });
    const [removeProduct, { isLoading: isRemoving }] = useRemoveWishlistProductMutation();
    const [clearWishlist, { isLoading: isClearing }] = useClearWishlistMutation();
    const [actionError, setActionError] = useState<string | null>(null);

    const products = wishlist?.products ?? [];

    const handleClearWishlist = async () => {
        if (typeof window !== "undefined") {
            const confirmed = window.confirm("Are you sure you want to clear all pieces from your wishlist?");
            if (!confirmed) return;
        }
        setActionError(null);
        try {
            await clearWishlist().unwrap();
        } catch (err: any) {
            setActionError(err?.data?.message || err?.message || "Failed to clear wishlist. Please try again.");
        }
    };

    const handleRemoveProduct = async (productId: string) => {
        setActionError(null);
        try {
            await removeProduct(productId).unwrap();
        } catch (err: any) {
            setActionError(err?.data?.message || err?.message || "Failed to remove item from wishlist.");
        }
    };

    return (
        <>
            <NavBar />
            <main className="mx-auto min-h-[70vh] w-[92%] max-w-7xl py-12 md:py-20">
                <header className="mb-10 border-b border-stone-200 pb-6 md:mb-14">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div>
                            <p className="mb-3 text-[10px] uppercase tracking-[0.32em] text-stone-500">Your considered collection</p>
                            <h1 className="font-cormorant text-4xl tracking-wide text-stone-900 md:text-5xl">Wishlist</h1>
                            {isAuthenticated && !isLoading && !isError && (
                                <p className="mt-3 text-sm text-stone-500">
                                    {products.length} {products.length === 1 ? "piece" : "pieces"} saved
                                </p>
                            )}
                        </div>
                        {isAuthenticated && !isLoading && !isError && products.length > 0 && (
                            <button
                                type="button"
                                onClick={handleClearWishlist}
                                disabled={isClearing}
                                className="self-start sm:self-auto text-xs uppercase tracking-[0.16em] text-stone-500 underline underline-offset-4 transition-colors hover:text-stone-900 disabled:opacity-50 cursor-pointer"
                            >
                                {isClearing ? "Clearing..." : "Clear wishlist"}
                            </button>
                        )}
                    </div>
                    {actionError && (
                        <div role="alert" className="mt-4 border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                            {actionError}
                        </div>
                    )}
                </header>

                {!isAuthenticated ? (
                    <section className="border-y border-stone-200 py-16 text-center">
                        <p className="mb-3 font-cormorant text-2xl">Your collection is personal.</p>
                        <p className="text-sm text-stone-500">Sign in to view your saved pieces.</p>
                    </section>
                ) : isLoading ? (
                    <div
                        role="status"
                        aria-busy="true"
                        aria-label="Loading your wishlist pieces"
                        className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:grid-cols-5"
                    >
                        <span className="sr-only">Loading your wishlist pieces…</span>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                ) : isError ? (
                    <p role="alert" className="py-16 text-center text-sm text-red-700">
                        Your wishlist could not be loaded. Please try again.
                    </p>
                ) : products.length === 0 ? (
                    <section className="border-y border-stone-200 py-16 text-center">
                        <p className="mb-3 font-cormorant text-2xl">Nothing saved just yet.</p>
                        <p className="mb-7 text-sm text-stone-500">Keep exploring and save the pieces you love.</p>
                        <Link
                            href="/products"
                            className="inline-block border border-stone-800 px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-stone-900 transition-colors hover:bg-stone-900 hover:text-white"
                        >
                            Continue shopping
                        </Link>
                    </section>
                ) : (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:grid-cols-5">
                        {products.map((product) => (
                            <article key={product._id} className="min-w-0">
                                <ProductCard product={product} showFavorite={false} />
                                <button
                                    type="button"
                                    disabled={isRemoving}
                                    onClick={() => product._id && handleRemoveProduct(product._id)}
                                    className="mt-2 px-1 text-[10px] uppercase tracking-[0.15em] text-stone-500 underline underline-offset-4 transition-colors hover:text-stone-900 disabled:opacity-50 cursor-pointer"
                                >
                                    Remove from wishlist
                                </button>
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}
