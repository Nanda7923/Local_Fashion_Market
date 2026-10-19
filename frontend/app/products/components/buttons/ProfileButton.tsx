import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import {useAuth} from "@/app/products/hooks/useAuth";

interface ProfileButtonProps {
    pfBtnHandler: () => void;
}

export default function ProfileButton({
                                          pfBtnHandler,
                                      }: ProfileButtonProps) {
    const {profilePic, isAuthenticated, name} = useAuth();
    return(
        <button onClick={pfBtnHandler} aria-label="View Profile" className="hidden sm:block cursor-pointer hover:text-gray-400 transition-colors">
        {isAuthenticated ? (
                    profilePic?.trim() ? (
                            <img
                                src={profilePic}
                        alt="Profile"
                className="h-8 w-8 rounded-full object-cover"
                    />
) : (
        <span className="h-8 w-8 rounded-full bg-gray-500 text-gray-800 flex items-center justify-center text-sm font-bold uppercase">
            {name?.trim()?.charAt(0) || "U"}
    </span>
)
) : (
        <AccountCircleIcon className="sm:!text-[28px] lg:!text-[34px]" />
    )}
    </button>
    )
}
