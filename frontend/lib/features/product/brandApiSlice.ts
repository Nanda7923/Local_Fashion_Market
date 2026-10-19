import {productApiSlice} from "./productApiSlice";
import {ApiResponse} from "@/util/apiResponse";
import {ImagesUrlResponse} from "@/util/imagesUrlResponse";
import type { Brand, BrandCreateRequest, BrandUpdateRequest } from "@/lib/features/product/types";

export const brandApiSlice = productApiSlice.injectEndpoints({
    endpoints : (build) => ({
        getBrands: build.query<Brand[], undefined>({
            query: () => `/brands`,
            transformResponse: (response: ApiResponse<Brand[]>) => response.data,
            providesTags: ["Brands"],
        }),
        createBrand: build.mutation<ApiResponse<Brand>, BrandCreateRequest>({
            query: (brand) => ({
                url: "/brands",
                method: "POST",
                body: brand,
            }),
            invalidatesTags: ["Brands"],
        }),
        updateBrand: build.mutation<ApiResponse<Brand>, BrandUpdateRequest>({
            query: ({ id, ...body }) => ({ url: `/brands/${id}`, method: "PUT", body }),
            invalidatesTags: ["Brands"],
        }),
        deleteBrand: build.mutation<ApiResponse<Brand>, string>({
            query: (id) => ({ url: `/brands/${id}`, method: "DELETE" }),
            invalidatesTags: ["Brands"],
        }),
        uploadBrandLogo: build.mutation<ImagesUrlResponse, FormData>({
            query: (formData) => ({
                url: "/upload/logo",
                method: "POST",
                body: formData,
            }),
        })
    })
})


export const {
    useGetBrandsQuery,
    useCreateBrandMutation,
    useUploadBrandLogoMutation,
    useUpdateBrandMutation,
    useDeleteBrandMutation,
} = brandApiSlice;
