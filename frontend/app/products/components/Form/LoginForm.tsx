"use client";

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {LoginData, LoginSchema} from "@/app/schema/authSchema";
import {Alert, Button, Card, Checkbox, CircularProgress, TextField, Typography} from "@mui/material";
import {Close, Visibility, VisibilityOff} from '@mui/icons-material';
import React, {useState} from "react";
import {login, selectAuthStatus} from "@/lib/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";


export interface AuthProps {
    showAuthForm : boolean;
    setShowAuthForm: React.Dispatch<React.SetStateAction<boolean>>;
    setAuthMode: React.Dispatch<React.SetStateAction<"Register" | "Login">>;
}

export default function LoginForm({showAuthForm , setShowAuthForm, setAuthMode}: AuthProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const dispatch = useAppDispatch();
    const authStatus = useAppSelector(selectAuthStatus);
    const isSubmitting = authStatus === "loading";

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginData>({
        resolver: zodResolver(LoginSchema)
    });

    const onSubmit = async (data : LoginData ) => {
        try {
            setServerError(null);
            await dispatch(login(data)).unwrap();
            setShowAuthForm(false);
        } catch (error: unknown) {
            const message = typeof error === "string" ? error : (error as { message?: string })?.message || "Login failed";
            setServerError(message);
        }
    };

    const handleClose = () => {
        setServerError(null);
        setShowAuthForm(false);
    };

    const handleSwitchToRegister = () => {
        setServerError(null);
        setAuthMode("Register");
    };

    React.useEffect(() => {
        if (!showAuthForm) {
            setServerError(null);
            return;
        }
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [showAuthForm]);

    return (
        <div
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
            className={`fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-xs px-4 transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                showAuthForm ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
        >
            <Card className={`relative z-10 w-full max-w-[450px] rounded-2xl bg-white p-10 !shadow-2xl transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none transform ${
                showAuthForm ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]"
            }`}>
                <button type="button" className="absolute right-4 top-4 text-gray-400 hover:text-gray-950 transition-colors cursor-pointer" onClick={handleClose}>
                    <Close className="h-5 w-5" />
                </button>
                <Typography
                    variant="h6"
                    className="!mt-2 !mb-6 text-center !font-normal text-gray-800 tracking-wide"
                >
                    Login
                </Typography>
                {serverError && (
                    <Alert severity="error" className="!mb-4 !text-xs">
                        {serverError}
                    </Alert>
                )}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="relative">
                        <TextField label="Email"
                                   variant="outlined"
                                   disabled={isSubmitting}
                                   {...register("email")}
                                    error={!!errors.email}
                                    helperText={errors?.email?.message}
                                   className="w-full border border-gray-300 pr-12 pl-4 py-3 text-sm focus:border-black focus:outline-none placeholder-gray-500"/>
                    </div>

                    <div className="relative">
                        <TextField label="password"
                                   type={showPassword ? "text" : "password"}
                                   variant="outlined"
                                   disabled={isSubmitting}
                                   {...register("password")}
                                   error={!!errors.password}
                                   helperText={errors?.password?.message}
                                   className="w-full border border-gray-300 pr-12 pl-4 py-3 text-sm focus:border-black focus:outline-none placeholder-gray-500"/>
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3 text-gray-400 hover:text-gray-800 z-10 cursor-pointer">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs sm:text-sm">
                        <label className="flex gap-2 items-center space-x-2 text-gray-600 select-none cursor-pointer">
                            <Checkbox
                                disabled={isSubmitting}
                                className="!h-4 !w-4 rounded-none !border-gray-300 !text-black !focus:ring-0 !accent-black cursor-pointer"
                            />
                            <span>Remember me</span>
                        </label>
                        <a
                            href="#"
                            className="text-gray-800 hover:underline transition-all"
                        >
                            Forgot password?
                        </a>
                    </div>

                    <div className="pt-2">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full !bg-[#262626] py-3 text-center text-sm font-medium !text-white !transition-colors !duration-200 hover:!bg-black !uppercase !tracking-wider disabled:!opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <CircularProgress size={16} className="!text-white" />
                                    <span>Logging in...</span>
                                </>
                            ) : (
                                "Log in"
                            )}
                        </Button>
                    </div>

                    <div className="pt-4 text-center text-sm text-gray-600">
                        <span>Don't have an account?</span>
                        <Button
                            type="button"
                            disabled={isSubmitting}
                            onClick={handleSwitchToRegister}
                            className="ms-1 font-semibold text-gray-800 hover:text-black hover:underline transition-colors cursor-pointer"
                        >
                            Register
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
};
