import { useAppSelector } from "@/lib/hooks";
import {
    selectAuth,
    selectProfilePic,
    selectRole,
    selectEmail,
    selectAuthStatus,
    selectName,
    selectAuthError,
} from "@/lib/features/auth/authSlice";
import { hasUnexpiredToken } from "@/util/jwt";

export const useAuth = () => {
    const token = useAppSelector(selectAuth);
    const profilePic = useAppSelector(selectProfilePic);
    const name = useAppSelector(selectName);
    const status = useAppSelector(selectAuthStatus);
    const error = useAppSelector(selectAuthError);
    const email = useAppSelector(selectEmail);
    const role = useAppSelector(selectRole);

    const isAuthenticated = (() => {
        if (!token) return false;
        return hasUnexpiredToken(token);
    })();

    return {
        token,
        profilePic,
        name,
        email,
        role,
        status,
        error,
        isAuthenticated,
        isLoading: status === "loading",
    };
}
