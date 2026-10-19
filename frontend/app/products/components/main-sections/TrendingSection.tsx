"use client";
import { Typography } from "@mui/material";
import {useGetTrendingQuery} from "@/lib/features/product/productApiSlice";
import ProductCard from "@/app/products/components/ProductCard";
import ProductCardSkeleton from "@/app/products/components/ProductCardSkeleton";
import ScrollReveal from "@/app/products/components/ScrollReveal";

export default function TrendingSection(){
    const { data:products, isLoading } = useGetTrendingQuery(undefined);
    return (
        <section className="relative overflow-hidden bg-[#e9e2d7] py-16 text-[#263a31] md:py-24">
            <div className="pointer-events-none absolute -right-24 top-8 hidden h-[34rem] w-[34rem] rounded-full border border-[#9d7952]/10 lg:block" aria-hidden="true" />
            <div className="pointer-events-none absolute -right-8 top-24 hidden h-[22rem] w-[22rem] rounded-full border border-[#9d7952]/10 lg:block" aria-hidden="true" />
            <ScrollReveal className="relative mx-auto mb-10 flex max-w-7xl flex-col gap-6 px-6 sm:px-10 md:mb-14 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl">
                    <div className="mb-5 flex items-center gap-3">
                        <span className="h-px w-9 bg-[#9d7952]" aria-hidden="true" />
                        <Typography className="!text-[10px] !font-medium !tracking-[0.35em] !uppercase !text-[#8b6948] md:!text-xs">The Edit</Typography>
                    </div>
                    <Typography className="!font-[family-name:var(--font-cormorant)] !text-4xl !font-normal !leading-[0.95] !tracking-tight !text-[#263a31] sm:!text-5xl md:!text-7xl">Trending Now</Typography>
                </div>
                <Typography className="!max-w-sm !border-l !border-[#263a31]/20 !pl-5 !text-sm !font-light !leading-7 !text-[#5b625b] md:mb-1">Explore the favorites making their way into everyone&apos;s wardrobe.</Typography>
            </ScrollReveal>
            <ScrollReveal delayMs={140} className="mx-auto grid w-full max-w-7xl grid-cols-1 justify-items-center gap-x-4 gap-y-10 px-6 sm:grid-cols-2 sm:px-10 md:grid-cols-3 lg:grid-cols-5 lg:gap-x-3 xl:gap-x-5">
                {isLoading || !products
                    ? Array.from({ length: 5 }).map((_, i) => (
                          <ProductCardSkeleton key={i} />
                      ))
                    : products?.map((product) => (
                          <ProductCard key={product._id} product={product} />
                      ))}
            </ScrollReveal>
        </section>
    )
}
