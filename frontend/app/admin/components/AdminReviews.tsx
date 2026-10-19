"use client";

import { useState } from "react";
import { useDeleteAdminReviewMutation, useGetAdminReviewsQuery } from "@/lib/features/product/adminApiSlice";
import type { AdminReview } from "@/lib/features/product/adminApiSlice";
import { Empty, ErrorState, Loading, Modal } from "@/app/admin/components/AdminPrimitives";

interface AdminReviewsProps {
    search: string;
    showError: (message: string) => void;
    showNotice: (message: string) => void;
    apiMessage: (error: unknown, fallback: string) => string;
}

export default function AdminReviews({ search, showError, showNotice, apiMessage }: AdminReviewsProps) {
    const q = useGetAdminReviewsQuery();
    const [remove, state] = useDeleteAdminReviewMutation();
    const [confirm, setConfirm] = useState<AdminReview | null>(null);
    const rows = (q.data ?? []).filter((r) => `${r.user?.name ?? ""} ${r.product?.title ?? ""} ${r.rating}`
                                .toLowerCase()
                                .includes(search.toLowerCase()));

    const removeBtnHandler =async () => {
        try {
            await remove(confirm._id).unwrap();
            setConfirm(null);
            showNotice("Review removed.");
        } catch (e) {
            showError(apiMessage(e, "Could not remove review."));
        }
    }

    if (q.isLoading) return <Loading />;
    if (q.error) return <ErrorState message="Could not load reviews." onRetry={q.refetch} />;
    return (
        <div className="overflow-hidden rounded-2xl border border-[#e9e5de] bg-white">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                    <thead className="bg-[#f1f0eb] text-xs uppercase tracking-wider text-stone-500">
                    <tr>
                        <th className="px-5 py-4">Customer</th>
                        <th className="px-5 py-4">Product</th>
                        <th className="px-5 py-4">Rating</th>
                        <th className="px-5 py-4">Date</th>
                        <th className="px-5 py-4">Moderation</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        rows.map((r) => (
                            <tr key={r._id} className="border-t border-stone-100">
                                <td className="px-5 py-4">{r.user?.name ?? "Customer"}</td>
                                <td className="px-5 py-4">{r.product?.title ?? "Product"}</td>
                                <td className="px-5 py-4 text-amber-600">
                                    {"★".repeat(r.rating)}
                                    <span className="text-stone-300">{"★".repeat(5-r.rating)}</span>
                                </td>
                                <td className="px-5 py-4">{new Date(r.createdAt).toLocaleDateString()}</td>
                                <td className="px-5 py-4">
                                    <button onClick={() => setConfirm(r)} className="text-rose-700">Remove review</button>
                                </td>
                            </tr>))
                    }
                    </tbody>
                </table>
            </div>
            {
                !rows.length && <Empty>No reviews found.</Empty>
            }
            {
                confirm && <Modal title="Remove review?" close={() => setConfirm(null)}>
                    <p className="text-sm text-stone-600">Remove the {confirm.rating}-star review of {confirm.product?.title ?? "this product"} by {confirm.user?.name ?? "this customer"}?</p>
                    <div className="mt-6 flex justify-end gap-3">
                        <button onClick={() => setConfirm(null)} className="rounded-lg border px-4 py-2">Keep review</button>
                        <button disabled={state.isLoading}
                                onClick={removeBtnHandler}
                                className="rounded-lg bg-rose-700 px-4 py-2 text-white">
                            {state.isLoading ? "Removing…" : "Remove"}
                        </button>
                    </div>
                </Modal>
            }
        </div>
    );
}
