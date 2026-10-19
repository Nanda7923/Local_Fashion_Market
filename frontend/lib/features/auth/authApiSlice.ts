import {productApiSlice} from "@/lib/features/product/productApiSlice";
import {ApiResponse} from "@/util/apiResponse";
import type { ImagesUrlResponse } from "@/util/imagesUrlResponse";

export interface UserProfile {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string | null;
    profilePic?: string | null;
    role: string;
}

export type UserProfileUpdate = Pick<UserProfile, "name" | "email" | "phone" | "address" | "dateOfBirth" | "profilePic">;

export interface Register {
    name: string;
    email: string;
    password: string;
    profilePic?: string;
}


export const authApiSlice = productApiSlice.injectEndpoints({
        endpoints : (build) => ({
            register : build.mutation<ApiResponse<Register>,Register>({
                query: (body) => ({
                    url: "/users/register",
                    method: "POST",
                    body,
                }),
            }),
            getUserProfile: build.query<UserProfile, string>({
                query: (userId) => `/users/${userId}`,
                transformResponse: (response: ApiResponse<UserProfile>) => response.data,
                providesTags: ["Profile"],
            }),
            updateUserProfile: build.mutation<ApiResponse<UserProfile>, { userId: string; profile: UserProfileUpdate }>({
                query: ({ userId, profile }) => ({ url: `/users/${userId}`, method: "PUT", body: profile }),
                invalidatesTags: ["Profile"],
            }),
            uploadProfilePicture: build.mutation<ImagesUrlResponse, FormData>({
                query: (formData) => ({ url: "/upload/profile", method: "POST", body: formData }),
            }),
        })
})

export const { useGetUserProfileQuery, useUpdateUserProfileMutation, useUploadProfilePictureMutation } = authApiSlice;
