import { productApiSlice } from "@/lib/features/product/productApiSlice";
import type { ApiResponse } from "@/util/apiResponse";

export interface NewsletterSubscribeRequest {
    email: string;
}

export interface NewsletterSubscriber {
    _id: string;
    email: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface NewsletterResponse extends ApiResponse<NewsletterSubscriber> {
    alreadySubscribed?: boolean;
}

export const newsletterApiSlice = productApiSlice.injectEndpoints({
    endpoints: (build) => ({
        subscribeNewsletter: build.mutation<NewsletterResponse, NewsletterSubscribeRequest>({
            query: (body) => ({
                url: "/newsletter/subscribe",
                method: "POST",
                body,
            }),
        }),
    }),
});

export const { useSubscribeNewsletterMutation } = newsletterApiSlice;
