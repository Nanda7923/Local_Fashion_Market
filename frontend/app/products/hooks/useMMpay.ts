"use client";

import { useEffect, useState } from "react";
import type { MMPayInstance, MMPayResult } from "@/app/types/mmpay";

const SCRIPT_URL = "https://unpkg.com/mmpay-browser-sdk";

export function useMMPay() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Check if script is already injected
        if (typeof window !== "undefined" && window.MMPaySDK) {
            setIsLoaded(true);
            return;
        }

        const script = document.createElement("script");
        script.src = SCRIPT_URL;
        script.async = true;
        script.onload = () => setIsLoaded(true);
        script.onerror = () => console.error("Failed to load MMPay Browser SDK");

        document.body.appendChild(script);

        return () => {
            // Cleanup script tag on unmount if needed
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const openPaymentModal = (
        orderId: string,
        onComplete: (result: MMPayResult) => void
    ) => {
        const publishableKey = process.env.NEXT_PUBLIC_MMPAY_PUBLISHABLE_KEY;

        if (!publishableKey) {
            throw new Error("NEXT_PUBLIC_MMPAY_PUBLISHABLE_KEY is missing in .env.local");
        }

        if (!window.MMPaySDK) {
            throw new Error("MMPay SDK is not ready yet");
        }

        const client: MMPayInstance = new window.MMPaySDK(publishableKey, {
            merchantName: "Aura Fashion Studio",
            design: {
                mode: "light",
                color: "#e11d48", // Matches checkout theme
            },
        });

        client.pay(orderId, onComplete);
    };

    return { isLoaded, openPaymentModal };
}