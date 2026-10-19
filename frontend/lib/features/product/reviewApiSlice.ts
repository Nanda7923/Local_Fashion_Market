import {productApiSlice} from "./productApiSlice";
import {ApiResponse} from "@/util/apiResponse";

export interface AverageRatingResponse{
    _id?: string;
    averageRating : number;
    reviewCount : number;
}

export interface Review{
    _id?: string;
    rating: number;
    comment: string;
    user: { _id: string; name: string; profilePic?: string | null } | string;
}

export const reviewApiSlice = productApiSlice.injectEndpoints({
    endpoints : (build) => ({
        getAverageRating : build.query<AverageRatingResponse,string>({
            query : (productId) => `/reviews/averageRating/${productId}`,
            transformResponse: (response: ApiResponse<AverageRatingResponse>) => response.data,
            providesTags : ["Reviews"]
        }),

        getReviewsByProductId : build.query<Review[],string>({
            query : (productId) => `/reviews/${productId}`,
            transformResponse : (response : ApiResponse<Review[]>) => response.data,
            providesTags: ["Reviews"],
        }),

        createdReview : build.mutation<ApiResponse<Review>,{
            productId: string;
            review: { rating: number; comment: string };
        }>({
            query : ({productId, review}) =>({
                url : `/reviews/${productId}`,
                method : "POST",
                body : review
            }),
            invalidatesTags: ["Reviews"],
        }),
        updateReview: build.mutation<ApiResponse<Review>, { reviewId: string; rating: number; comment: string }>({
            query: ({ reviewId, ...review }) => ({ url: `/reviews/${reviewId}`, method: "PUT", body: review }),
            invalidatesTags: ["Reviews"],
        }),
        deleteReview: build.mutation<ApiResponse<Review>, string>({
            query: (reviewId) => ({ url: `/reviews/${reviewId}`, method: "DELETE" }),
            invalidatesTags: ["Reviews"],
        })
    })

})

export const {
    useGetAverageRatingQuery,
    useGetReviewsByProductIdQuery,
    useCreatedReviewMutation,
    useUpdateReviewMutation,
    useDeleteReviewMutation,
} = reviewApiSlice;
