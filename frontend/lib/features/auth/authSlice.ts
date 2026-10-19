import { createAppSlice } from "@/lib/createAppSlice";
import { LoginData, RegisterData } from "@/app/schema/authSchema";
import type { PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    token?: string;
    profilePic?: string;
    name : string;
    email : string;
    role : string;
    initialized: boolean;
    status: "idle" | "loading";
    error: string | null;
}

type StoredAuth = Pick<AuthState, "token" | "profilePic" | "name" | "email" | "role">;

const AUTH_STORAGE_KEY = "auth";

function persistAuth(auth: StoredAuth) {
    try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    } catch {

    }
}

const initialState: AuthState = {
    token: "",
    profilePic: "",
    name : "",
    email : "",
    role : "",
    initialized: false,
    status: "idle",
    error: null,
};

export const authSlice = createAppSlice({
    name: "auth",
    initialState,
    reducers: (create) => ({
        restoreAuth: create.reducer((state, action: PayloadAction<StoredAuth | null>) => {
            state.initialized = true;
            if (!action.payload?.token) {
                state.token = undefined;
                state.profilePic = "";
                state.name = "";
                state.email = "";
                state.role = "";
                return;
            }
            state.token = action.payload.token;
            state.profilePic = action.payload.profilePic ?? "";
            state.name = action.payload.name ?? "";
            state.email = action.payload.email ?? "";
            state.role = action.payload.role ?? "";
        }),
        logout: create.reducer((state) => {
            state.token = undefined;
            state.profilePic = "";
            state.name= "";
            state.email = "";
            state.role = "";
            state.initialized = true;
            state.status = "idle";
            state.error = null;
        }),
        profileUpdated: create.reducer((state, action: PayloadAction<Pick<StoredAuth, "name" | "email" | "profilePic">>) => {
            state.name = action.payload.name;
            state.email = action.payload.email;
            state.profilePic = action.payload.profilePic ?? "";
            if (state.token) {
                persistAuth({
                    token: state.token,
                    name: state.name,
                    email: state.email,
                    profilePic: state.profilePic,
                    role: state.role,
                });
            }
        }),

        login: create.asyncThunk(
            async (user: LoginData, { rejectWithValue }) => {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(user),
                    });
                    const data = await response.json();
                    console.log("response  data",data)

                    if (!response.ok) {
                        return rejectWithValue(data.message || "Login failed");
                    }
                    const token = data.data.token;
                    const profilePic = data.data.user.profilePic;
                    const name = data.data.user.name;
                    const email = data.data.user.email;
                    const role = data.data.user.role;

                    persistAuth({
                        token,
                        profilePic: profilePic ?? "",
                        name: name ?? "",
                        email: email ?? "",
                        role: role ?? "",
                    });

                    return data;
                } catch (e) {
                    return rejectWithValue("Unable to connect to the server");
                }
            },
            {
                pending: (state) => {
                    state.status = "loading";
                    state.error = null;
            },
                fulfilled: (state, action) => {
                    state.status = "idle";
                    state.error = null;
                    state.token = action.payload?.data?.token;
                    state.profilePic = action.payload?.data?.user?.profilePic ?? "";
                    state.name = action.payload?.data?.user?.name ?? "";
                    state.email = action.payload?.data?.user?.email ?? "";
                    state.role = action.payload?.data?.user?.role ?? "";
                    state.initialized = true;
        },
                rejected: (state, action) => {
                    state.status = "idle";
                    state.token = undefined;
                    state.profilePic = "";
                    state.name = "";
                    state.email = "";
                    state.role = "";
                    state.initialized = true;
                    state.error = (action.payload as string) || action.error.message || "Login failed";
    },
}
        ),

        registerUser: create.asyncThunk(
            async (user: RegisterData, { rejectWithValue }) => {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/register`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(user),
                    });
                    const data = await response.json();
                    if (!response.ok) {
                        return rejectWithValue(data.message || "Registration failed");
                    }
                    const userData = data.data?.user;
                    if (data.data?.token && userData) {
                        persistAuth({
                            token: data.data.token,
                            profilePic: userData.profilePic ?? "",
                            name: userData.name ?? "",
                            email: userData.email ?? "",
                            role: userData.role ?? "",
                        });
                    }
                    return data;
                } catch (e) {
                    return rejectWithValue("Unable to connect to the server");
                }
            },
            {
                pending: (state) => {
                    state.status = "loading";
                    state.error = null;
                },
                fulfilled: (state, action) => {
                    state.status = "idle";
                    state.error = null;
                    state.token = action.payload?.data?.token;
                    state.profilePic = action.payload?.data?.user?.profilePic ?? "";
                    state.name = action.payload?.data?.user?.name ?? "";
                    state.email = action.payload?.data?.user?.email ?? "";
                    state.role = action.payload?.data?.user?.role ?? "";
                    state.initialized = true;
                },
                rejected: (state, action) => {
                    state.status = "idle";
                    state.token = undefined;
                    state.profilePic = "";
                    state.name= "";
                    state.email = "";
                    state.role = "";
                    state.initialized = true;
                    state.error = (action.payload as string) || action.error.message || "Registration failed";
                },
            }
        ),
    }),
    selectors: {
        selectAuth: (state) => state.token,
        selectProfilePic: (state) => state.profilePic,
        selectName: (state) => state.name,
        selectEmail: (state) => state.email,
        selectRole: (state) => state.role,
        selectAuthInitialized: (state) => state.initialized,
        selectAuthError: (state) => state.error,
        selectAuthStatus: (state) => state.status,
    },
});

export const { login, registerUser, restoreAuth, profileUpdated } = authSlice.actions;
export const logout = () => (dispatch: (action: ReturnType<typeof authSlice.actions.logout>) => void) => {
    try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem("token");
        localStorage.removeItem("profilePic");
    } catch {

    }
    dispatch(authSlice.actions.logout());
};
export const { selectAuth,
                selectProfilePic,
                selectName,
                selectAuthError,
                selectAuthStatus,
                selectEmail,
                selectRole,
                selectAuthInitialized
            } = authSlice.selectors;
