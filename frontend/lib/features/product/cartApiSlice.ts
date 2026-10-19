import { productApiSlice } from "@/lib/features/product/productApiSlice";
import type { ApiResponse } from "@/util/apiResponse";

export interface CartProduct {
    _id: string;
    title: string;
    brand?: { _id?: string; name: string } | string | null;
    category: string;
    price: number;
    size: string[];
    color: string[];
    imageUrl: string[];
    inStock: boolean;
}

export interface CartItem {
    _id: string;
    product: CartProduct | null;
    quantity: number;
    size: string;
    color: string;
}

export interface Cart {
    _id: string;
    user: string;
    items: CartItem[];
}

export interface AddCartItemRequest {
    productId: string;
    quantity: number;
    size: string;
    color: string;
}

export const cartApiSlice = productApiSlice
    .enhanceEndpoints({ addTagTypes: ["Cart"] })
    .injectEndpoints({
    endpoints: (build) => ({
        getCart: build.query<Cart, void>({
            query: () => "/carts",
            transformResponse: (response: ApiResponse<Cart>) => response.data,
            providesTags: ["Cart"],
        }),
        addCartItem: build.mutation<ApiResponse<Cart>, AddCartItemRequest>({
            query: (body) => ({ url: "/carts", method: "POST", body }),
            invalidatesTags: ["Cart"],
        }),
        updateCartItemQuantity: build.mutation<
            ApiResponse<Cart>,
            { itemId: string; quantity: number }
        >({
            query: ({ itemId, quantity }) => ({
                url: `/carts/items/${itemId}`,
                method: "PUT",
                body: { quantity },
            }),
            invalidatesTags: ["Cart"],
        }),
        removeCartItem: build.mutation<ApiResponse<Cart>, string>({
            query: (itemId) => ({ url: `/carts/items/${itemId}`, method: "DELETE" }),
            invalidatesTags: ["Cart"],
        }),
        clearCart: build.mutation<ApiResponse<Cart>, void>({
            query: () => ({ url: "/carts", method: "DELETE" }),
            invalidatesTags: ["Cart"],
        }),
        }),
    });

export const {
    useGetCartQuery,
    useAddCartItemMutation,
    useUpdateCartItemQuantityMutation,
    useRemoveCartItemMutation,
    useClearCartMutation,
} = cartApiSlice;
