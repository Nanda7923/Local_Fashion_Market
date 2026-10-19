import {Close} from "@mui/icons-material";
import Link from "next/link";
import {useAuth} from "@/app/products/hooks/useAuth"
import React from "react";
import {logout} from "@/lib/features/auth/authSlice";
import {useAppDispatch} from "@/lib/hooks";

interface ProfileDetailCardProps {
    showAuthForm : boolean;
    setShowAuthForm: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ProfileDetailCard({setShowAuthForm}: ProfileDetailCardProps) {
    const {profilePic,name,email,role} = useAuth();
    const dispatch = useAppDispatch();

    const handleClose = () => {
        setShowAuthForm(false);
        console.log("closed");
    };

    const logoutBtnHandler = () => {
        console.log("Logged out")
        dispatch(logout());
    };

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return(
        <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-xs transition-opacity animate-luxury-fade-in"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
        >
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 mx-4 sm:mx-0 border border-gray-100 animate-luxury-scale-in">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                    aria-label="Close modal"
                >
                    <Close className="h-5 w-5" />
                </button>

                {/* 4. Profile Header / Avatar */}
                <div className="flex flex-col items-center mt-2">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-md border-2 border-gray-100 bg-gray-50 flex items-center justify-center">
                        {profilePic ? (
                            <img
                                src={profilePic}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-2xl font-bold text-gray-500">
                                {name[0]?.toUpperCase() || "U"}
                            </span>
                        )}
                    </div>
                </div>

                {/* 5. User Details List */}
                <div className="mt-6 space-y-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-500">Username</span>
                        <span className="font-semibold text-gray-800">{name}</span>
                    </div>
                    <div className="divider border-t border-gray-200/60 my-1"></div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-500">Email</span>
                        <span className="font-semibold text-gray-800">{email}</span>
                    </div>
                    <div className="divider border-t border-gray-200/60 my-1"></div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-500">Role</span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 capitalize">
                            {role}
                        </span>
                    </div>
                </div>

                {/* 6. Action Button */}
                <div className="mt-6">
                    {role === "Admin" && (
                        <Link
                            href="/admin/products/create"
                            onClick={handleClose}
                            className="mb-3 block w-full rounded-xl border border-gray-300 px-4 py-2.5 text-center font-medium text-gray-800 hover:bg-gray-50"
                        >
                            Create Product
                        </Link>
                    )}
                    <button
                        onClick={logoutBtnHandler}
                        className="w-full py-2.5 px-4 bg-red-500 hover:bg-red-600 active:scale-[0.99] text-white font-medium rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        Log out
                    </button>
                </div>

            </div>
        </div>
    )
}
