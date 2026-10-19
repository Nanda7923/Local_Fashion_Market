"use client";
import { Typography } from "@mui/material";
import {useRouter} from "next/navigation";
import ScrollReveal from "@/app/products/components/ScrollReveal";

export default function FeatureSection(){
    const router = useRouter();
    const btnHandler = () => {
        router.push("/products");
    }
    return(
        <section className="bg-[#f4f1e9] pt-16 md:pt-24">
            <ScrollReveal className="px-6 text-center">
                <Typography className="!text-[10px] md:!text-xs !font-medium !uppercase !tracking-[0.35em] !text-[#9d7952]">Made to be kept</Typography>
                <Typography className="!mx-auto !mt-4 !max-w-3xl !font-[family-name:var(--font-cormorant)] !text-3xl !font-normal !leading-tight !tracking-tight !text-[#263a31] md:!text-5xl">Discover Our Signature Collection</Typography>
                <Typography className="!mt-5 !text-sm md:!text-base !leading-relaxed !text-[#6c7069]">Explore timeless designs crafted with quality,
                    elegance, and modern style.</Typography>
            </ScrollReveal>
            <ScrollReveal delayMs={140} className="relative my-10 min-h-[68vh] w-full overflow-hidden md:my-16 md:min-h-[82vh]">
                <img src="/images/feature.jpg" alt="A curated Burma Collections fashion look" className="absolute inset-0 h-full w-full object-cover object-center"/>
                <div className="absolute inset-0 bg-gradient-to-r from-[#111a16]/75 via-[#111a16]/35 to-transparent"></div>
                <div className="absolute inset-0 z-10 flex items-center">
                    <div className="w-full max-w-xl px-7 text-white sm:px-12 md:ml-16 md:px-0">
                        <p className="mb-5 text-[10px] uppercase tracking-[0.32em] text-white/75">Crafted with intention</p>
                        <Typography className="!font-[family-name:var(--font-cormorant)] !text-4xl !font-normal !leading-none sm:!text-5xl md:!text-7xl">Timeless Elegance</Typography>
                        <Typography className="!max-w-md !text-sm md:!text-base !font-light !leading-7 !text-white/85 !py-5">Discover refined pieces inspired by tradition, crafted for the modern wardrobe.</Typography>
                        <button onClick={btnHandler} className="mt-2 w-fit border border-white/80 bg-transparent px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:bg-white hover:text-[#263a31]">Explore Collection →</button>
                    </div>
                </div>

            </ScrollReveal>
        </section>
    )
}
