"use client";
import {useForm, Controller} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import { RegisterFormData, RegisterSchema} from "@/app/schema/authSchema";
import {Alert, Button, Card, CircularProgress, TextField, Typography} from "@mui/material";
import {Close, Visibility, VisibilityOff} from '@mui/icons-material';
import {useState, useEffect} from "react";
import {AuthProps} from "@/app/products/components/Form/LoginForm";
import {useAppDispatch, useAppSelector} from "@/lib/hooks";
import {registerUser, loginWithGoogle, selectAuthStatus} from "@/lib/features/auth/authSlice";
import {signInWithGoogle} from "@/lib/firebase/googleAuth";

export default function RegisterForm({showAuthForm , setShowAuthForm, setAuthMode}: AuthProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [uploading, setUploading] = useState<boolean>(false);
    const [uploadedUrl, setUploadedUrl] = useState<string>('');
    const [serverError, setServerError] = useState<string | null>(null);
    const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
    const dispatch = useAppDispatch();
    const authStatus = useAppSelector(selectAuthStatus);
    const isSubmitting = authStatus === "loading";

    const {
        control,
        handleSubmit,
        setValue,
        reset,
        formState: {errors},
    } = useForm<RegisterFormData>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            profilePic: "",
        },
    });

    const onSubmit = async (data: RegisterFormData) => {
        setServerError(null);
        const { confirmPassword, ...registerPayload } = data;
        const result = await dispatch(registerUser(registerPayload));
        if (registerUser.fulfilled.match(result)) {
            reset({
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
                profilePic: "",
            });
            setUploadedUrl('');
            setShowAuthForm(false);
        } else {
            const errorMsg = (result.payload as string) || "Registration failed";
            setServerError(errorMsg);
        }
    };

    const handleGoogleSignIn = async () => {
        if (isSubmitting || uploading || isGoogleLoading) return;
        setServerError(null);
        setIsGoogleLoading(true);
        try {
            const { idToken } = await signInWithGoogle();
            const result = await dispatch(loginWithGoogle(idToken));
            if (loginWithGoogle.fulfilled.match(result)) {
                reset({
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    profilePic: "",
                });
                setUploadedUrl('');
                setShowAuthForm(false);
            } else {
                const errorMsg = (result.payload as string) || "Google sign-in failed";
                setServerError(errorMsg);
            }
        } catch (error: unknown) {
            const firebaseError = error as { code?: string; message?: string };
            if (firebaseError?.code === "auth/popup-closed-by-user" || firebaseError?.code === "auth/cancelled-popup-request") {
                return;
            }
            const errorMsg = firebaseError?.message || "Google sign-in failed";
            setServerError(errorMsg);
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleClose = () => {
        setServerError(null);
        setShowAuthForm(false);
    };

    const handleSwitchToLogin = () => {
        setServerError(null);
        setAuthMode("Login");
    };

    useEffect(() => {
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

    const profileChangeHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setUploading(true);
        setServerError(null);

        const formData = new FormData();
        formData.append('profilePic', file);

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const response = await fetch(`${baseUrl}/upload/profile`, {
                method: 'POST',
                body: formData
            });

            const text = await response.text();
            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status}`);
            }

            const result = JSON.parse(text);
            if (result.urls && result.urls.length > 0) {
                const imageUrl = result.urls[0];

                setUploadedUrl(imageUrl);
                setValue("profilePic", imageUrl);
            } else {
                setServerError(result.message || "Upload failed");
            }
        } catch (error) {
            setServerError(error instanceof Error ? error.message : "Profile upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
            className={`fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-xs px-4 transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                showAuthForm ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
        >
            <Card className={`relative w-full max-w-[450px] rounded-2xl bg-white p-10 !shadow-2xl transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none transform ${
                showAuthForm ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]"
            }`}>
                <button type="button" className="absolute right-4 top-4 text-gray-400 hover:text-gray-950 transition-colors cursor-pointer" onClick={handleClose}>
                    <Close className="h-5 w-5" />
                </button>
                <Typography
                    variant="h6"
                    className="!mb-6 text-center !font-normal text-gray-800 uppercase tracking-wide"
                >
                    Create A New Account
                </Typography>
                {serverError && (
                    <Alert severity="error" className="!mb-4 !text-xs">
                        {serverError}
                    </Alert>
                )}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                    <div className="flex flex-col items-center justify-center space-y-2 pb-4">

                        <div className="relative group w-28 h-28 flex-shrink-0 aspect-square">
                            <input
                                type="file"
                                accept="image/*"
                                id="avatar-upload"
                                className="hidden"
                                disabled={uploading || isSubmitting || isGoogleLoading}
                                onChange={profileChangeHandler}
                            />

                            <label
                                htmlFor="avatar-upload"
                                className={`absolute inset-0 w-full h-full rounded-full flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all duration-300 border-2 border-gray-200 hover:border-gray-400 bg-gray-100 shadow-sm
                                ${uploading || isSubmitting || isGoogleLoading ? 'opacity-70 pointer-events-none' : ''}`}
                            >

                                {uploadedUrl ? (
                                    <img
                                        src={uploadedUrl}
                                        alt="Profile Preview"
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-6 h-6 mb-0.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                                        </svg>
                                        <span className="text-[10px] uppercase font-bold tracking-wider">Profile</span>
                                    </>
                                )}

                                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full">
                                    {uploading ? (
                                        <span className="text-xs font-medium animate-pulse">Saving...</span>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-6 h-6 mb-0.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                                            </svg>
                                            <span className="text-[10px] uppercase font-bold tracking-wider">Profile</span>
                                        </>
                                    )}
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="relative">
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="UserName"
                                    variant="outlined"
                                    disabled={isSubmitting || uploading || isGoogleLoading}
                                    error={!!errors.name}
                                    helperText={errors?.name?.message}
                                    className="w-full border border-gray-300 pr-12 pl-4 py-3 text-sm focus:border-black focus:outline-none placeholder-gray-500"
                                />
                            )}
                        />
                    </div>

                    <div className="relative">
                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Email"
                                    variant="outlined"
                                    disabled={isSubmitting || uploading || isGoogleLoading}
                                    error={!!errors.email}
                                    helperText={errors?.email?.message}
                                    className="w-full border border-gray-300 pr-12 pl-4 py-3 text-sm focus:border-black focus:outline-none placeholder-gray-500"
                                />
                            )}
                        />
                    </div>

                    <div className="relative">
                        <Controller
                            name="password"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Password"
                                    type={showPassword ? "text" : "password"}
                                    variant="outlined"
                                    disabled={isSubmitting || uploading || isGoogleLoading}
                                    error={!!errors.password}
                                    helperText={errors?.password?.message}
                                    className="w-full border border-gray-300 pr-12 pl-4 py-3 text-sm focus:border-black focus:outline-none placeholder-gray-500"
                                />
                            )}
                        />
                        <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3 text-gray-400 hover:text-gray-800 z-10 cursor-pointer">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </button>
                    </div>

                    <div className="relative">
                        <Controller
                            name="confirmPassword"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Confirm Password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    variant="outlined"
                                    disabled={isSubmitting || uploading || isGoogleLoading}
                                    error={!!errors.confirmPassword}
                                    helperText={errors?.confirmPassword?.message}
                                    className="w-full border border-gray-300 pr-12 pl-4 py-3 text-sm focus:border-black focus:outline-none placeholder-gray-500"
                                />
                            )}
                        />
                        <button type="button" aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"} onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-3 text-gray-400 hover:text-gray-800 z-10 cursor-pointer">
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </button>
                    </div>

                    <div className="pt-2">
                        <Button
                            type="submit"
                            disabled={isSubmitting || uploading || isGoogleLoading}
                            className="w-full !bg-[#262626] py-3 text-center text-sm font-medium !text-white !transition-colors !duration-200 hover:!bg-black !uppercase !tracking-wider disabled:!opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <CircularProgress size={16} className="!text-white" />
                                    <span>Creating account...</span>
                                </>
                            ) : (
                                "Sign up"
                            )}
                        </Button>
                        <div className="flex w-full gap-3 my-3 items-center">
                            <hr className="w-full text-gray-500"/>
                            <span className="text-sm text-gray-700">OR</span>
                            <hr className="w-full text-gray-500"/>
                        </div>

                        <Button
                            type="button"
                            disabled={isSubmitting || uploading || isGoogleLoading}
                            onClick={handleGoogleSignIn}
                            className="w-full flex items-center justify-center gap-3 !bg-transparent py-3 text-center text-sm !border !border-gray-700 font-medium !text-black !transition-colors !duration-100 hover:!bg-gray-100 !tracking-wider cursor-pointer disabled:!opacity-50"
                        >
                            {isGoogleLoading ? (
                                <>
                                    <CircularProgress size={16} className="!text-black" />
                                    <span>Connecting with Google...</span>
                                </>
                            ) : (
                                <>
                                    <img
                                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                        alt="Google"
                                        className="w-5 h-5"
                                    />
                                    Continue with Google
                                </>
                            )}
                        </Button>

                    </div>

                    <div className="pt-4 text-center text-sm text-gray-600">
                        <span>Have already an account?</span>
                        <Button
                            type="button"
                            disabled={isSubmitting || uploading || isGoogleLoading}
                            onClick={handleSwitchToLogin}
                            className="ms-1 font-semibold text-gray-800 hover:text-black hover:underline transition-colors cursor-pointer"
                        >
                            Log In
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
};
