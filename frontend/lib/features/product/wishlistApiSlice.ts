import { productApiSlice } from "@/lib/features/product/productApiSlice";
import type { ApiResponse } from "@/util/apiResponse";
import type { ProductListItem } from "@/lib/features/product/types";

export interface Wishlist {
    _id: string;
    products: ProductListItem[];
}

export const wishlistApiSlice = productApiSlice.injectEndpoints({
    endpoints: (build) => ({
        getWishlist: build.query<Wishlist | null, void>({
            query: () => "/wishLists",
            transformResponse: (response: ApiResponse<Wishlist | null>) => response.data,
            providesTags: ["Wishlist"],
        }),
        addWishlistProduct: build.mutation<ApiResponse<Wishlist>, string>({
            query: (productId) => ({ url: `/wishLists/${productId}`, method: "POST" }),
            invalidatesTags: ["Wishlist"],
        }),
        removeWishlistProduct: build.mutation<ApiResponse<Wishlist>, string>({
            query: (productId) => ({ url: `/wishLists/${productId}`, method: "DELETE" }),
            invalidatesTags: ["Wishlist"],
        }),
        clearWishlist: build.mutation<ApiResponse<Wishlist>, void>({
            query: () => ({ url: "/wishLists", method: "DELETE" }),
            invalidatesTags: ["Wishlist"],
        }),
    }),
});

export const {
    useGetWishlistQuery,
    useAddWishlistProductMutation,
    useRemoveWishlistProductMutation,
    useClearWishlistMutation,
} = wishlistApiSlice;
