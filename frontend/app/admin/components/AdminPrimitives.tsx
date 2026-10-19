"use client";

import { CircularProgress } from "@mui/material";
import type { ReactNode } from "react";

export function Modal({ title, close, children }: { title: string; close: () => void; children: ReactNode })
{
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
             onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>

            <section role="dialog" aria-modal="true" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[#fffefa] p-6 shadow-xl sm:p-8">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="font-[family-name:var(--font-cormorant)] text-3xl">{title}</h2>
                    <button onClick={close} aria-label="Close dialog" className="rounded-md px-3 py-1 text-xl text-stone-500 hover:bg-stone-100">×</button>
                </div>
                {children}
            </section>
        </div>) }


export function Pager({ page, pageCount, setPage }: { page: number; pageCount: number; setPage: (n: number) => void }) {
    return (
        <div className="flex items-center justify-between border-t border-stone-100 px-5 py-3 text-sm">
            <span className="text-stone-500">Page {page} of {pageCount}</span>
            <div className="flex gap-2">
                <button disabled={page <= 1}
                        onClick={() => setPage(page - 1)}
                        className="rounded-md border px-3 py-1.5 disabled:opacity-40">
                    Previous
                </button>
                <button disabled={page >= pageCount} onClick={() => setPage(page + 1)}
                        className="rounded-md border px-3 py-1.5 disabled:opacity-40">
                    Next
                </button>
            </div>
        </div>)
}

export function Loading() {
    return (
        <div className="flex min-h-48 items-center justify-center">
            <CircularProgress size={30} />
        </div>)
}

export function Empty({ children }: { children: ReactNode }) {
    return (
        <div className="p-12 text-center text-sm text-stone-500">{children}</div>
    )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
    return (
        <div className="rounded-xl border border-rose-100 bg-white p-8 text-center text-sm text-rose-700">
            {message}
            {
                onRetry && <button onClick={onRetry} className="ml-3 underline">Try again</button>
            }
        </div>)
}
