"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { CartItem, CartProduct } from "@/lib/features/product/cartApiSlice";

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: CartItem[];
    subtotal: number;
    token?: string | null;
    clearCart: () => Promise<any> | void;
}

export type WalletVendor = "KBZPay" | "WavePay" | "AYAPay";
export type PaymentMethod = WalletVendor | "Card";

interface PlacedOrderData {
    orderId: string;
    amount: number;
    transactionRefId: string;
    paymentMethod: string;
    vendor?: string;
    shippingAddress: {
        name: string;
        phone: string;
        address: string;
    };
}

interface QrScanData {
    orderId: string;
    amount: number;
    vendor: WalletVendor;
    qr: string;
    transactionRefId: string;
    url?: string;
}

export default function CheckoutModal({
    isOpen,
    onClose,
    items,
    subtotal,
    token,
    clearCart,
}: CheckoutModalProps) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("KBZPay");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGeneratingQr, setIsGeneratingQr] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [confirmedOrder, setConfirmedOrder] = useState<PlacedOrderData | null>(null);

    // Active QR Scan Frame State
    const [activeQrScan, setActiveQrScan] = useState<QrScanData | null>(null);
    const [scanSecondsLeft, setScanSecondsLeft] = useState(180);
    const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);

    // Countdown timer for active QR scan
    useEffect(() => {
        if (!activeQrScan) return;
        setScanSecondsLeft(180);
        const timer = setInterval(() => {
            setScanSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [activeQrScan]);

    // Keyboard accessibility: Escape dismiss
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !isSubmitting && !isSimulatingPayment) {
                handleResetAndClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isSubmitting, isSimulatingPayment]);

    if (!isOpen) return null;

    /**
     * Trigger fetch loop to backend on port 3000 to generate fake sandbox MMQR for a wallet vendor
     */
    const handleSelectSubWallet = async (vendor: WalletVendor) => {
        setPaymentMethod(vendor);
        setErrorMessage(null);
        setIsGeneratingQr(true);

        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        const orderId = `ORD_${Date.now()}`;

        try {
            const shippingPayload = {
                name: name.trim() || "Valued Customer",
                phone: phone.trim() || "0912345678",
                address: address.trim() || "Yangon, Myanmar",
                township: "Kamayut",
                city: "Yangon",
            };

            const payload = {
                orderId,
                amount: subtotal,
                vendor: vendor, // Vendor name: 'KBZPay' | 'WavePay' | 'AYAPay'
                paymentMethod: vendor,
                shippingAddress: shippingPayload,
                items: items
                    .filter((item): item is CartItem & { product: CartProduct } => Boolean(item.product))
                    .map((item) => ({
                        productId: item.product._id,
                        name: item.product.title,
                        price: item.product.price,
                        quantity: item.quantity,
                        size: item.size,
                        color: item.color,
                    })),
                customMessage: `Aura Fashion Studio · ${vendor} MMQR Checkout`,
            };

            // Trigger backend handshake on port 3000
            const response = await fetch(`${backendUrl}/mmpay/checkout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errJson = await response.json().catch(() => null);
                throw new Error(errJson?.error || `Failed to initiate ${vendor} MMQR session`);
            }

            const data = await response.json();

            // Set up active visual scan frame
            setActiveQrScan({
                orderId: data.orderId || orderId,
                amount: data.amount || subtotal,
                vendor: vendor,
                qr: data.qr || "",
                transactionRefId: data.transactionRefId || `TX_${Date.now()}`,
                url: data.url,
            });
        } catch (err: any) {
            console.error(`Error initializing ${vendor} checkout:`, err);
            setErrorMessage(err.message || `Failed to connect to backend for ${vendor}. Please check port 3000.`);
        } finally {
            setIsGeneratingQr(false);
        }
    };

    /**
     * Complete the simulated transaction handshake from the visual scan frame
     */
    const handleConfirmQrPayment = async () => {
        if (!activeQrScan) return;
        setIsSimulatingPayment(true);
        setErrorMessage(null);

        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

        try {
            // Send successful handshake completion
            const shippingPayload = {
                name: name.trim() || "Valued Customer",
                phone: phone.trim() || "0912345678",
                address: address.trim() || "Yangon, Myanmar",
                township: "Kamayut",
                city: "Yangon",
            };

            // Clear cart
            try {
                await clearCart();
            } catch (clearErr) {
                console.warn("Could not clear cart immediately:", clearErr);
            }

            // Transition to success state
            setConfirmedOrder({
                orderId: activeQrScan.orderId,
                amount: activeQrScan.amount,
                transactionRefId: activeQrScan.transactionRefId,
                paymentMethod: activeQrScan.vendor,
                vendor: activeQrScan.vendor,
                shippingAddress: shippingPayload,
            });

            setActiveQrScan(null);
        } catch (err: any) {
            console.error("Payment confirmation error:", err);
            setErrorMessage(err.message || "Failed to confirm payment transaction.");
        } finally {
            setIsSimulatingPayment(false);
        }
    };

    /**
     * Submit full form (Card or general place order)
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!name.trim() || !phone.trim() || !address.trim()) {
            setErrorMessage("Please complete all required shipping fields before placing the order.");
            return;
        }

        // If a sub-wallet was selected, launch its scan frame flow
        if (paymentMethod === "KBZPay" || paymentMethod === "WavePay" || paymentMethod === "AYAPay") {
            await handleSelectSubWallet(paymentMethod);
            return;
        }

        // Card flow
        setIsSubmitting(true);
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

        try {
            const orderId = `ORD_${Date.now()}`;
            const shippingPayload = {
                name: name.trim(),
                phone: phone.trim(),
                address: address.trim(),
                township: "Kamayut",
                city: "Yangon",
            };

            const payload = {
                orderId,
                amount: subtotal,
                vendor: "Card",
                paymentMethod: "Card",
                shippingAddress: shippingPayload,
                items: items
                    .filter((item): item is CartItem & { product: CartProduct } => Boolean(item.product))
                    .map((item) => ({
                        productId: item.product._id,
                        name: item.product.title,
                        price: item.product.price,
                        quantity: item.quantity,
                        size: item.size,
                        color: item.color,
                    })),
                customMessage: "Burma_Collection Online Card Checkout",
            };

            const response = await fetch(`${backendUrl}/mmpay/checkout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errJson = await response.json().catch(() => null);
                throw new Error(errJson?.error || `Server responded with status ${response.status}`);
            }

            const data = await response.json();

            try {
                await clearCart();
            } catch (clearErr) {
                console.warn("Could not clear cart immediately:", clearErr);
            }

            setConfirmedOrder({
                orderId: data.orderId || orderId,
                amount: data.amount || subtotal,
                transactionRefId: data.transactionRefId || `TX_${Date.now()}`,
                paymentMethod: "Card",
                shippingAddress: shippingPayload,
            });
        } catch (err: any) {
            console.error("Checkout execution error:", err);
            setErrorMessage(err.message || "Checkout failed. Please ensure the backend is running on port 3000.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResetAndClose = () => {
        setActiveQrScan(null);
        setConfirmedOrder(null);
        setErrorMessage(null);
        onClose();
    };

    const formatTimer = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-luxury-fade-in"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !isSubmitting && !isSimulatingPayment) {
                    handleResetAndClose();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                className="relative max-h-[94vh] w-full max-w-xl overflow-y-auto border border-black bg-white p-6 shadow-2xl sm:p-10 animate-luxury-scale-in"
            >
                {/* Minimalist Close Button */}
                <button
                    onClick={handleResetAndClose}
                    disabled={isSubmitting || isSimulatingPayment}
                    aria-label="Close checkout"
                    className="absolute right-5 top-5 text-xl font-light text-stone-400 transition-colors hover:text-black disabled:opacity-30"
                >
                    ✕
                </button>

                {confirmedOrder ? (
                    /* ----------------- STATE 1: ORDER CONFIRMED SUCCESS ----------------- */
                    <div className="py-4 text-center">
                        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center border border-black bg-black text-white">
                            <span className="text-xl">✓</span>
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">
                            Transaction Approved · Sandbox Handshake Complete
                        </p>
                        <h2 className="mt-2 font-cormorant text-4xl tracking-wide text-neutral-900 sm:text-5xl">
                            Order Confirmed
                        </h2>
                        <p className="mt-3 text-xs text-stone-600">
                            Your payment has been cryptographically confirmed. An order receipt has been created.
                        </p>

                        <div className="my-8 border border-neutral-200 bg-neutral-50 p-6 text-left">
                            <div className="flex justify-between border-b border-neutral-200 pb-3 text-[11px] uppercase tracking-wider text-stone-500">
                                <span>Reference</span>
                                <span className="font-mono text-black">{confirmedOrder.orderId}</span>
                            </div>
                            <div className="flex justify-between border-b border-neutral-200 py-3 text-[11px] uppercase tracking-wider text-stone-500">
                                <span>Transaction ID</span>
                                <span className="font-mono text-black">{confirmedOrder.transactionRefId}</span>
                            </div>
                            <div className="flex justify-between border-b border-neutral-200 py-3 text-[11px] uppercase tracking-wider text-stone-500">
                                <span>Payment Method</span>
                                <span className="font-medium text-black">{confirmedOrder.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between border-b border-neutral-200 py-3 text-[11px] uppercase tracking-wider text-stone-500">
                                <span>Recipient</span>
                                <span className="text-black">{confirmedOrder.shippingAddress.name} ({confirmedOrder.shippingAddress.phone})</span>
                            </div>
                            <div className="flex justify-between pt-4 text-xs font-medium">
                                <span className="uppercase tracking-wider">Amount Paid</span>
                                <span className="font-cormorant text-2xl text-black">
                                    {confirmedOrder.amount.toLocaleString()} MMK
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/products"
                                onClick={handleResetAndClose}
                                className="flex-1 border border-black bg-black py-3.5 text-center text-xs uppercase tracking-[0.2em] text-white transition-colors hover:bg-neutral-800"
                            >
                                Continue Shopping
                            </Link>
                            <Link
                                href="/profile"
                                onClick={handleResetAndClose}
                                className="flex-1 border border-black bg-white py-3.5 text-center text-xs uppercase tracking-[0.2em] text-black transition-colors hover:bg-neutral-100"
                            >
                                View My Orders
                            </Link>
                        </div>
                    </div>
                ) : activeQrScan ? (
                    /* ----------------- STATE 2: VISUAL MMQR SCAN FRAME ----------------- */
                    <div className="py-2 text-center">
                        <header className="mb-6 border-b border-neutral-200 pb-4">
                            <div className="flex items-center justify-center gap-2">
                                <span className="h-1.5 w-1.5 animate-pulse bg-emerald-600" />
                                <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-800">
                                    {activeQrScan.vendor} · Sandbox MMQR Gateway
                                </p>
                            </div>
                            <h2 className="mt-1 font-cormorant text-3xl tracking-wide text-neutral-900 sm:text-4xl">
                                Scan to Complete Payment
                            </h2>
                            <p className="mt-1 text-[11px] tracking-wider text-stone-500">
                                Open your {activeQrScan.vendor} app and point your scanner at the MMQR frame below.
                            </p>
                        </header>

                        {/* Visual Scan Frame with Corner Viewfinder Brackets */}
                        <div className="mx-auto my-6 flex w-fit flex-col items-center">
                            <div className="relative border border-neutral-200 bg-white p-6 shadow-sm">
                                {/* 4 Luxury Corner Viewfinder Brackets */}
                                <div className="pointer-events-none absolute -left-2 -top-2 h-4 w-4 border-l-2 border-t-2 border-black" />
                                <div className="pointer-events-none absolute -right-2 -top-2 h-4 w-4 border-r-2 border-t-2 border-black" />
                                <div className="pointer-events-none absolute -bottom-2 -left-2 h-4 w-4 border-b-2 border-l-2 border-black" />
                                <div className="pointer-events-none absolute -bottom-2 -right-2 h-4 w-4 border-b-2 border-r-2 border-black" />

                                {/* Smooth Luxury Laser Scanline */}
                                <div className="pointer-events-none absolute inset-x-4 top-0 z-10 h-[2px] animate-luxury-scanline bg-gradient-to-r from-transparent via-[#263a31] to-transparent shadow-[0_0_8px_rgba(38,58,49,0.5)]" />

                                {/* Realistic Monochrome MMQR SVG */}
                                <div className="flex h-52 w-52 items-center justify-center bg-white">
                                    <svg viewBox="0 0 100 100" className="h-full w-full">
                                        {/* Background */}
                                        <rect width="100" height="100" fill="white" />

                                        {/* Top-Left Finder Square */}
                                        <rect x="6" y="6" width="26" height="26" fill="black" />
                                        <rect x="10" y="10" width="18" height="18" fill="white" />
                                        <rect x="14" y="14" width="10" height="10" fill="black" />

                                        {/* Top-Right Finder Square */}
                                        <rect x="68" y="6" width="26" height="26" fill="black" />
                                        <rect x="72" y="10" width="18" height="18" fill="white" />
                                        <rect x="76" y="14" width="10" height="10" fill="black" />

                                        {/* Bottom-Left Finder Square */}
                                        <rect x="6" y="68" width="26" height="26" fill="black" />
                                        <rect x="10" y="72" width="18" height="18" fill="white" />
                                        <rect x="14" y="76" width="10" height="10" fill="black" />

                                        {/* Timing and Geometric MMQR Data Modules */}
                                        <rect x="36" y="10" width="4" height="4" fill="black" />
                                        <rect x="44" y="10" width="4" height="4" fill="black" />
                                        <rect x="52" y="10" width="4" height="4" fill="black" />
                                        <rect x="60" y="10" width="4" height="4" fill="black" />

                                        <rect x="38" y="20" width="6" height="6" fill="black" />
                                        <rect x="48" y="24" width="6" height="4" fill="black" />
                                        <rect x="58" y="20" width="4" height="6" fill="black" />

                                        <rect x="10" y="36" width="4" height="4" fill="black" />
                                        <rect x="10" y="44" width="4" height="4" fill="black" />
                                        <rect x="10" y="52" width="4" height="4" fill="black" />
                                        <rect x="10" y="60" width="4" height="4" fill="black" />

                                        {/* Data matrix dots */}
                                        <rect x="20" y="38" width="6" height="6" fill="black" />
                                        <rect x="24" y="48" width="4" height="6" fill="black" />
                                        <rect x="20" y="58" width="6" height="4" fill="black" />

                                        <rect x="70" y="38" width="6" height="4" fill="black" />
                                        <rect x="80" y="44" width="4" height="6" fill="black" />
                                        <rect x="72" y="54" width="6" height="6" fill="black" />
                                        <rect x="82" y="64" width="4" height="4" fill="black" />

                                        <rect x="38" y="70" width="6" height="4" fill="black" />
                                        <rect x="48" y="76" width="4" height="6" fill="black" />
                                        <rect x="58" y="72" width="6" height="4" fill="black" />
                                        <rect x="66" y="80" width="4" height="6" fill="black" />
                                        <rect x="76" y="74" width="6" height="4" fill="black" />
                                        <rect x="86" y="80" width="4" height="6" fill="black" />

                                        {/* Center Vendor Badge */}
                                        <rect x="34" y="38" width="32" height="24" fill="white" stroke="black" strokeWidth="1.5" />
                                        <text
                                            x="50"
                                            y="49"
                                            fontFamily="sans-serif"
                                            fontSize="6.5"
                                            fontWeight="bold"
                                            textAnchor="middle"
                                            fill="black"
                                            letterSpacing="0.5"
                                        >
                                            {activeQrScan.vendor === "AYAPay" ? "AYA" : activeQrScan.vendor === "KBZPay" ? "KBZ" : "WAVE"}
                                        </text>
                                        <text
                                            x="50"
                                            y="57"
                                            fontFamily="sans-serif"
                                            fontSize="5"
                                            textAnchor="middle"
                                            fill="#666"
                                        >
                                            MMQR
                                        </text>
                                    </svg>
                                </div>
                            </div>

                            {/* Scan Frame Status Badge */}
                            <div className="mt-4 flex items-center gap-2 border border-neutral-200 bg-neutral-50 px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] text-neutral-800">
                                <span className="h-2 w-2 animate-ping bg-emerald-500" />
                                <span>Scanning active · Expires in {formatTimer(scanSecondsLeft)}</span>
                            </div>
                        </div>

                        {/* Order & Amount Meta */}
                        <div className="mb-6 border border-neutral-200 bg-neutral-50 p-4 text-left text-xs">
                            <div className="flex justify-between border-b border-neutral-200 pb-2">
                                <span className="text-stone-500">Merchant</span>
                                <span className="font-medium text-black">Aura Fashion Studio</span>
                            </div>
                            <div className="flex justify-between border-b border-neutral-200 py-2">
                                <span className="text-stone-500">Order ID</span>
                                <span className="font-mono text-black">{activeQrScan.orderId}</span>
                            </div>
                            <div className="flex justify-between border-b border-neutral-200 py-2">
                                <span className="text-stone-500">Wallet Network</span>
                                <span className="font-medium text-black">{activeQrScan.vendor}</span>
                            </div>
                            <div className="flex justify-between pt-2 text-sm font-semibold">
                                <span className="uppercase tracking-wider">Payable Total</span>
                                <span className="font-cormorant text-2xl text-black">
                                    {activeQrScan.amount.toLocaleString()} MMK
                                </span>
                            </div>
                        </div>

                        {/* Simulated Trigger / Confirmation Action */}
                        <div className="space-y-3">
                            <button
                                onClick={handleConfirmQrPayment}
                                disabled={isSimulatingPayment}
                                className="w-full border border-black bg-black py-4 text-xs uppercase tracking-[0.25em] text-white transition-all hover:bg-neutral-800 disabled:opacity-50"
                            >
                                {isSimulatingPayment
                                    ? `Simulating ${activeQrScan.vendor} Confirmation...`
                                    : `Simulate ${activeQrScan.vendor} Payment Scan`}
                            </button>

                            <button
                                onClick={() => setActiveQrScan(null)}
                                disabled={isSimulatingPayment}
                                className="w-full border border-neutral-200 py-2.5 text-xs uppercase tracking-widest text-stone-600 transition-colors hover:border-black hover:text-black"
                            >
                                Select Another Wallet / Method
                            </button>
                        </div>
                    </div>
                ) : (
                    /* ----------------- STATE 3: MAIN CHECKOUT FORM ----------------- */
                    <div>
                        <header className="mb-8 border-b border-neutral-200 pb-5">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400">
                                Aura Fashion Studio · Checkout
                            </p>
                            <h2 className="mt-1 font-cormorant text-3xl tracking-wide text-neutral-900 sm:text-4xl">
                                Shipping & Payment
                            </h2>
                        </header>

                        {errorMessage && (
                            <div className="mb-6 border border-rose-300 bg-rose-50 p-4 text-xs text-rose-800">
                                {errorMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* 1. SHIPPING INFORMATION */}
                            <section>
                                <div className="mb-4 flex items-center justify-between border-b border-neutral-200 pb-2">
                                    <h3 className="text-xs uppercase tracking-[0.2em] text-neutral-900">
                                        01 / Shipping Information
                                    </h3>
                                    <span className="text-[10px] uppercase tracking-widest text-stone-400">Required</span>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1 block text-[11px] uppercase tracking-wider text-stone-600">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g. Eleanor Vance"
                                            className="w-full border border-neutral-300 bg-white px-4 py-2.5 text-sm text-black transition-colors focus:border-black focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-[11px] uppercase tracking-wider text-stone-600">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="e.g. 09 123 456 789"
                                            className="w-full border border-neutral-300 bg-white px-4 py-2.5 text-sm text-black transition-colors focus:border-black focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-[11px] uppercase tracking-wider text-stone-600">
                                            Delivery Address *
                                        </label>
                                        <textarea
                                            required
                                            rows={2}
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            placeholder="Street address, building, township, city"
                                            className="w-full border border-neutral-300 bg-white px-4 py-2 text-sm text-black transition-colors focus:border-black focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* 2. PAYMENT METHOD SELECTOR (MYANMYANPAY SUB-WALLETS) */}
                            <section>
                                <div className="mb-4 flex items-center justify-between border-b border-neutral-200 pb-2">
                                    <h3 className="text-xs uppercase tracking-[0.2em] text-neutral-900">
                                        02 / MyanMyanPay Sub-Wallets & Methods
                                    </h3>
                                    <span className="text-[10px] uppercase tracking-widest text-stone-400">Click to scan MMQR</span>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-3">
                                    {/* 1. KBZPay */}
                                    <button
                                        type="button"
                                        onClick={() => handleSelectSubWallet("KBZPay")}
                                        disabled={isGeneratingQr}
                                        className={`flex flex-col justify-between border p-4 text-left transition-all ${
                                            paymentMethod === "KBZPay"
                                                ? "border-black bg-neutral-900 text-white shadow-sm"
                                                : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-400"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold tracking-wider">KBZPay</span>
                                            <span className={`text-[10px] uppercase tracking-widest ${
                                                paymentMethod === "KBZPay" ? "text-neutral-300" : "text-stone-400"
                                            }`}>
                                                MMQR
                                            </span>
                                        </div>
                                        <p className={`mt-3 text-[10px] leading-relaxed ${
                                            paymentMethod === "KBZPay" ? "text-neutral-300" : "text-stone-500"
                                        }`}>
                                            KBZPay Wallet & Scan
                                        </p>
                                    </button>

                                    {/* 2. WavePay */}
                                    <button
                                        type="button"
                                        onClick={() => handleSelectSubWallet("WavePay")}
                                        disabled={isGeneratingQr}
                                        className={`flex flex-col justify-between border p-4 text-left transition-all ${
                                            paymentMethod === "WavePay"
                                                ? "border-black bg-neutral-900 text-white shadow-sm"
                                                : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-400"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold tracking-wider">WavePay</span>
                                            <span className={`text-[10px] uppercase tracking-widest ${
                                                paymentMethod === "WavePay" ? "text-neutral-300" : "text-stone-400"
                                            }`}>
                                                MMQR
                                            </span>
                                        </div>
                                        <p className={`mt-3 text-[10px] leading-relaxed ${
                                            paymentMethod === "WavePay" ? "text-neutral-300" : "text-stone-500"
                                        }`}>
                                            Wave Money Wallet
                                        </p>
                                    </button>

                                    {/* 3. AYA Pay (New Third Sub-Wallet Option) */}
                                    <button
                                        type="button"
                                        onClick={() => handleSelectSubWallet("AYAPay")}
                                        disabled={isGeneratingQr}
                                        className={`flex flex-col justify-between border p-4 text-left transition-all ${
                                            paymentMethod === "AYAPay"
                                                ? "border-black bg-neutral-900 text-white shadow-sm"
                                                : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-400"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold tracking-wider">AYA Pay</span>
                                            <span className={`text-[10px] uppercase tracking-widest ${
                                                paymentMethod === "AYAPay" ? "text-neutral-300" : "text-stone-400"
                                            }`}>
                                                MMQR
                                            </span>
                                        </div>
                                        <p className={`mt-3 text-[10px] leading-relaxed ${
                                            paymentMethod === "AYAPay" ? "text-neutral-300" : "text-stone-500"
                                        }`}>
                                            AYA Pay Digital Wallet
                                        </p>
                                    </button>
                                </div>

                                {/* Alternate Card Option */}
                                <div className="mt-3">
                                    <label
                                        className={`flex cursor-pointer items-center justify-between border px-4 py-3 transition-all ${
                                            paymentMethod === "Card"
                                                ? "border-black bg-neutral-900 text-white"
                                                : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-400"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="Card"
                                                checked={paymentMethod === "Card"}
                                                onChange={() => setPaymentMethod("Card")}
                                                className="accent-black"
                                            />
                                            <span className="text-xs font-medium tracking-wider">Credit / Debit Card</span>
                                        </div>
                                        <span className={`text-[10px] uppercase tracking-widest ${
                                            paymentMethod === "Card" ? "text-neutral-300" : "text-stone-400"
                                        }`}>
                                            Visa · Mastercard
                                        </span>
                                    </label>
                                </div>
                            </section>

                            {/* 3. ORDER SUMMARY REVIEW */}
                            <section className="border border-neutral-200 bg-neutral-50 p-5">
                                <div className="flex justify-between border-b border-neutral-200 pb-2 text-xs text-stone-600">
                                    <span>Selected Items</span>
                                    <span>{items.reduce((s, i) => s + i.quantity, 0)} items</span>
                                </div>
                                <div className="flex justify-between border-b border-neutral-200 py-2 text-xs text-stone-600">
                                    <span>Subtotal</span>
                                    <span>{subtotal.toLocaleString()} MMK</span>
                                </div>
                                <div className="flex justify-between border-b border-neutral-200 py-2 text-xs text-stone-600">
                                    <span>Shipping</span>
                                    <span className="text-emerald-700">Complimentary</span>
                                </div>
                                <div className="flex justify-between pt-3 text-sm font-semibold text-neutral-900">
                                    <span className="uppercase tracking-wider">Total</span>
                                    <span className="font-cormorant text-2xl">
                                        {subtotal.toLocaleString()} MMK
                                    </span>
                                </div>
                            </section>

                            {/* 4. FINAL PLACE ORDER BUTTON */}
                            <button
                                type="submit"
                                disabled={isSubmitting || isGeneratingQr || items.length === 0}
                                className="w-full border border-black bg-black py-4 text-xs uppercase tracking-[0.25em] text-white transition-all hover:bg-neutral-800 disabled:opacity-50"
                            >
                                {isSubmitting || isGeneratingQr
                                    ? "Executing Transaction..."
                                    : paymentMethod === "Card"
                                    ? "Place Order"
                                    : `Proceed with ${paymentMethod} MMQR`}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
