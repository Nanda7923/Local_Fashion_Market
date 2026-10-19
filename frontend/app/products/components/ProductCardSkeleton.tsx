"use client";

interface ProductCardSkeletonProps {
    className?: string;
}

export default function ProductCardSkeleton({ className = "" }: ProductCardSkeletonProps) {
    return (
        <div
            aria-hidden="true"
            className={`relative flex w-full min-w-0 max-w-[340px] snap-start shrink-0 flex-col animate-luxury-fade-in ${className}`}
        >
            {/* Image Placeholder matching ProductCard dimensions (300px mobile, 380px md) */}
            <div className="relative h-[300px] w-full shrink-0 overflow-hidden bg-[#ebe6db]/60 skeleton-shimmer md:h-[380px]" />

            {/* Content Details Placeholders */}
            <div className="flex flex-1 flex-col p-1 pt-2">
                {/* Brand Line */}
                <div className="mb-2 h-2.5 w-20 rounded-xs bg-[#ebe6db]/60 skeleton-shimmer" />

                {/* Title 2-line Block matching min-h-[40px] md:min-h-[48px] */}
                <div className="flex min-h-[40px] flex-col justify-center space-y-1.5 py-1 md:min-h-[48px]">
                    <div className="h-3 w-5/6 rounded-xs bg-[#ebe6db]/70 skeleton-shimmer" />
                    <div className="h-3 w-3/5 rounded-xs bg-[#ebe6db]/70 skeleton-shimmer" />
                </div>

                {/* Price & Favorite Button Row */}
                <div className="mt-auto flex items-center justify-between pt-1">
                    <div className="h-4 w-24 rounded-xs bg-[#ebe6db]/70 skeleton-shimmer" />
                    <div className="h-7 w-7 rounded-full bg-[#ebe6db]/50 skeleton-shimmer" />
                </div>
            </div>
        </div>
    );
}
