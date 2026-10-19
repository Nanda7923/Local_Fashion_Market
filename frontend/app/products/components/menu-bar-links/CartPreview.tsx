"use client";

import Link from "next/link";
import {
  useGetCartQuery,
  useRemoveCartItemMutation,
} from "@/lib/features/product/cartApiSlice";

interface CartPreviewProps {
  isAuthenticated: boolean;
  onNavigate: () => void;
  onOpenAuth?: () => void;
}

export default function CartPreview({
  isAuthenticated,
  onNavigate,
  onOpenAuth,
}: CartPreviewProps) {
  const {
    data: cart,
    isLoading,
    isError,
  } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [removeItem, { isLoading: isRemoving }] = useRemoveCartItemMutation();

  const items = cart?.items ?? [];
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0,
  );

  return (
    <section
      aria-labelledby="menu-cart-heading"
      className="mx-auto w-full max-w-4xl px-6 py-8 sm:px-10 animate-luxury-fade-in"
    >
      <div className="mb-6 flex items-end justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <p className="mb-1 text-[10px] uppercase tracking-[0.3em] text-[#9d7952] font-medium">
            {isAuthenticated
              ? `Curated Selection (${totalCount} ${totalCount === 1 ? "piece" : "pieces"})`
              : "Shopping Bag"}
          </p>
          <h2
            id="menu-cart-heading"
            className="font-cormorant text-3xl tracking-wide text-[#263a31]"
          >
            Your Shopping Bag
          </h2>
        </div>
        {isAuthenticated && items.length > 0 && (
          <Link
            href="/cart"
            onClick={onNavigate}
            className="shrink-0 text-xs uppercase tracking-[0.18em] text-[#263a31] underline underline-offset-4 hover:text-[#9d7952] transition-colors"
          >
            View Shopping Bag
          </Link>
        )}
      </div>

      {!isAuthenticated ? (
        <div className="py-12 text-center max-w-md mx-auto">
          <p className="font-cormorant text-2xl text-stone-800">
            Sign in to view your bag
          </p>
          <p className="mt-3 text-xs leading-relaxed text-stone-500 font-light tracking-wide">
            Keep track of your selected pieces, synchronise your bag across
            devices, and checkout seamlessly.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            {onOpenAuth && (
              <button
                type="button"
                onClick={onOpenAuth}
                className="border border-[#263a31] bg-[#263a31] px-7 py-2.5 text-[11px] font-medium uppercase tracking-[0.22em] text-white hover:bg-transparent hover:text-[#263a31] transition-all cursor-pointer"
              >
                Sign In
              </button>
            )}
            <Link
              href="/products"
              onClick={onNavigate}
              className="border border-stone-300 px-6 py-2.5 text-[11px] font-medium uppercase tracking-[0.22em] text-stone-700 hover:border-[#263a31] hover:text-[#263a31] transition-all"
            >
              Explore Collections
            </Link>
          </div>
        </div>
      ) : isLoading ? (
        <div
          role="status"
          aria-busy="true"
          className="divide-y divide-stone-200 py-2"
        >
          <span className="sr-only">Loading your shopping bag…</span>
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 py-4 animate-luxury-fade-in"
            >
              <div className="h-20 w-16 shrink-0 rounded-xs bg-[#ebe6db]/60 skeleton-shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 rounded-xs bg-[#ebe6db]/60 skeleton-shimmer" />
                <div className="h-4 w-2/3 rounded-xs bg-[#ebe6db]/70 skeleton-shimmer" />
                <div className="h-3 w-1/4 rounded-xs bg-[#ebe6db]/50 skeleton-shimmer" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <p role="alert" className="py-8 text-sm text-rose-700">
          Your shopping bag could not be loaded at this time.
        </p>
      ) : items.length === 0 ? (
        <div className="py-12 text-center max-w-md mx-auto">
          <p className="font-cormorant text-2xl text-stone-700">
            Your shopping bag is empty
          </p>
          <p className="mt-2 text-xs tracking-wider text-stone-500 font-light">
            Discover new arrivals and timeless pieces curated for modern
            elegance.
          </p>
          <div className="mt-8">
            <Link
              href="/products"
              onClick={onNavigate}
              className="inline-block border border-[#263a31] bg-[#263a31] px-7 py-2.5 text-[11px] font-medium uppercase tracking-[0.25em] !text-white hover:bg-transparent hover:!text-black transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <div className="divide-y divide-stone-200 max-h-[48vh] overflow-y-auto pr-2">
            {items.slice(0, 4).map((item) => {
              const product = item.product;
              const brandName =
                typeof product?.brand === "object"
                  ? product?.brand?.name
                  : product?.brand;
              const thumbnail = product?.imageUrl?.[0] || "/placeholder.png";

              return (
                <article
                  key={item._id}
                  className="flex items-center gap-4 py-4 group"
                >
                  <Link
                    href={`/products/${product?._id}`}
                    onClick={onNavigate}
                    className="h-20 w-16 shrink-0 overflow-hidden bg-stone-100 rounded-sm"
                  >
                    <img
                      src={thumbnail}
                      alt={product?.title || "Product"}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    {brandName && (
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#9d7952]">
                        {brandName}
                      </p>
                    )}
                    <Link
                      href={`/products/${product?._id}`}
                      onClick={onNavigate}
                      className="line-clamp-1 font-cormorant text-lg leading-tight text-stone-900 hover:text-[#9d7952] transition-colors"
                    >
                      {product?.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs tracking-wide text-stone-500">
                      {item.size && (
                        <span>
                          Size:{" "}
                          <strong className="font-medium text-stone-700">
                            {item.size}
                          </strong>
                        </span>
                      )}
                      {item.color && (
                        <span>
                          Color:{" "}
                          <strong className="font-medium text-stone-700">
                            {item.color}
                          </strong>
                        </span>
                      )}
                      <span>
                        Qty:{" "}
                        <strong className="font-medium text-stone-700">
                          {item.quantity}
                        </strong>
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-medium tracking-wide text-[#263a31]">
                      {((product?.price || 0) * item.quantity).toLocaleString()}{" "}
                      MMK
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isRemoving}
                    onClick={() => removeItem(item._id)}
                    aria-label={`Remove ${product?.title} from cart`}
                    className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-stone-400 underline underline-offset-4 hover:text-rose-600 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </article>
              );
            })}
          </div>

          {items.length > 4 && (
            <p className="mt-2 text-[11px] text-stone-400 text-center tracking-wider font-light">
              + {items.length - 4} more{" "}
              {items.length - 4 === 1 ? "item" : "items"} in your shopping bag
            </p>
          )}

          <div className="mt-6 border-t border-stone-200 pt-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-xs uppercase tracking-[0.2em] text-stone-500 font-light">
                Subtotal
              </span>
              <span className="font-cormorant text-2xl font-medium text-[#263a31]">
                {subtotal.toLocaleString()} MMK
              </span>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <Link
                href="/cart"
                onClick={onNavigate}
                className="w-full sm:flex-1 text-center bg-[#263a31] border border-[#263a31] py-3 text-xs uppercase tracking-[0.22em] font-medium text-white hover:bg-transparent hover:text-[#263a31] transition-all"
              >
                View Shopping Bag
              </Link>
              <Link
                href="/products"
                onClick={onNavigate}
                className="w-full sm:flex-1 text-center border border-stone-300 py-3 text-xs uppercase tracking-[0.22em] font-medium text-stone-700 hover:border-[#263a31] hover:text-[#263a31] transition-all"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
