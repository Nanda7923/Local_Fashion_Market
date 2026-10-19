"use client";
import Typography from "@mui/material/Typography";
import {useGetBrandsQuery} from "@/lib/features/product/brandApiSlice";
import Link from "next/link";
import ScrollReveal from "@/app/products/components/ScrollReveal";


export default function AvailableBrandSection(){
    const { data: brands = [], isLoading, isError } = useGetBrandsQuery(undefined);
    return (
        <section id="brands" className="bg-[#fbfaf7] px-4 py-16 sm:px-8 md:py-24 scroll-smooth">
            <ScrollReveal className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
                <Typography className="!text-[10px] md:!text-xs !font-medium !uppercase !tracking-[0.4em] !text-[#9d7952]">
                    The Designers
                </Typography>

                <Typography className="!mt-4 !font-[family-name:var(--font-cormorant)] !text-3xl !font-normal !tracking-tight !text-[#263a31] md:!text-5xl">
                    Discover the Brands Behind Our Collection
                </Typography>

                <Typography className="!mx-auto !mt-5 !max-w-xl !text-sm !leading-7 !font-light !text-[#74756d]">
                    Explore carefully selected brands, each bringing its own character and style to Burma-Collections.
                </Typography>
            </ScrollReveal>
            {isLoading ? (
                <ScrollReveal
                    delayMs={140}
                    role="status"
                    aria-busy="true"
                    aria-label="Loading available brands"
                    className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-x-7 gap-y-8 border-y border-[#e8e3da] px-2 py-8 sm:gap-x-10 sm:py-10 md:gap-x-14 md:gap-y-10"
                >
                    <span className="sr-only">Loading available brands…</span>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex w-[calc(50%-1rem)] max-w-[190px] flex-col items-center justify-center gap-3 py-2 sm:w-[calc(33.333%-2rem)] md:w-[calc(25%-3rem)] lg:w-[calc(20%-3rem)]"
                        >
                            <div className="h-16 w-28 rounded-xs bg-[#ebe6db]/60 skeleton-shimmer sm:h-20 sm:w-32" />
                            <div className="h-2.5 w-16 rounded-xs bg-[#ebe6db]/50 skeleton-shimmer" />
                        </div>
                    ))}
                </ScrollReveal>
            ) : isError ? (
                <div className="mx-auto max-w-md border-y border-[#e8e3da] px-4 py-12 text-center" role="alert">
                    <p className="text-sm text-stone-600">Could not load brands. Please refresh or try again later.</p>
                </div>
            ) : brands.length === 0 ? (
                <div className="mx-auto max-w-md border-y border-[#e8e3da] px-4 py-12 text-center">
                    <p className="text-sm text-stone-500">No brand collections are available at this time.</p>
                </div>
            ) : (
                <ScrollReveal delayMs={140} className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-x-7 gap-y-8 border-y border-[#e8e3da] px-2 py-8 sm:gap-x-10 sm:py-10 md:gap-x-14 md:gap-y-10">
                    {brands.map((brand) => (
                        <Link
                            href={`/products?brand=${brand._id}`}
                            key={brand._id}
                            aria-label={`${brand.name} brand`}
                            className="group flex w-[calc(50%-1rem)] max-w-[190px] flex-col items-center justify-center gap-3 py-2 text-center sm:w-[calc(33.333%-2rem)] md:w-[calc(25%-3rem)] lg:w-[calc(20%-3rem)]"
                        >
                            <span className="flex h-16 w-full items-center justify-center sm:h-20">
                                <img
                                    src={brand.logo}
                                    alt={`${brand.name} logo`}
                                    className="max-h-full max-w-[85%] object-contain opacity-75 grayscale transition-all duration-500 group-hover:scale-[1.04] group-hover:opacity-100 group-hover:grayscale-0"
                                />
                            </span>
                            <span className="text-[9px] uppercase tracking-[0.2em] text-[#77796f] transition-colors group-hover:text-[#9d7952] sm:text-[10px]">
                                {brand.name}
                            </span>
                        </Link>
                    ))}
                </ScrollReveal>
            )}
        </section>
    )
}
