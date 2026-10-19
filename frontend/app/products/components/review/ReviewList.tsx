"use client";

import { useState } from "react";
import Rating from "@mui/material/Rating";
import { useAuth } from "@/app/products/hooks/useAuth";
import { useDeleteReviewMutation, useGetReviewsByProductIdQuery, useUpdateReviewMutation, type Review } from "@/lib/features/product/reviewApiSlice";

function tokenUserId(token?: string) {
    try {
        const payload = token?.split(".")[1];
        if (!payload) return "";
        return (JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as { userId?: string }).userId ?? "";
    } catch {
        return "";
    }
}

function ReviewItem({ review, currentUserId }: { review: Review; currentUserId: string }) {
    const user = typeof review.user === "string" ? null : review.user;
    const isOwner = Boolean(currentUserId && user?._id === currentUserId);
    const [editing, setEditing] = useState(false);
    const [rating, setRating] = useState(review.rating);
    const [comment, setComment] = useState(review.comment ?? "");
    const [error, setError] = useState("");
    const [updateReview, updateState] = useUpdateReviewMutation();
    const [deleteReview, deleteState] = useDeleteReviewMutation();

    const save = async () => {
        if (!review._id) return;
        setError("");
        try {
            await updateReview({ reviewId: review._id, rating, comment }).unwrap();
            setEditing(false);
        } catch {
            setError("Could not update this review. Please try again.");
        }
    };

    const remove = async () => {
        if (!review._id || !window.confirm("Delete your review? This cannot be undone.")) return;
        setError("");
        try {
            await deleteReview(review._id).unwrap();
        } catch {
            setError("Could not delete this review. Please try again.");
        }
    };

    return <article className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
                {user?.profilePic ? <img src={user.profilePic} alt="" className="h-10 w-10 rounded-full object-cover" /> : <div aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-200 font-semibold text-stone-600">{user?.name?.charAt(0)?.toUpperCase() ?? "?"}</div>}
                <div className="min-w-0"><p className="truncate font-semibold text-stone-900">{user?.name ?? "Marketplace user"}</p><Rating value={review.rating} precision={0.5} readOnly size="small" /></div>
            </div>
            {isOwner && !editing && <div className="flex shrink-0 gap-3 text-sm"><button type="button" onClick={() => setEditing(true)} className="text-stone-700 underline">Edit</button><button type="button" disabled={deleteState.isLoading} onClick={remove} className="text-red-700 underline disabled:opacity-50">Delete</button></div>}
        </div>
        {editing ? <div className="mt-4 space-y-3">
            <Rating aria-label="Edit rating" value={rating} onChange={(_, value) => setRating(value ?? 0)} precision={0.5} />
            <textarea aria-label="Edit review comment" value={comment} onChange={(event) => setComment(event.target.value)} maxLength={2000} className="min-h-24 w-full rounded-lg border border-stone-300 p-3 text-sm" />
            <div className="flex justify-end gap-3"><button type="button" onClick={() => { setEditing(false); setRating(review.rating); setComment(review.comment ?? ""); }} className="text-sm text-stone-600">Cancel</button><button type="button" disabled={updateState.isLoading || rating === 0} onClick={save} className="rounded bg-stone-900 px-4 py-2 text-sm text-white disabled:opacity-50">{updateState.isLoading ? "Saving…" : "Save review"}</button></div>
        </div> : <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-stone-700">{review.comment || "No written comment."}</p>}
        {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    </article>;
}

export default function ReviewList({ productId }: { productId: string }) {
    const { data: reviews, isLoading, isError } = useGetReviewsByProductIdQuery(productId);
    const { token } = useAuth();
    const currentUserId = tokenUserId(token);
    return <section className="mt-10" aria-labelledby="reviews-heading">
        <h2 id="reviews-heading" className="mb-4 font-serif text-2xl text-stone-900">Customer reviews</h2>
        {isLoading && <p role="status" className="text-sm text-stone-600">Loading reviews…</p>}
        {isError && <p role="alert" className="text-sm text-red-700">Reviews could not be loaded. Please refresh and try again.</p>}
        {!isLoading && !isError && reviews?.length === 0 && <p className="text-sm text-stone-600">No reviews yet. Be the first to share your thoughts.</p>}
        {reviews && reviews.length > 0 && <div className="grid gap-3">{reviews.map((review, index) => <ReviewItem key={review._id ?? `${productId}-${index}`} review={review} currentUserId={currentUserId} />)}</div>}
    </section>;
}
