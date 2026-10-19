"use client";

import { useGetAdminStatsQuery } from "@/lib/features/product/adminApiSlice";
import { ErrorState, Loading } from "@/app/admin/components/AdminPrimitives";


export default function AdminOverview({ orderStatuses }: { orderStatuses: string[] }) {
    const {data,isLoading,error} = useGetAdminStatsQuery();


    if (isLoading) return <Loading />;
    if (!data || error) return <ErrorState message="Could not load dashboard statistics." />;


    const cards = [["Total products", data.totalProducts], ["Customers", data.totalUsers], ["Orders", data.orders], ["Reviews", data.reviews]];
    return (
        <div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {
                    cards.map(([label, value]) => (
                        <article key={label} className="rounded-2xl border border-[#e9e5de] bg-white p-5">
                            <p className="text-xs uppercase tracking-[.14em] text-stone-500">{label}</p>
                            <p className="mt-3 font-[family-name:var(--font-cormorant)] text-4xl">{value}</p>
                        </article>)
                    )}
            </div>
            <div className="mt-7 rounded-2xl border border-[#e9e5de] bg-white p-6">
                <h2 className="font-[family-name:var(--font-cormorant)] text-3xl">Order pipeline</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {
                        orderStatuses.map((status) =>(
                            <div key={status} className="flex justify-between rounded-lg bg-[#f7f6f2] px-4 py-3 text-sm">
                                <span>{status}</span>
                                <strong>{data[`${status.toLowerCase()}Orders` as keyof typeof data]}</strong>
                            </div>)
                        )}
                </div>
            </div>
        </div>);
}
