"use client";
import Link from "next/link";
import { Typography } from "@mui/material";
import FacebookSharpIcon from "@mui/icons-material/FacebookSharp";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";

export default function HeroSection() {
  return (
    <section className="relative grid min-h-[calc(100svh-5rem)] w-full overflow-hidden bg-[#f4f1e9] md:grid-cols-12">
      <div className="relative z-10 flex flex-col justify-center px-7 py-16 sm:px-12 md:col-span-5 md:px-12 md:py-20 lg:px-20 xl:px-24">
        <p className="mb-8 flex items-center gap-3 text-[9px] uppercase tracking-[0.28em] text-[#77796f] animate-hero-kicker">
          <span className="h-px w-8 bg-[#9d7952]" aria-hidden="true" /> Burma
          Collections <span className="text-[#ad8f69]">/</span> Independent
          Myanmar Fashion
        </p>
        <Typography
          variant="h1"
          className="!max-w-xl !font-[family-name:var(--font-cormorant)] !text-5xl !font-normal !leading-[0.92] !tracking-[-0.035em] !text-[#263a31] sm:!text-6xl lg:!text-7xl xl:!text-[5.8rem] animate-hero-headline"
        >
          Wear local.
          <br />
          <span className="italic">Wear your identity.</span>
        </Typography>
        <p className="mt-8 max-w-sm text-sm leading-7 text-[#696a63] sm:text-base animate-hero-text">
          Discover considered pieces from Myanmar’s independent designers, made
          to bring a little more meaning to what you wear.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-6 animate-hero-cta">
          <Link
            href="/products"
            className="group inline-flex items-center gap-4 border border-[#293a32] bg-[#293a32] px-6 py-4 text-[10px] font-medium uppercase tracking-[0.2em] !text-white transition-all duration-300 hover:bg-transparent hover:!text-black"
          >
            Explore the collection{" "}
            <span
              className="transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            >
              →
            </span>
          </Link>
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#85847d]">
            Thoughtfully found. Locally made.
          </span>
        </div>
        <div className="mt-14 flex items-center gap-4 text-[#64675f] md:mt-20 animate-hero-story">
          <span className="text-[9px] uppercase tracking-[0.23em] text-[#8b8982]">
            Follow the story
          </span>
          <span className="h-px w-7 bg-[#c9c2b6]" aria-hidden="true" />
          <FacebookSharpIcon
            aria-hidden="true"
            className="!text-lg transition-colors hover:text-black"
          />
          <InstagramIcon
            aria-hidden="true"
            className="!text-lg transition-colors hover:text-black"
          />
          <TwitterIcon
            aria-hidden="true"
            className="!text-lg transition-colors hover:text-black"
          />
        </div>
      </div>
      <div className="relative min-h-[55vh] overflow-hidden bg-[#dedbd3] sm:min-h-[65vh] md:col-span-7 md:min-h-0">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_55%_38%,rgba(255,255,255,0.8),rgba(222,219,211,0)_62%)]"
          aria-hidden="true"
        />
        <div className="absolute inset-0 h-full w-full animate-hero-image">
          <img
            src="/images/main-hero.png"
            alt="Model wearing an independent Myanmar fashion design"
            className="h-full w-full select-none object-contain object-bottom transition-transform duration-1000 hover:scale-[1.025]"
          />
        </div>
        <span
          className="absolute bottom-0 left-8 top-0 hidden w-px bg-white/50 md:block animate-hero-caption"
          aria-hidden="true"
        />
        <p className="absolute bottom-5 right-5 text-[9px] uppercase tracking-[0.22em] text-[#77756e] sm:bottom-8 sm:right-8 animate-hero-caption">
          A wardrobe with a point of view
        </p>
      </div>
    </section>
  );
}
