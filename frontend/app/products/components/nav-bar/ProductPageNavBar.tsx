"use client";

import { useEffect, useState } from "react";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Typography from "@mui/material/Typography";
import { useRouter } from 'next/navigation';
import LoginForm from "@/app/products/components/Form/LoginForm";
import RegisterForm from "@/app/products/components/Form/RegisterForm";
import { AUTH_LOGIN_REQUEST_EVENT } from "@/lib/features/auth/authEvents";


export default function ProductPageNavBar(){
    const [showAuthForm, setShowAuthForm] = useState(false);
    const [authMode, setAuthMode] = useState<"Register" | "Login">("Login");
    const router = useRouter();
    useEffect(() => {
        const openLoginForm = () => {
            setAuthMode("Login");
            setShowAuthForm(true);
        };
        window.addEventListener(AUTH_LOGIN_REQUEST_EVENT, openLoginForm);
        return () => window.removeEventListener(AUTH_LOGIN_REQUEST_EVENT, openLoginForm);
    }, []);
    const backHandler = ()=>{
        router.push("/");
    }
    return (
        <>
        <nav className="sticky top-0 z-50 w-full border-b border-neutral-100 bg-white/80 backdrop-blur-md">
            <div className="relative flex h-16 w-full items-center justify-center px-6 sm:px-10">
                <button
                    aria-label="Go back"
                    className="absolute left-6 cursor-pointer text-neutral-700 transition-opacity duration-300 hover:opacity-50 sm:left-10"
                    onClick={backHandler}
                >
                    <ArrowBackIcon className="!text-[28px]" />
                </button>

                <Typography className="pointer-events-none select-none !text-center !text-xs !font-light !uppercase !tracking-[0.4em] text-neutral-900">
                    Burma Collections
                </Typography>
            </div>
        </nav>
        {showAuthForm && (authMode === "Login"
            ? <LoginForm showAuthForm={showAuthForm} setShowAuthForm={setShowAuthForm} setAuthMode={setAuthMode} />
            : <RegisterForm showAuthForm={showAuthForm} setShowAuthForm={setShowAuthForm} setAuthMode={setAuthMode} />)}
        </>
    )
}
