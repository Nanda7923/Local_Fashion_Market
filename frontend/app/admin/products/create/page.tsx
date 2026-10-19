"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Alert, Button, CircularProgress } from "@mui/material";
import UploadedProduct from "@/app/products/components/UploadedProduct";
import { useAuth } from "@/app/products/hooks/useAuth";
import { logout, selectAuthInitialized } from "@/lib/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { hasUnexpiredToken } from "@/util/jwt";

export default function CreateProductPage() {
    const { token, role } = useAuth();
    const authInitialized = useAppSelector(selectAuthInitialized);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (authInitialized && token && !hasUnexpiredToken(token)) {
            dispatch(logout());
        }
    }, [authInitialized, token, dispatch]);

    if (!authInitialized) {
        return <div className="flex min-h-screen items-center justify-center"><CircularProgress aria-label="Checking login" /></div>;
    }

    if (!token || !hasUnexpiredToken(token)) {
        return (
            <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 p-6 text-center">
                <Alert severity="info">Log in with an Admin account to create products. Open the account menu from the products page to log in.</Alert>
                <Button component={Link} href="/products" variant="contained">Go to Products and Log In</Button>
            </main>
        );
    }

    if (role !== "Admin") {
        return (
            <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 p-6 text-center">
                <Alert severity="error">Admin access is required to create products.</Alert>
                <Button component={Link} href="/products" variant="outlined">Back to Products</Button>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#fdfcfb]">
            <div className="mx-auto flex max-w-[1440px] justify-end px-5 pt-6 sm:px-8 lg:px-14">
                <Button component={Link} href="/products" variant="text" className="!text-[10px] !uppercase !tracking-[0.16em] !text-[#77736d]">
                    Back to Products
                </Button>
            </div>
            <UploadedProduct initiallyOpen />
        </main>
    );
}
