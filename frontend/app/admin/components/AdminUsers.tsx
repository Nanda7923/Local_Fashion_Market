"use client";

import { useState } from "react";
import { useGetAdminUsersQuery, useSetUserBannedMutation } from "@/lib/features/product/adminApiSlice";
import type { AdminUser } from "@/lib/features/product/adminApiSlice";
import { Empty, ErrorState, Loading, Modal, Pager } from "@/app/admin/components/AdminPrimitives";

interface AdminUsersProps {
    search: string;
    page: number;
    setPage: (page: number) => void;
    showError: (message: string) => void;
    showNotice: (message: string) => void;
    apiMessage: (error: unknown, fallback: string) => string;
}

export default function AdminUsers({ search, page, setPage, showError, showNotice, apiMessage }: AdminUsersProps) {
    const q = useGetAdminUsersQuery();
    const [setBanned, state] = useSetUserBannedMutation();
    const [selected, setSelected] = useState<AdminUser | null>(null);
    const rows = (q.data ?? []).filter((u) => `${u.name} ${u.email} ${u.phone ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase()));
    const size = 10;
    const count = Math.max(1, Math.ceil(rows.length / size));
    if (q.isLoading) return <Loading />;
    if (q.error) return <ErrorState message="Could not load customers." onRetry={q.refetch} />;
    return (
        <div className="overflow-hidden rounded-2xl border border-[#e9e5de] bg-white">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                    <thead className="bg-[#f1f0eb] text-xs uppercase tracking-wider text-stone-500">
                    <tr>
                        <th className="px-5 py-4">Customer</th>
                        <th className="px-5 py-4">Joined</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        rows.slice((page - 1) * size, page * size).map((u) => (
                            <tr key={u._id} className="border-t border-stone-100">
                                <td className="px-5 py-4">
                                    <p className="font-medium">{u.name}</p>
                                    <p className="text-xs text-stone-500">{u.email}</p>
                                </td>
                                <td className="px-5 py-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                                <td className="px-5 py-4">
                                    <span className={`rounded-full px-2.5 py-1 text-xs ${u.isBanned ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
                                        {u.isBanned ? "Banned" : "Active"}
                                    </span>
                                </td>
                                <td className="px-5 py-4">
                                    <button onClick={() => setSelected(u)} className="mr-4 text-[#40584a]">Details</button>
                                    <button disabled={state.isLoading} onClick={async () => { if (!u.isBanned && !window.confirm(`Ban ${u.name}? They will lose access to their account.`)) return; try { await setBanned({ id: u._id, banned: !u.isBanned }).unwrap(); showNotice(u.isBanned ? "Customer unbanned." : "Customer banned."); } catch (e) { showError(apiMessage(e, "Could not update customer.")); } }} className={u.isBanned ? "text-emerald-700" : "text-rose-700"}>
                                        {u.isBanned ? "Unban" : "Ban"}
                                    </button>
                                </td>
                            </tr>))
                    }
                    </tbody>
                </table>
            </div>
            {
                !rows.length && <Empty>No customers found.</Empty>
            }
            <Pager page={page} pageCount={count} setPage={setPage} />
            {
                selected && (
                    <Modal title="Customer details" close={() => setSelected(null)}>
                        <dl className="grid grid-cols-[110px_1fr] gap-y-3 text-sm">
                            <dt className="text-stone-500">Name</dt>
                            <dd>{selected.name}</dd>
                            <dt className="text-stone-500">Email</dt>
                            <dd>{selected.email}</dd>
                            <dt className="text-stone-500">Phone</dt>
                            <dd>{selected.phone || "Not provided"}</dd>
                            <dt className="text-stone-500">Address</dt>
                            <dd>{selected.address || "Not provided"}</dd>
                            <dt className="text-stone-500">Account</dt>
                            <dd>{selected.isBanned ? "Banned" : "Active"}</dd>
                        </dl>
                    </Modal>)
            }
        </div>
    )
}
