"use client";
import React, { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from "next/navigation";
import MenuIcon from '@mui/icons-material/Menu';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import Typography from "@mui/material/Typography";
import MenuBarContentSection from "@/app/products/components/menu-bar-links/MenuBarContentSection";
import SearchIcon from "@mui/icons-material/Search";
import LoginForm from "@/app/products/components/Form/LoginForm";
import RegisterForm from "@/app/products/components/Form/RegisterForm";
import {useAuth} from "@/app/products/hooks/useAuth";
import ProfileDetailCard from "@/app/products/components/Form/ProfileDetailCard";
import ProfileButton from "@/app/products/components/buttons/ProfileButton";
import CloseIcon from "@mui/icons-material/Close";
import { AUTH_LOGIN_REQUEST_EVENT } from "@/lib/features/auth/authEvents";

interface AuthFormProps {
    showAuthForm: boolean;
    authMode: string;
    setShowAuthForm:React.Dispatch<React.SetStateAction<boolean>>;
    setAuthMode: React.Dispatch<
        React.SetStateAction<"Register" | "Login">
    >;
}

function AuthForm({
                      showAuthForm,
                      authMode,
                      setShowAuthForm,
                      setAuthMode,
                  }: AuthFormProps) {
    if (!showAuthForm) return null;

    return authMode === "Register" ? (
        <RegisterForm
            setAuthMode={setAuthMode}
            showAuthForm={showAuthForm}
            setShowAuthForm={setShowAuthForm}
        />
    ) : (
        <LoginForm
            setAuthMode={setAuthMode}
            showAuthForm={showAuthForm}
            setShowAuthForm={setShowAuthForm}
        />
    );
}


export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showAuthForm, setShowAuthForm] = useState(false);
    const [authMode , setAuthMode] = useState<"Register"|"Login">("Register");
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const router = useRouter();
    const {profilePic,isAuthenticated} = useAuth();

    useEffect(() => {
        const openLoginForm = () => {
            setAuthMode("Login");
            setShowAuthForm(true);
        };
        window.addEventListener(AUTH_LOGIN_REQUEST_EVENT, openLoginForm);
        return () => window.removeEventListener(AUTH_LOGIN_REQUEST_EVENT, openLoginForm);
    }, []);

    console.log("profilePic", profilePic);

    const menuButtonHandler = ()=>{
        setIsMenuOpen(true);
    }

    const AuthFormHandler = () =>{
        if (isAuthenticated) {
            router.push("/profile");
            return;
        }
        setAuthMode("Login");
        setShowAuthForm(true);
    }

    const submitSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const query = searchTerm.trim();
        if (!query) return;
        setSearchOpen(false);
        router.push(`/products?q=${encodeURIComponent(query)}`);
    };

    return (
        <>
            <nav className="w-full sticky top-0 left-0 z-[50] border-b border-[#e5e0d6] py-5 bg-[#fbfaf7]/95 backdrop-blur-md"
            >
                <div className="relative max-w-full mx-auto px-6 grid grid-cols-12 items-center">

                    <div className="flex items-center gap-4 col-span-1 lg:col-span-4">
                        <button aria-label="Open navigation menu"
                                onClick={menuButtonHandler}
                            className="text-[#263a31] transition-colors duration-300 hover:text-[#9d7952] cursor-pointer"
                        >
                            <MenuIcon className="!text-[24px] sm:!text-[28px] lg:!text-[34px]"/>
                        </button>
                        <div className="hidden lg:flex items-center gap-6 text-[10px] tracking-[0.22em] text-[#77796f] uppercase">
                            <a href="/" className="hover:text-[#263a31] transition-colors duration-300 relative py-1 group">
                                Home
                                <span className="absolute bottom-0 left-0 w-0 h-px bg-[#9d7952] transition-all duration-300 group-hover:w-full"></span>
                            </a>
                            <a href="/products" className="text-[#263a31] relative py-1 group">
                                Products
                                <span className="absolute bottom-0 left-0 w-full h-px bg-[#9d7952]"></span>
                            </a>
                            <a href="#newsletter" className="hover:text-[#263a31] transition-colors duration-300 relative py-1 group">
                                Newsletter
                                <span className="absolute bottom-0 left-0 w-0 h-px bg-[#9d7952] transition-all duration-300 group-hover:w-full"></span>
                            </a>
                        </div>
                    </div>

                    <Typography
                        className="col-span-8 lg:col-span-5 !font-[family-name:var(--font-cormorant)] !text-base sm:!text-xl md:!text-2xl !font-medium !tracking-[0.12em] !text-[#263a31] uppercase !text-start lg:!text-center"
                    >
                        Burma Collections
                    </Typography>

                    <div className="absolute right-5 col-span-3 lg:col-span-3 flex items-center gap-3 md:gap-6 text-[#263a31]">
                        <button type="button" aria-label="Search products" aria-expanded={searchOpen} onClick={() => setSearchOpen((open) => !open)} className="cursor-pointer hover:text-[#9d7952] transition-colors">
                            <SearchIcon className="!text-[24px] sm:!text-[28px] lg:!text-[34px]"/>
                        </button>

                        <a href="/wishLists" aria-label="View Wishlist" className="cursor-pointer hover:text-gray-400 transition-colors">
                            <FavoriteBorderIcon className="sm:!text-[28px] lg:!text-[34px]"/>
                        </a>

                        <a href="/cart" aria-label="Open Shopping Bag" className="cursor-pointer hover:text-gray-400 transition-colors">
                            <ShoppingBagIcon className="!text-[24px] sm:!text-[28px] lg:!text-[34px]" />
                        </a>
                        <ProfileButton pfBtnHandler={AuthFormHandler}/>

                    </div>
                </div>
            </nav>
            {searchOpen && <div className="fixed inset-0 z-[60] bg-black/35 backdrop-blur-xs px-4 pt-28 sm:px-8 animate-luxury-fade-in" onMouseDown={(event) => { if (event.target === event.currentTarget) setSearchOpen(false); }}>
                <section role="dialog" aria-modal="true" aria-label="Search products" className="mx-auto max-w-3xl border border-[#e8e3da] bg-[#fffefa] p-5 shadow-2xl sm:p-8 animate-luxury-scale-in">
                    <div className="mb-6 flex items-center justify-between"><p className="text-[10px] uppercase tracking-[0.25em] text-stone-500">Find your next favorite</p><button type="button" aria-label="Close search" onClick={() => setSearchOpen(false)} className="rounded-full p-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-black"><CloseIcon fontSize="small" /></button></div>
                    <form onSubmit={submitSearch} className="flex items-center gap-3 border-b border-[#293a32] pb-3 sm:gap-5">
                        <SearchIcon aria-hidden="true" className="!text-2xl text-[#687168]" />
                        <label htmlFor="site-product-search" className="sr-only">Search product names and brands</label>
                        <input id="site-product-search" autoFocus required value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") setSearchOpen(false); }} placeholder="Search pieces or brands" className="min-w-0 flex-1 bg-transparent py-2 text-base text-[#293a32] outline-none placeholder:text-stone-400 sm:text-lg" />
                        <button type="submit" className="shrink-0 text-[10px] uppercase tracking-[0.18em] text-[#293a32] hover:text-stone-500">Search</button>
                    </form>
                    <p className="mt-4 text-xs text-stone-400">Search the collection by product name or brand.</p>
                </section>
            </div>}
            <MenuBarContentSection
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
                setShowAuthForm={setShowAuthForm}
                setAuthMode={setAuthMode}
            />
            {
                showAuthForm && (
                isAuthenticated ? <ProfileDetailCard showAuthForm={showAuthForm} setShowAuthForm={setShowAuthForm} /> : <AuthForm showAuthForm={showAuthForm} authMode={authMode} setShowAuthForm={setShowAuthForm} setAuthMode={setAuthMode}/>
                )
            }
        </>
    );
}
