"use client";

import { Typography } from "@mui/material";
import { useState } from "react";
import { useSubscribeNewsletterMutation } from "@/lib/features/newsletter/newsletterApiSlice";
import ScrollReveal from "@/app/products/components/ScrollReveal";

type FeedbackType = "validation" | "success" | "duplicate" | "error";

interface FeedbackState {
    type: FeedbackType;
    message: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewsletterSection() {
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
                    message:
                        "You're subscribed! Look out for the latest arrivals and exclusive updates from Burma Collections.",
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

    return (
        <ScrollReveal
            as="section"
            id="newsletter"
            className="relative mx-auto mb-16 w-[calc(100%-2rem)] max-w-7xl overflow-hidden bg-[#263a31] text-[#fbfaf7] sm:w-[95%] md:mb-24 scroll-mt-24"
        >
            <div
                className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/10 sm:h-96 sm:w-96"
                aria-hidden="true"
            />
            <div
                className="pointer-events-none absolute -right-8 -top-12 h-52 w-52 rounded-full border border-white/10 sm:h-72 sm:w-72"
                aria-hidden="true"
            />
            <div className="relative mx-auto flex max-w-2xl flex-col items-center justify-center px-6 py-20 text-center md:py-28">
                <Typography className="!text-[10px] md:!text-xs !font-medium !uppercase !tracking-[0.45em] !text-[#d3b58c]">
                    Stay in Style
                </Typography>

                <Typography className="!mt-6 !font-[family-name:var(--font-cormorant)] !text-3xl md:!text-5xl !font-normal !tracking-tight !leading-tight !text-[#fbfaf7]">
                    A Little Inspiration, Delivered.
                </Typography>

                <Typography className="!mx-auto !mt-5 !max-w-xl !text-sm !leading-7 !font-light !text-white/70">
                    Be the first to discover new arrivals, timeless styles,
                    and exclusive offers from Burma-Collections.
                </Typography>

                <form
                    onSubmit={handleSubscribe}
                    noValidate
                    className={`mt-10 flex w-full max-w-md items-center justify-between border-b pb-3 transition-colors duration-300 ${
                        hasError
                            ? "border-[#fca5a5]"
                            : "border-white/35 focus-within:border-[#d3b58c]"
                    }`}
                >
                    <input
                        id="newsletter-email-input"
                        type="email"
                        placeholder="Your email address"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (feedback) setFeedback(null);
                        }}
                        disabled={isLoading}
                        aria-label="Your email address"
                        aria-invalid={hasError}
                        aria-describedby={feedback ? "newsletter-feedback" : undefined}
                        className="w-full bg-transparent py-2 text-sm text-white outline-none placeholder:text-white/45 disabled:opacity-60"
                    />

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="ml-4 shrink-0 bg-transparent text-[10px] md:text-xs uppercase tracking-[0.25em] font-medium text-[#e0c6a2] cursor-pointer transition-colors duration-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isLoading ? "Subscribing..." : "Subscribe"}
                    </button>
                </form>

                {feedback && (
                    <div
                        id="newsletter-feedback"
                        role={hasError ? "alert" : "status"}
                        aria-live="polite"
                        className={`mt-4 text-xs md:text-sm tracking-wide transition-opacity duration-300 max-w-md ${
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

                <Typography
                    className={`!tracking-wider !font-light !text-white/45 ${
                        feedback ? "!mt-4 !text-[10px]" : "!mt-7 !text-[10px]"
                    }`}
                >
                    Join our community for fashion updates and exclusive offers.
                </Typography>
            </div>
        </ScrollReveal>
    );
}
