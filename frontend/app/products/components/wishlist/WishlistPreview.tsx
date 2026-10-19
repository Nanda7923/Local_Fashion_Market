"use client";

import Link from "next/link";
import { useGetWishlistQuery, useRemoveWishlistProductMutation } from "@/lib/features/product/wishlistApiSlice";
import {useRouter} from "next/navigation";

export default function WishlistPreview({ isAuthenticated, onNavigate }: { isAuthenticated: boolean; onNavigate: () => void }) {
    const { data: wishlist, isLoading, isError } = useGetWishlistQuery(undefined, { skip: !isAuthenticated });
    console.log("wishlist", wishlist);
    const [removeProduct, { isLoading: isRemoving }] = useRemoveWishlistProductMutation();
    const products = wishlist?.products ?? [];
    const router = useRouter();

    const wishListBtnHandler = () => {
        router.push('/wishLists');
    }

    return <section className="mx-auto w-full max-w-4xl px-6 py-8 sm:px-10" aria-labelledby="menu-wishlist-heading">
        <div className="mb-6 flex items-end justify-between gap-4 border-b border-stone-200 pb-4">
            <div><p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-stone-500">Saved selection</p><h2 id="menu-wishlist-heading" className="font-cormorant text-3xl tracking-wide">Your wishlist</h2></div>
            <button onClick={wishListBtnHandler} className="shrink-0 text-xs uppercase tracking-[0.16em] underline underline-offset-4">View wishlist</button>
        </div>
        {!isAuthenticated ? <p className="py-6 text-sm text-stone-600">Sign in to see your saved pieces.</p>
            : isLoading ? (
                <div role="status" aria-busy="true" className="divide-y divide-stone-200 py-2">
                    <span className="sr-only">Loading your wishlist…</span>
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 py-4 animate-luxury-fade-in">
                            <div className="h-20 w-16 shrink-0 rounded-xs bg-[#ebe6db]/60 skeleton-shimmer" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-2/3 rounded-xs bg-[#ebe6db]/70 skeleton-shimmer" />
                                <div className="h-3 w-1/4 rounded-xs bg-[#ebe6db]/50 skeleton-shimmer" />
                            </div>
                        </div>
                    ))}
                </div>
            )
                : isError ? <p role="alert" className="py-6 text-sm text-red-700">Your wishlist could not be loaded.</p>
                    : products.length === 0 ? <p className="py-6 text-sm text-stone-600">Your wishlist is waiting for its first piece.</p>
                        : <div className="divide-y divide-stone-200">{products.slice(0, 4).map((product) => <article key={product._id} className="flex items-center gap-4 py-4">
                            <Link href={`/products/${product._id}`} onClick={onNavigate} className="h-20 w-16 shrink-0 overflow-hidden bg-stone-100"><img src={product.imageUrl?.[0] || "/placeholder.png"} alt={product.title} className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]" /></Link>
                            <div className="min-w-0 flex-1"><Link href={`/products/${product._id}`} onClick={onNavigate} className="line-clamp-2 font-cormorant text-lg leading-tight text-stone-900">{product.title}</Link><p className="mt-1 text-xs tracking-wide text-stone-600">{product.price.toLocaleString()} MMK</p></div>
                            <button type="button" disabled={isRemoving} onClick={() => product._id && removeProduct(product._id)} aria-label={`Remove ${product.title} from wishlist`} className="shrink-0 text-[10px] uppercase tracking-[0.12em] text-stone-500 underline underline-offset-4 hover:text-stone-900 disabled:opacity-50">Remove</button>
                        </article>)}</div>}
    </section>;
}
