"use client";
import type { ProductListItem } from "@/lib/features/product/types";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import WishlistButton from "@/app/products/components/wishlist/WishlistButton";

interface ProductProps {
    product : ProductListItem;
    showFavorite?: boolean;
}

export default function ProductCard({product, showFavorite = true}:ProductProps) {
    const hasMultipleImages = Boolean(
        product.imageUrl?.[1] && product.imageUrl[1] !== product.imageUrl[0]
    );

    return (
        <article className="group relative flex w-full min-w-0 max-w-[340px] snap-start shrink-0 flex-col">
            <Link
                href={`/products/${product._id}`}
                aria-label={`View ${product.title}`}
                className="relative block overflow-hidden focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#263a31]"
            >
                <div className="relative h-[300px] w-full shrink-0 overflow-hidden bg-stone-100 md:h-[380px]">
                    {product.imageUrl?.[0] && (
                        <img
                            src={product.imageUrl[0]}
                            alt={product.title}
                            className={`absolute inset-0 h-full w-full object-cover transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none ${
                                hasMultipleImages
                                    ? "group-hover:scale-[1.035] group-hover:opacity-0"
                                    : "group-hover:scale-[1.035]"
                            }`}
                        />
                    )}
                    {hasMultipleImages && product.imageUrl?.[1] && (
                        <img
                            src={product.imageUrl[1]}
                            alt=""
                            aria-hidden="true"
                            className="absolute inset-0 h-full w-full scale-[1.035] object-cover opacity-0 transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-100 group-hover:opacity-100 motion-reduce:transform-none"
                        />
                    )}
                </div>
            </Link>

            <div className="flex flex-1 flex-col p-1">
                {product.brand && typeof product.brand === "object" && product.brand.name && (
                    <Typography className="!px-1 !pt-2 !text-[10px] uppercase !tracking-[0.13em] !text-stone-500">
                        {product.brand.name}
                    </Typography>
                )}

                <Link
                    href={`/products/${product._id}`}
                    className="focus-visible:outline-none focus-visible:underline"
                >
                    <Typography className="!text-[12px] md:!text-[14px] uppercase p-1 line-clamp-2 min-h-[40px] md:min-h-[48px] flex items-center !leading-tight text-gray-900 transition-colors duration-300 group-hover:text-[#9d7952]">
                        {product.title}
                    </Typography>
                </Link>

                <div className="mt-auto flex items-center justify-between">
                    <Typography className="!font-semibold !text-sm md:text-lg">
                        <span className="text-xs font-light text-gray-800 px-1 md:text-sm">
                            MMK
                        </span>
                        {product.price}
                    </Typography>

                    {showFavorite && product._id && (
                        <WishlistButton productId={product._id} productTitle={product.title} />
                    )}
                </div>
            </div>
        </article>
    );
}
