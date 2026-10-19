"use client";

import Link from "next/link";

interface ProfilePreviewProps {
    isAuthenticated: boolean;
    name?: string;
    email?: string;
    profilePic?: string | null;
    role?: string;
    onNavigate: () => void;
    onOpenLogin: () => void;
    onOpenRegister: () => void;
    onLogout: () => void;
}

export default function ProfilePreview({
    isAuthenticated,
    name,
    email,
    profilePic,
    role,
    onNavigate,
    onOpenLogin,
    onOpenRegister,
    onLogout,
}: ProfilePreviewProps) {
    return (
        <section
            aria-labelledby="menu-profile-heading"
            className="mx-auto w-full max-w-4xl px-6 py-8 sm:px-10 animate-luxury-fade-in"
        >
            {isAuthenticated ? (
                <div>
                    <div className="mb-6 flex items-end justify-between gap-4 border-b border-stone-200 pb-4">
                        <div>
                            <p className="mb-1 text-[10px] uppercase tracking-[0.3em] text-[#9d7952] font-medium">
                                Member Account
                            </p>
                            <h2
                                id="menu-profile-heading"
                                className="font-cormorant text-3xl tracking-wide text-[#263a31]"
                            >
                                Your Profile
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={onLogout}
                            className="shrink-0 text-xs uppercase tracking-[0.18em] text-stone-500 underline underline-offset-4 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                            Log Out
                        </button>
                    </div>

                    {/* Profile Summary Card */}
                    <div className="flex items-center gap-5 bg-white p-5 rounded-lg border border-stone-200/80 shadow-xs mb-8">
                        <div className="h-16 w-16 shrink-0 rounded-full overflow-hidden border border-stone-200 bg-stone-100 flex items-center justify-center">
                            {profilePic?.trim() ? (
                                <img
                                    src={profilePic}
                                    alt={name || "Profile"}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="font-cormorant text-2xl font-semibold text-[#263a31]">
                                    {name?.trim()?.charAt(0).toUpperCase() || "U"}
                                </span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3">
                                <h3 className="font-cormorant text-2xl font-normal text-stone-900 truncate">
                                    {name || "Valued Member"}
                                </h3>
                                {role === "Admin" && (
                                    <span className="px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-[#263a31] text-[#d3b58c]">
                                        Admin
                                    </span>
                                )}
                            </div>
                            {email && (
                                <p className="text-xs text-stone-500 truncate mt-0.5">
                                    {email}
                                </p>
                            )}
                        </div>
                        <Link
                            href="/profile"
                            onClick={onNavigate}
                            className="shrink-0 hidden sm:inline-block border border-stone-300 px-4 py-2 text-[10px] uppercase tracking-[0.18em] font-medium text-stone-700 hover:border-[#263a31] hover:text-[#263a31] transition-all"
                        >
                            Edit Profile
                        </Link>
                    </div>

                    {/* Navigation Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link
                            href="/profile"
                            onClick={onNavigate}
                            className="flex flex-col p-5 bg-white border border-stone-200/90 rounded-lg hover:border-[#9d7952] hover:shadow-xs transition-all group"
                        >
                            <span className="text-[10px] uppercase tracking-[0.25em] text-[#9d7952]">
                                Personal Info
                            </span>
                            <span className="font-cormorant text-xl text-stone-900 group-hover:text-[#263a31] mt-1">
                                Account Details
                            </span>
                            <span className="text-xs text-stone-500 mt-1 leading-relaxed">
                                Manage contact details, delivery addresses, and personal settings.
                            </span>
                        </Link>

                        <Link
                            href="/profile"
                            onClick={onNavigate}
                            className="flex flex-col p-5 bg-white border border-stone-200/90 rounded-lg hover:border-[#9d7952] hover:shadow-xs transition-all group"
                        >
                            <span className="text-[10px] uppercase tracking-[0.25em] text-[#9d7952]">
                                Purchases
                            </span>
                            <span className="font-cormorant text-xl text-stone-900 group-hover:text-[#263a31] mt-1">
                                My Orders
                            </span>
                            <span className="text-xs text-stone-500 mt-1 leading-relaxed">
                                Track active deliveries, review purchase history, and invoices.
                            </span>
                        </Link>

                        <Link
                            href="/wishLists"
                            onClick={onNavigate}
                            className="flex flex-col p-5 bg-white border border-stone-200/90 rounded-lg hover:border-[#9d7952] hover:shadow-xs transition-all group"
                        >
                            <span className="text-[10px] uppercase tracking-[0.25em] text-[#9d7952]">
                                Saved Items
                            </span>
                            <span className="font-cormorant text-xl text-stone-900 group-hover:text-[#263a31] mt-1">
                                Wishlist
                            </span>
                            <span className="text-xs text-stone-500 mt-1 leading-relaxed">
                                Review your saved designs, favorites, and planned purchases.
                            </span>
                        </Link>

                        {role === "Admin" && (
                            <Link
                                href="/admin"
                                onClick={onNavigate}
                                className="flex flex-col p-5 bg-white border border-[#263a31]/30 rounded-lg hover:border-[#263a31] hover:shadow-xs transition-all group"
                            >
                                <span className="text-[10px] uppercase tracking-[0.25em] text-[#263a31] font-semibold">
                                    Management
                                </span>
                                <span className="font-cormorant text-xl text-stone-900 group-hover:text-[#263a31] mt-1">
                                    Admin Dashboard
                                </span>
                                <span className="text-xs text-stone-500 mt-1 leading-relaxed">
                                    Manage inventory products, brand collections, orders, and reviews.
                                </span>
                            </Link>
                        )}
                    </div>
                </div>
            ) : (
                <div className="max-w-xl">
                    <div className="mb-6 border-b border-stone-200 pb-4">
                        <p className="mb-1 text-[10px] uppercase tracking-[0.3em] text-[#9d7952] font-medium">
                            Burma Collections Club
                        </p>
                        <h2
                            id="menu-profile-heading"
                            className="font-cormorant text-3xl tracking-wide text-[#263a31]"
                        >
                            Welcome & Sign In
                        </h2>
                    </div>

                    <p className="font-cormorant text-2xl text-stone-800 leading-snug">
                        Experience bespoke luxury, timeless style, and seamless shopping.
                    </p>
                    <p className="mt-3 text-xs leading-relaxed tracking-wide text-stone-500 font-light">
                        Sign in to track orders, save items to your wishlist, manage personal details, and enjoy an effortless shopping experience.
                    </p>

                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                        <button
                            type="button"
                            onClick={onOpenLogin}
                            className="px-8 py-3 bg-[#263a31] border border-[#263a31] text-xs uppercase tracking-[0.22em] font-medium text-white hover:bg-transparent hover:text-[#263a31] transition-all cursor-pointer"
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={onOpenRegister}
                            className="px-8 py-3 bg-transparent border border-stone-300 text-xs uppercase tracking-[0.22em] font-medium text-stone-800 hover:border-[#263a31] hover:text-[#263a31] transition-all cursor-pointer"
                        >
                            Create Account
                        </button>
                    </div>

                    <div className="mt-10 border-t border-stone-200 pt-6">
                        <p className="text-[11px] text-stone-400">
                            Looking to browse first? Explore our{" "}
                            <Link
                                href="/products"
                                onClick={onNavigate}
                                className="text-[#263a31] underline underline-offset-4 hover:text-[#9d7952] transition-colors"
                            >
                                curated catalog
                            </Link>
                            .
                        </p>
                    </div>
                </div>
            )}
        </section>
    );
}
