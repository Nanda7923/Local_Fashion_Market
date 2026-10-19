"use client";
import Typography from "@mui/material/Typography";
import {useGetNewArrivalsQuery} from "@/lib/features/product/productApiSlice";
import ProductCard from "@/app/products/components/ProductCard";
import ProductCardSkeleton from "@/app/products/components/ProductCardSkeleton";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import {Button} from "@mui/material";
import {useScroll} from "@/app/products/hooks/useScroll";
import {useRouter} from "next/navigation";
import ScrollReveal from "@/app/products/components/ScrollReveal";

export default function NewArrivalSection() {
    const { data:products, isLoading } = useGetNewArrivalsQuery(undefined);
    const {sliderRef, scroll} = useScroll();
    const router = useRouter();

    const btnHandler = () => {
        router.push("/products");
    }

    return (
        <section className="block w-full clear-both bg-[#f4f1e9] py-16 md:py-24">
            <ScrollReveal className="mx-auto mb-9 max-w-3xl px-6 text-center">
                <Typography className="!text-[10px] uppercase !font-medium !tracking-[0.35em] !text-[#9d7952] md:!text-xs">
                    Just Arrived
                </Typography>
                <Typography className="!mt-4 !font-[family-name:var(--font-cormorant)] !text-3xl !font-normal !leading-tight !text-[#263a31] md:!text-5xl">
                    Newest Items
                </Typography>
                <Typography className="!mx-auto !mt-4 !max-w-2xl !text-sm !font-light !leading-7 !text-[#6c7069]">
                    Discover our latest arrivals, carefully selected with modern styles, premium details,
                    and timeless designs made to elevate your everyday wardrobe.
                </Typography>
            </ScrollReveal>


            <ScrollReveal delayMs={140} className="w-full flex flex-col items-center">
                <div className="relative w-full">
                    <button onClick={() => scroll("left")}
                            aria-label="Scroll new arrivals left" className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[#d6d0c4] bg-[#fbfaf7]/90 p-2 text-[#293a32] shadow-sm backdrop-blur transition hover:bg-white cursor-pointer md:left-6">
                        <ChevronLeft className="!text-4xl"/>
                    </button>
                    <button onClick={() => scroll("right")} aria-label="Scroll new arrivals right" className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[#d6d0c4] bg-[#fbfaf7]/90 p-2 text-[#293a32] shadow-sm backdrop-blur transition hover:bg-white cursor-pointer md:right-6">
                        <ChevronRight className="!text-4xl" />
                    </button>

                        <div ref={sliderRef} className="flex gap-5 overflow-x-auto scroll-smooth px-5 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mb-6 sm:px-10 md:gap-6">
                        {
                            isLoading || !products ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="w-[260px] shrink-0 sm:w-[300px]">
                                        <ProductCardSkeleton />
                                    </div>
                                ))
                            ) : (
                                products.map((product) => <ProductCard key={product._id} product={product} />)
                            )
                        }
                        </div>

                </div>
                <div className="flex justify-center w-full pt-10 items-center">
                    <Button onClick={btnHandler} className="!text-[10px] md:!text-xs !bg-transparent !text-[#293a32] !rounded-none !border !border-[#293a32] !px-7 !py-3 !tracking-[0.18em] !uppercase hover:!bg-[#293a32] hover:!text-white !transition-colors">
                        View All Products &rarr;
                    </Button>
                </div>

            </ScrollReveal>
        </section>
    )
}
