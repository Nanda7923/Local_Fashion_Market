"use client";

import { useEffect, useState } from "react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useAuth } from "@/app/products/hooks/useAuth";
import { selectAuthInitialized } from "@/lib/features/auth/authSlice";
import { requestLoginModal } from "@/lib/features/auth/authEvents";
import { useAppSelector } from "@/lib/hooks";
import { useAddWishlistProductMutation, useGetWishlistQuery } from "@/lib/features/product/wishlistApiSlice";

interface WishlistButtonProps {
    productId?: string;
    productTitle: string;
    showLabel?: boolean;
    className?: string;
}

function requestErrorMessage(error: unknown) {
    if (typeof error === "object" && error !== null && "data" in error) {
        const response = error.data;
        if (typeof response === "object" && response !== null && "message" in response && typeof response.message === "string") {
            return response.message;
        }
    }
    return "Could not add this product to your wishlist. Please try again.";
}

export default function WishlistButton({ productId, productTitle, showLabel = false, className = "" }: WishlistButtonProps) {
    const { isAuthenticated } = useAuth();
    const authInitialized = useAppSelector(selectAuthInitialized);
    const { data: wishlist, isLoading: isLoadingWishlist } = useGetWishlistQuery(undefined, {
        skip: !authInitialized || !isAuthenticated,
    });
    const [addProduct, { isLoading: isAdding }] = useAddWishlistProductMutation();
    const [feedback, setFeedback] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
    const isSaved = Boolean(productId && wishlist?.products.some((product) => product._id === productId));

    useEffect(() => {
        if (!feedback) return;
        const timeout = window.setTimeout(() => setFeedback(null), 4000);
        return () => window.clearTimeout(timeout);
    }, [feedback]);

    const handleAdd = async () => {
        if (!authInitialized) {
            setFeedback({ type: "info", message: "Checking your saved session. Please try again in a moment." });
            return;
        }
        if (!isAuthenticated) {
            requestLoginModal();
            setFeedback({ type: "info", message: "Sign in to save this product." });
            return;
        }
        if (!productId) {
            setFeedback({ type: "error", message: "This product is unavailable." });
            return;
        }
        if (isSaved) {
            setFeedback({ type: "info", message: "This product is already in your wishlist." });
            return;
        }

        setFeedback(null);
        try {
            await addProduct(productId).unwrap();
            setFeedback({ type: "success", message: "Added to your wishlist." });
        } catch (error) {
            setFeedback({ type: "error", message: requestErrorMessage(error) });
        }
    };

    const disabled = isAdding || isLoadingWishlist || !productId;
    return <div className={showLabel ? "w-full" : "flex flex-col items-end"}>
        <button
            type="button"
            aria-label={isSaved ? `${productTitle} is in your wishlist` : `Add ${productTitle} to wishlist`}
            aria-pressed={isSaved}
            disabled={disabled}
            onClick={handleAdd}
            className={`${showLabel
                ? "flex w-full items-center justify-center gap-2 py-3 text-sm transition-colors hover:text-stone-600 disabled:cursor-wait disabled:opacity-60"
                : "flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:text-[#9d7952] disabled:cursor-wait disabled:opacity-60 sm:h-12 sm:w-12"} ${className}`}
        >
            {
                isAdding ?
                    <span role="status" aria-label="Adding to wishlist"
                          className="h-4 w-4 animate-spin rounded-full border border-current border-t-transparent"
                    /> : isSaved ? <FavoriteIcon className={`${showLabel ? "!text-[18px]" : "!text-[14px] sm:!text-[28px]"} text-[#9d7952]`} />
                    : <FavoriteBorderIcon className={showLabel ? "!text-[18px]" : "!text-[14px] sm:!text-[28px]"} />
            }
            {showLabel && (isAdding ? "Adding…" : isSaved ? "Saved to Wishlist" : "Add To Wishlist")}
        </button>
    </div>;
}
