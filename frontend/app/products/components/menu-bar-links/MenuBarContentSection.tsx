"use client";

import React, { useState, useEffect, useRef } from "react";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import CategorySection from "@/app/products/components/menu-bar-links/CategorySection";
import NewestSection from "@/app/products/components/menu-bar-links/NewestSection";
import TrendingLink from "@/app/products/components/menu-bar-links/TrendingLink";
import HomeLink from "@/app/products/components/menu-bar-links/HomeLink";
import WishlistPreview from "@/app/products/components/wishlist/WishlistPreview";
import CartPreview from "@/app/products/components/menu-bar-links/CartPreview";
import ProfilePreview from "@/app/products/components/menu-bar-links/ProfilePreview";
import { useAppDispatch } from "@/lib/hooks";
import { logout } from "@/lib/features/auth/authSlice";
import { useAuth } from "@/app/products/hooks/useAuth";

interface MenuBarProps {
    isMenuOpen: boolean;
    setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setShowAuthForm: React.Dispatch<React.SetStateAction<boolean>>;
    setAuthMode?: React.Dispatch<React.SetStateAction<"Register" | "Login">>;
}

export default function MenuBarContentSection({
    isMenuOpen,
    setIsMenuOpen,
    setShowAuthForm,
    setAuthMode,
}: MenuBarProps) {
    const [activeTab, setActiveTab] = useState("");
    const dispatch = useAppDispatch();
    const { profilePic, name, email, isAuthenticated, role } = useAuth();
    const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const clearCloseTimer = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
    };

    const handleTabMouseEnter = (tab: string) => {
        clearCloseTimer();
        setActiveTab(tab);
    };

    const handleTabFocus = (tab: string) => {
        clearCloseTimer();
        setActiveTab(tab);
    };

    const scheduleClose = () => {
        clearCloseTimer();
        closeTimeoutRef.current = setTimeout(() => {
            setActiveTab("");
        }, 220);
    };

    const handlePanelMouseEnter = () => {
        clearCloseTimer();
    };

    const handlePanelMouseLeave = () => {
        scheduleClose();
    };

    const closeButtonHandler = () => {
        clearCloseTimer();
        setIsMenuOpen(false);
        setActiveTab("");
    };

    const LogInBtnHandler = () => {
        closeButtonHandler();
        if (setAuthMode) {
            setAuthMode("Login");
        }
        setShowAuthForm(true);
    };

    const RegisterBtnHandler = () => {
        closeButtonHandler();
        if (setAuthMode) {
            setAuthMode("Register");
        }
        setShowAuthForm(true);
    };

    const logoutBtnHandler = () => {
        dispatch(logout());
        closeButtonHandler();
    };

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = "hidden";
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === "Escape") {
                    closeButtonHandler();
                }
            };
            window.addEventListener("keydown", handleKeyDown);
            return () => {
                document.body.style.overflow = "auto";
                clearCloseTimer();
                window.removeEventListener("keydown", handleKeyDown);
            };
        } else {
            document.body.style.overflow = "auto";
            clearCloseTimer();
            setActiveTab("");
        }

        return () => {
            document.body.style.overflow = "auto";
            clearCloseTimer();
        };
    }, [isMenuOpen]);

    const renderRightPanel = () => {
        switch (activeTab) {
            case "Home":
                return <HomeLink />;
            case "Products":
                return <CategorySection onNavigate={closeButtonHandler} />;
            case "Newest":
                return <NewestSection />;
            case "Trending":
                return <TrendingLink />;
            case "Wishlist":
                return (
                    <WishlistPreview
                        isAuthenticated={isAuthenticated}
                        onNavigate={closeButtonHandler}
                    />
                );
            case "Cart":
                return (
                    <CartPreview
                        isAuthenticated={isAuthenticated}
                        onNavigate={closeButtonHandler}
                        onOpenAuth={LogInBtnHandler}
                    />
                );
            case "Profile":
                return (
                    <ProfilePreview
                        isAuthenticated={isAuthenticated}
                        name={name}
                        email={email}
                        profilePic={profilePic}
                        role={role}
                        onNavigate={closeButtonHandler}
                        onOpenLogin={LogInBtnHandler}
                        onOpenRegister={RegisterBtnHandler}
                        onLogout={logoutBtnHandler}
                    />
                );
            case "Admin":
                return (
                    <section
                        aria-labelledby="menu-admin-heading"
                        className="mx-auto w-full max-w-4xl px-6 py-8 sm:px-10 animate-luxury-fade-in"
                    >
                        <div className="mb-6 border-b border-stone-200 pb-4">
                            <p className="mb-1 text-[10px] uppercase tracking-[0.3em] text-[#9d7952] font-medium">
                                Store Administration
                            </p>
                            <h2
                                id="menu-admin-heading"
                                className="font-cormorant text-3xl tracking-wide text-[#263a31]"
                            >
                                Admin Dashboard
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link
                                href="/admin"
                                onClick={closeButtonHandler}
                                className="flex flex-col p-5 bg-white border border-stone-200 rounded-lg hover:border-[#263a31] transition-all group"
                            >
                                <span className="text-[10px] uppercase tracking-[0.2em] text-[#9d7952]">
                                    Overview
                                </span>
                                <h3 className="font-cormorant text-xl text-stone-900 group-hover:text-[#263a31] mt-1">
                                    Store Performance & Management
                                </h3>
                                <p className="text-xs text-stone-500 mt-1">
                                    Review user accounts, order status, and brand collections.
                                </p>
                            </Link>
                            <Link
                                href="/admin/products/create"
                                onClick={closeButtonHandler}
                                className="flex flex-col p-5 bg-white border border-stone-200 rounded-lg hover:border-[#263a31] transition-all group"
                            >
                                <span className="text-[10px] uppercase tracking-[0.2em] text-[#9d7952]">
                                    Inventory
                                </span>
                                <h3 className="font-cormorant text-xl text-stone-900 group-hover:text-[#263a31] mt-1">
                                    Create New Product
                                </h3>
                                <p className="text-xs text-stone-500 mt-1">
                                    Publish luxury pieces, set head-categories, sizes, and pricing.
                                </p>
                            </Link>
                        </div>
                    </section>
                );
            default:
                return (
                    <div className="mx-auto mt-24 flex max-w-xl flex-col items-center justify-center px-6 text-center animate-luxury-fade-in">
                        <span className="text-[10px] uppercase tracking-[0.45em] text-[#9d7952] font-medium">
                            01 / Studio Overview
                        </span>
                        <h3 className="mt-4 font-cormorant text-3xl sm:text-5xl font-light text-neutral-900 tracking-wide">
                            Burma Collections
                        </h3>
                        <p className="mt-5 text-xs font-light leading-relaxed tracking-[0.2em] text-neutral-500 max-w-lg">
                            Hover over any category or section to explore our curated collections, wishlist, shopping bag, and personal account.
                        </p>
                    </div>
                );
        }
    };

    return (
        <div
            className={`fixed inset-0 z-[100] h-dvh bg-white transition-[transform,visibility] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
                isMenuOpen ? "translate-x-0 visible pointer-events-auto" : "-translate-x-full invisible pointer-events-none"
            }`}
        >
            <div className="grid h-full grid-cols-12">
                {/* Left Navigation Column */}
                <div
                    className="col-span-4 flex flex-col items-start justify-around gap-5 border-r border-gray-200 px-3 sm:col-span-3 sm:gap-8 sm:pl-5 md:col-span-2"
                    onMouseLeave={scheduleClose}
                >
                    <button
                        aria-label="Close navigation menu"
                        onClick={closeButtonHandler}
                        className="cursor-pointer text-gray-900 transition-colors duration-300 hover:text-gray-400 pt-3"
                    >
                        <CloseIcon className="!text-[34px]" />
                    </button>

                    {/* Profile Header Widget */}
                    <div
                        className="w-full cursor-pointer"
                        onMouseEnter={() => handleTabMouseEnter("Profile")}
                        onFocus={() => handleTabFocus("Profile")}
                    >
                        <div className="flex gap-4 items-center hover:text-gray-400 transition-colors">
                            {isAuthenticated ? (
                                profilePic?.trim() ? (
                                    <img
                                        src={profilePic}
                                        alt="Profile"
                                        className="h-8 w-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="h-8 w-8 rounded-full bg-gray-500 text-gray-100 flex items-center justify-center text-sm font-bold uppercase">
                                        {name?.trim()?.charAt(0) || "U"}
                                    </span>
                                )
                            ) : (
                                <button
                                    type="button"
                                    onClick={LogInBtnHandler}
                                    className="bg-[#263a31] text-white w-full py-2 rounded-lg mr-5 cursor-pointer hover:bg-[#344d42] transition-colors text-xs uppercase tracking-[0.2em] font-medium"
                                >
                                    Log in
                                </button>
                            )}
                            {isAuthenticated && (
                                <span className="text-base font-semibold truncate text-gray-900">
                                    {name}
                                </span>
                            )}
                        </div>
                        <hr className="w-[90%] mt-2 flex justify-center border-gray-300" />
                    </div>

                    {/* Navigation Links */}
                    <div className="flex flex-col justify-center items-start gap-6 tracking-[0.25em]">
                        <Link
                            href="/"
                            onClick={closeButtonHandler}
                            onMouseEnter={() => handleTabMouseEnter("Home")}
                            onFocus={() => handleTabFocus("Home")}
                            className={`transition-colors duration-300 relative py-1 group ${
                                activeTab === "Home" ? "text-gray-950 font-medium" : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            Home
                            <span
                                className={`absolute bottom-0 left-0 h-[1px] bg-gray-900 transition-all duration-300 ${
                                    activeTab === "Home" ? "w-full" : "w-0 group-hover:w-full"
                                }`}
                            />
                        </Link>

                        <Link
                            href="/products"
                            onClick={closeButtonHandler}
                            onMouseEnter={() => handleTabMouseEnter("Products")}
                            onFocus={() => handleTabFocus("Products")}
                            className={`transition-colors duration-300 relative py-1 group ${
                                activeTab === "Products" ? "text-gray-950 font-medium" : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            Products
                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-[10px] font-semibold text-[#1e584a] bg-[#d1f5ea] border border-[#a3e9d5] rounded-full tracking-wide ml-2">
                                Categories
                            </span>
                            <span
                                className={`absolute bottom-0 left-0 h-[1px] bg-gray-900 transition-all duration-300 ${
                                    activeTab === "Products" ? "w-full" : "w-0 group-hover:w-full"
                                }`}
                            />
                        </Link>

                        <Link
                            href="/products"
                            onClick={closeButtonHandler}
                            onMouseEnter={() => handleTabMouseEnter("Trending")}
                            onFocus={() => handleTabFocus("Trending")}
                            className={`transition-colors duration-300 relative py-1 group ${
                                activeTab === "Trending" ? "text-gray-950 font-medium" : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            Trending
                            <span
                                className={`absolute bottom-0 left-0 h-[1px] bg-gray-900 transition-all duration-300 ${
                                    activeTab === "Trending" ? "w-full" : "w-0 group-hover:w-full"
                                }`}
                            />
                        </Link>

                        <Link
                            href="/products"
                            onClick={closeButtonHandler}
                            onMouseEnter={() => handleTabMouseEnter("Newest")}
                            onFocus={() => handleTabFocus("Newest")}
                            className={`transition-colors duration-300 relative py-1 group ${
                                activeTab === "Newest" ? "text-gray-950 font-medium" : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            Newest
                            <span
                                className={`absolute bottom-0 left-0 h-[1px] bg-gray-900 transition-all duration-300 ${
                                    activeTab === "Newest" ? "w-full" : "w-0 group-hover:w-full"
                                }`}
                            />
                        </Link>

                        <Link
                            href="/wishLists"
                            onClick={closeButtonHandler}
                            onMouseEnter={() => handleTabMouseEnter("Wishlist")}
                            onFocus={() => handleTabFocus("Wishlist")}
                            className={`transition-colors duration-300 relative py-1 group ${
                                activeTab === "Wishlist" ? "text-gray-950 font-medium" : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            WishList
                            <span
                                className={`absolute bottom-0 left-0 h-[1px] bg-gray-900 transition-all duration-300 ${
                                    activeTab === "Wishlist" ? "w-full" : "w-0 group-hover:w-full"
                                }`}
                            />
                        </Link>

                        {isAuthenticated && role === "Admin" && (
                            <Link
                                href="/admin"
                                onClick={closeButtonHandler}
                                onMouseEnter={() => handleTabMouseEnter("Admin")}
                                onFocus={() => handleTabFocus("Admin")}
                                className={`transition-colors duration-300 relative py-1 group ${
                                    activeTab === "Admin" ? "text-gray-950 font-medium" : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                Admin Dashboard
                                <span
                                    className={`absolute bottom-0 left-0 h-[1px] bg-gray-900 transition-all duration-300 ${
                                        activeTab === "Admin" ? "w-full" : "w-0 group-hover:w-full"
                                    }`}
                                />
                            </Link>
                        )}

                        <Link
                            href="/cart"
                            onClick={closeButtonHandler}
                            onMouseEnter={() => handleTabMouseEnter("Cart")}
                            onFocus={() => handleTabFocus("Cart")}
                            className={`transition-colors duration-300 relative py-1 group ${
                                activeTab === "Cart" ? "text-gray-950 font-medium" : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            Shopping Cart
                            <span
                                className={`absolute bottom-0 left-0 h-[1px] bg-gray-900 transition-all duration-300 ${
                                    activeTab === "Cart" ? "w-full" : "w-0 group-hover:w-full"
                                }`}
                            />
                        </Link>

                        <Link
                            href="/profile"
                            onClick={closeButtonHandler}
                            onMouseEnter={() => handleTabMouseEnter("Profile")}
                            onFocus={() => handleTabFocus("Profile")}
                            className={`transition-colors duration-300 relative py-1 group ${
                                activeTab === "Profile" ? "text-gray-950 font-medium" : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            Profile
                            <span
                                className={`absolute bottom-0 left-0 h-[1px] bg-gray-900 transition-all duration-300 ${
                                    activeTab === "Profile" ? "w-full" : "w-0 group-hover:w-full"
                                }`}
                            />
                        </Link>
                    </div>

                    <div className="w-full flex justify-end pr-5">
                        {isAuthenticated && (
                            <button
                                type="button"
                                onClick={logoutBtnHandler}
                                className="bg-red-500 text-white w-full py-2 rounded-lg cursor-pointer hover:bg-red-600 transition-colors text-xs uppercase tracking-[0.2em] font-medium"
                            >
                                Log out
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Content Panel */}
                <div
                    className="col-span-8 overflow-y-auto bg-[#F5F8FF] sm:col-span-9 md:col-span-10"
                    onMouseEnter={handlePanelMouseEnter}
                    onMouseLeave={handlePanelMouseLeave}
                >
                    <Typography className="!text-3xl text-center py-5 uppercase !tracking-[0.3em] !font-light text-stone-800">
                        Burma Collections
                    </Typography>
                    <div key={activeTab || "default"} className="animate-luxury-fade-in">
                        {renderRightPanel()}
                    </div>
                </div>
            </div>
        </div>
    );
}
