"use client";
import { useState } from "react";
import Link from "next/link";
import FacebookSharpIcon from '@mui/icons-material/FacebookSharp';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import Typography from "@mui/material/Typography";
import { useSubscribeNewsletterMutation } from "@/lib/features/newsletter/newsletterApiSlice";
import ScrollReveal from "@/app/products/components/ScrollReveal";

type FeedbackType = "validation" | "success" | "duplicate" | "error";

interface FeedbackState {
    type: FeedbackType;
    message: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const shopLinks = [
    { label: "New Arrivals", href: "/products?sort=newest" },
    { label: "Collections", href: "/products" },
    { label: "Brands", href: "/#brands" },
    { label: "All Products", href: "/products" },
];

const customerLinks = [
    { label: "Contact Us", href: "#" },
    { label: "Shipping & Delivery", href: "#" },
    { label: "Returns & Exchanges", href: "#" },
    { label: "FAQs", href: "#" },
];

export default function FooterSection(){
    const [email, setEmail] = useState("");
    const [feedback, setFeedback] = useState<FeedbackState | null>(null);
    const [subscribeNewsletter, { isLoading }] = useSubscribeNewsletterMutation();

    const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setFeedback({
                type: "validation",
                message: "Please enter your email address.",
            });
            return;
        }

        if (!EMAIL_REGEX.test(trimmedEmail)) {
            setFeedback({
                type: "validation",
                message: "Please enter a valid email address.",
            });
            return;
        }

        setFeedback(null);

        try {
            const res = await subscribeNewsletter({ email: trimmedEmail }).unwrap();

            if (res?.alreadySubscribed) {
                setFeedback({
                    type: "duplicate",
                    message: "You're already subscribed.",
                });
            } else {
                setFeedback({
                    type: "success",
                    message: "You're subscribed! Look out for exclusive updates.",
                });
                setEmail("");
            }
        } catch (err: any) {
            const isDuplicate =
                err?.status === 409 ||
                err?.data?.alreadySubscribed === true ||
                err?.data?.message === "You're already subscribed.";

            if (isDuplicate) {
                setFeedback({
                    type: "duplicate",
                    message: "You're already subscribed.",
                });
            } else {
                const message =
                    typeof err?.data?.message === "string" && err.data.message
                        ? err.data.message
                        : "Unable to process subscription right now. Please try again later.";
                setFeedback({
                    type: "error",
                    message,
                });
            }
        }
    };

    const hasError = feedback?.type === "validation" || feedback?.type === "error";

    return(
        <footer className="border-t border-white/10 bg-[#1d2c25] text-white">
            <ScrollReveal className="mx-auto grid w-[90%] max-w-7xl grid-cols-2 gap-x-6 gap-y-12 py-14 md:grid-cols-6 md:gap-8 md:py-20 lg:grid-cols-12">

                {/* Brand section */}
                <div className="col-span-2 md:col-span-3 lg:col-span-3">
                    <div className="md:pr-4">
                        <Link
                            href="/public"
                            className="text-sm font-medium tracking-[0.25em] text-[#f4f1e9]"
                        >
                            BURMA
                            <span className="font-light"> COLLECTIONS</span>
                        </Link>

                        <Typography className="!mt-5 !max-w-sm !text-sm !leading-7 !text-white/55">
                            Curated fashion for modern Myanmar.
                            Discover timeless pieces, emerging brands,
                            and everyday essentials made for your style.
                        </Typography>

                        <div className="mt-6 flex items-center gap-5 text-[#d3b58c] md:mt-8">
                            <Link href="#" aria-label="Facebook">
                                <FacebookSharpIcon className="!text-[22px] md:!text-[28px]" />
                            </Link>

                            <Link href="#" aria-label="Instagram">
                                <InstagramIcon className="!text-[22px] md:!text-[28px]" />
                            </Link>

                            <Link href="#" aria-label="Twitter">
                                <TwitterIcon className="!text-[22px] md:!text-[28px]" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Shop */}
                <div className="col-span-1 md:col-span-2 lg:col-span-2">
                    <h3 className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#d3b58c]">
                        Shop
                    </h3>

                    <ul className="mt-5 space-y-3 md:mt-7 md:space-y-4">
                        {shopLinks.map((link) => (
                            <li key={link.label}>
                                <Link
                                    href={link.href}
                                    className="group relative inline-block text-sm text-white/65 transition-colors duration-300 hover:text-white"
                                >
                                    {link.label}
                                    <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-white transition-transform duration-300 ease-out group-hover:scale-x-100" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Customer Care */}
                <div className="col-span-1 md:col-span-1 lg:col-span-3">
                    <h3 className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#d3b58c]">
                        Customer Care
                    </h3>

                    <ul className="mt-5 space-y-3 md:mt-7 md:space-y-4">
                        {customerLinks.map((link) => (
                            <li key={link.label}>
                                <Link
                                    href={link.href}
                                    className="group relative inline-block text-sm text-white/65 transition-colors duration-300 hover:text-white"
                                >
                                    {link.label}
                                    <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-white transition-transform duration-300 ease-out group-hover:scale-x-100" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Newsletter */}
                <div className="col-span-2 md:col-span-6 lg:col-span-4">
                    <h3 className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#d3b58c]">
                        Stay in the loop
                    </h3>

                    <p className="mt-4 max-w-sm text-sm leading-7 text-white/55 md:mt-5">
                        Sign up for new arrivals, exclusive collections,
                        and the latest from Burma Collections.
                    </p>

                    <form onSubmit={handleSubscribe} noValidate className="mt-2 md:mt-6 max-w-xs">
                        <div className={`flex border-b pb-3 transition-colors duration-300 ${
                            hasError
                                ? "border-[#fca5a5]"
                                : "border-white/30 focus-within:border-[#d3b58c]"
                        }`}>
                            <input
                                id="footer-newsletter-email"
                                type="email"
                                placeholder="Your email address"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (feedback) setFeedback(null);
                                }}
                                disabled={isLoading}
                                aria-label="Your email address for footer newsletter"
                                aria-invalid={hasError}
                                aria-describedby={feedback ? "footer-newsletter-feedback" : undefined}
                                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40 disabled:opacity-60"
                            />

                            <button
                                type="submit"
                                aria-label="Subscribe"
                                disabled={isLoading}
                                className="ml-2 flex-shrink-0 cursor-pointer text-[#d3b58c] transition-colors duration-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <ArrowRightAltIcon fontSize="large" />
                            </button>
                        </div>
                        {feedback && (
                            <div
                                id="footer-newsletter-feedback"
                                role={hasError ? "alert" : "status"}
                                aria-live="polite"
                                className={`mt-3 text-xs tracking-wide transition-opacity duration-300 ${
                                    feedback.type === "success"
                                        ? "text-[#d3b58c] font-medium"
                                        : feedback.type === "duplicate"
                                        ? "text-[#e0c6a2]"
                                        : "text-[#fca5a5]"
                                }`}
                            >
                                {feedback.message}
                            </div>
                        )}
                    </form>
                </div>

            </ScrollReveal>
        </footer>
    )
}
