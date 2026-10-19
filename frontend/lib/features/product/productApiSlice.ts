import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {ApiResponse} from "@/util/apiResponse";
import {ImagesUrlResponse} from "@/util/imagesUrlResponse";
import {RootState} from "@/lib/store";
import type { Product, ProductCreateRequest } from "@/lib/features/product/types";

export const productApiSlice = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL,
        prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.token;
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
            return headers;
        }
    }),
    reducerPath: "productApi",
    tagTypes: ["Products","Brands","Reviews","Admin","Wishlist","Profile","MyOrders"],
    endpoints: (build) => ({
        getProducts: build.query<Product[], undefined>({
            query: () => `/products`,
            transformResponse: (response: ApiResponse<Product[]>) => response.data,
            providesTags: (result) => result ? [...result.map(({ _id }) => ({ type: "Products" as const, id: _id })), { type: "Products", id: "LIST" }] : [{ type: "Products", id: "LIST" }],
        }),

        getProductById: build.query<Product,string>({
            query : (id) => `/products/${id}`,
            transformResponse : (response : ApiResponse<Product>) => response.data,
        }),

        getNewArrivals : build.query<Product[],undefined>({
            query: () => `/products/new-arrivals`,
            transformResponse: (response: ApiResponse<Product[]>) => response.data,
        }),

        getTrending : build.query<Product[],undefined>({
            query: () => `/products/trending`,
            transformResponse:(response: ApiResponse<Product[]>) => response.data,
        }),

        getProductsByHeadCategory : build.query<Product[],string>({
            query : (headCategory) => `/products/head-categories/${headCategory}`,
            transformResponse:(response: ApiResponse<Product[]>) => response.data,
        }),

        getHeadCategories : build.query<String[],void>({
            query : () => `/products/head-categories`,
            transformResponse:(response: ApiResponse<String[]>) => response.data,
        }),

        deleteProduct: build.mutation<ApiResponse<Product>,string>({
			query :(productId) => ({
				url :`/products/${productId}`,
                method : "DELETE"}),
            invalidatesTags: [{ type: "Products", id: "LIST" }],
        }),

        //pessimistic
        addProduct : build.mutation<ApiResponse<Product>,ProductCreateRequest>({
            query : (product) => ({
                url : `/products`,
                method : "POST",
                body : product
            }),
            invalidatesTags: [{ type: "Products", id: "LIST" }],
        }),

        uploadImages : build.mutation<ImagesUrlResponse,FormData>({
            query : (formData) => ({
                url : `/upload/products`,
                method : "POST",
                body : formData,
                // Let the browser set multipart/form-data with its boundary.
            })
        }),

        updateProduct : build.mutation<ApiResponse<Product>,ProductCreateRequest & { _id: string }>({
            query : ({ _id, ...product }) => ({
                url : `/products/${_id}`,
                method : "PUT",
                body : product,
            }),
            invalidatesTags: [{ type: "Products", id: "LIST" }],
        })
    }),
});


export const {
    useGetProductsQuery,
    useGetNewArrivalsQuery,
    useGetTrendingQuery,
    useGetHeadCategoriesQuery,
    useGetProductByIdQuery,
    useGetProductsByHeadCategoryQuery,
    useDeleteProductMutation,
    useUploadImagesMutation,
    useAddProductMutation
    ,useUpdateProductMutation
} = productApiSlice;
