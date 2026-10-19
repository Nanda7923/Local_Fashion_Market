import { productApiSlice } from "./productApiSlice";
import type { ApiResponse } from "@/util/apiResponse";

export interface AdminUser {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    profilePic?: string | null;
    role: string;
    isBanned: boolean;
    createdAt: string;
}
export interface AdminOrder {
    _id: string;
    user: { _id: string; name: string; email: string };
    items: {
        product: {
            _id: string;
            title: string;
            imageUrl?: string[] } | string;
        quantity: number;
        price: number;
        size: string;
        color: string }[];
    totalAmount: number;
    orderStatus: string;
    paymentMethod: string;
    paymentStatus: string;
    createdAt: string;
}
export type MyOrder = Pick<AdminOrder, "_id" | "items" | "totalAmount" | "orderStatus" | "createdAt">;
export interface AdminReview {
    _id: string; rating: number; createdAt: string;
    user?: { name: string; email: string }; product?: { title: string };
}
export interface AdminStats {
    totalUsers: number;
    totalProducts: number;
    reviews: number;
    orders: number;
    pendingOrders: number;
    confirmedOrders: number;
    processingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
}

export const adminApiSlice = productApiSlice.injectEndpoints({
    endpoints: (build) => ({
        getAdminStats: build.query<AdminStats, void>({
            query: () => "/admin/dashboard", transformResponse: (r: ApiResponse<AdminStats>) => r.data,
            providesTags: ["Admin"],
        }),
        getAdminUsers: build.query<AdminUser[], void>({
            query: () => "/users", transformResponse: (r: ApiResponse<AdminUser[]>) => r.data,
            providesTags: ["Admin"],
        }),
        setUserBanned: build.mutation<ApiResponse<AdminUser>, { id: string; banned: boolean }>({
            query: ({ id, banned }) => ({ url: `/users/${id}/${banned ? "ban" : "unban"}`, method: "POST" }),
            invalidatesTags: ["Admin"],
        }),
        updateAdminBrand: build.mutation<ApiResponse<{ _id: string; name: string; logo: string }>, { id: string; name: string; logo: string }>({
            query: ({ id, ...body }) => ({ url: `/brands/${id}`, method: "PUT", body }),
            invalidatesTags: ["Brands"],
        }),
        deleteAdminBrand: build.mutation<ApiResponse<unknown>, string>({
            query: (id) => ({ url: `/brands/${id}`, method: "DELETE" }), invalidatesTags: ["Brands"],
        }),
        getAdminOrders: build.query<AdminOrder[], void>({
            query: () => "/orders", transformResponse: (r: ApiResponse<AdminOrder[]>) => r.data,
            providesTags: ["Admin"],
        }),
        getMyOrders: build.query<MyOrder[], void>({
            query: () => "/orders/myOrders", transformResponse: (r: ApiResponse<MyOrder[]>) => r.data,
            providesTags: ["MyOrders"],
        }),
        cancelOrder: build.mutation<ApiResponse<MyOrder>, string>({
            query: (orderId) => ({ url: `/orders/${orderId}`, method: "PUT" }),
            invalidatesTags: ["MyOrders", "Admin"],
        }),
        setOrderStatus: build.mutation<ApiResponse<AdminOrder>, { id: string; orderStatus: string }>({
            query: ({ id, orderStatus }) => ({ url: `/orders/${id}`, method: "POST", body: { orderStatus } }),
            invalidatesTags: ["Admin"],
        }),
        getAdminReviews: build.query<AdminReview[], void>({
            query: () => "/admin/reviews", transformResponse: (r: ApiResponse<AdminReview[]>) => r.data,
            providesTags: ["Admin"],
        }),
        deleteAdminReview: build.mutation<ApiResponse<AdminReview>, string>({
            query: (id) => ({ url: `/admin/reviews/${id}`, method: "DELETE" }), invalidatesTags: ["Admin"],
        }),
    }),
});

export const {
    useGetAdminStatsQuery,
    useGetAdminUsersQuery,
    useSetUserBannedMutation,
    useUpdateAdminBrandMutation,
    useDeleteAdminBrandMutation,
    useGetAdminOrdersQuery,
    useGetMyOrdersQuery,
    useCancelOrderMutation,
    useSetOrderStatusMutation,
    useGetAdminReviewsQuery,
    useDeleteAdminReviewMutation,
} = adminApiSlice;
