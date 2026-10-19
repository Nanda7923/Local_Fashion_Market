"use client";
import Link from "next/link";
import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Alert, CircularProgress } from "@mui/material";
import AdminBrands from "@/app/admin/components/AdminBrands";
import AdminOrders from "@/app/admin/components/AdminOrders";
import AdminOverview from "@/app/admin/components/AdminOverview";
import AdminProducts from "@/app/admin/components/AdminProducts";
import AdminReviews from "@/app/admin/components/AdminReviews";
import AdminUsers from "@/app/admin/components/AdminUsers";
import { useAuth } from "@/app/products/hooks/useAuth";
import { selectAuthInitialized, logout } from "@/lib/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

type Section = "Overview" | "Products" | "Brands" | "Users" | "Orders" | "Reviews";
const sections: Section[] = ["Overview", "Products", "Brands", "Users", "Orders", "Reviews"];
const orderStatuses = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

function apiMessage(error: unknown, fallback: string) {
    if (error && (typeof error === "object") && ("data" in error)) {
        const data = (error as { data?: { message?: string } }).data;
        if (data?.message) return data.message;
    }
    return error instanceof Error ? error.message : fallback;
}

export default function AdminPage() {
    const { isAuthenticated, role, name } = useAuth();
    const initialized = useAppSelector(selectAuthInitialized);
    const dispatch = useAppDispatch();
    const [section, setSection] = useState<Section>("Overview");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [notice, setNotice] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const showError = (message: string) => {
        setError(message); setNotice("");
    };

    const showNotice = (message: string) => {
        setNotice(message); setError("");
    };

    const logoutBtnHandler = () => {
        dispatch(logout());
        router.push("/products");
    }

    const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value); setPage(1);
    }

    const itemsSectionHandler = (item: Section) => {
        setSection(item);
        setSearch("");
        setPage(1);
        setError("");
        setNotice("");
    }

    if (!initialized){
        return (
            <div className="flex min-h-screen items-center justify-center">
                <CircularProgress />
            </div>);
    }
    if (!isAuthenticated || role !== "Admin") {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#f7f6f2] p-6">
                <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
                    <h1 className="font-[family-name:var(--font-cormorant)] text-4xl">
                        Admin access required
                    </h1>
                    <p className="my-4 text-sm text-stone-600">
                        Sign in with an Admin account to manage the marketplace.
                    </p>
                    <Link href="/products" className="inline-block rounded-lg bg-[#293a32] px-5 py-3 text-sm text-white">
                        Back to the store
                    </Link>
                </div>
            </main>);
    }

    return (
        <main className="min-h-screen bg-[#f7f6f2] text-[#242923]">
            <header className="flex items-center justify-between border-b border-[#e7e3dc] bg-white px-5 py-4 md:px-8">
                <Link href="/" className="font-[family-name:var(--font-cormorant)] text-2xl tracking-wide">
                    BURMA COLLECTIONS
                    <span className="ml-2 font-sans text-[10px] uppercase tracking-[.2em] text-stone-500">Admin</span>
                </Link>
                <div className="flex items-center gap-4 text-sm">
                    <span className="hidden text-stone-500 sm:block">{name}</span>
                    <Link href="/" className="text-stone-600 hover:text-black">View store</Link>
                    <button onClick={logoutBtnHandler} className="rounded-lg border border-stone-200 px-3 py-2 hover:bg-stone-50">
                        Log out
                    </button>
                </div>
            </header>
            <div className="mx-auto grid max-w-[1600px] md:grid-cols-[230px_1fr]">
                <aside className="border-b border-[#e7e3dc] bg-white p-4 md:min-h-[calc(100vh-65px)] md:border-b-0 md:border-r md:p-6">
                    <p className="mb-4 px-3 text-[10px] uppercase tracking-[.2em] text-stone-400">Workspace</p>
                    <nav className="flex gap-2 overflow-x-auto md:flex-col">
                        {
                            sections.map((item) => (
                                <button key={item}
                                        onClick={()=>itemsSectionHandler(item)}
                                        className={`whitespace-nowrap rounded-lg px-3 py-2.5 text-left text-sm transition ${section === item ? "bg-[#e8eee9] font-medium text-[#293a32]" : "text-stone-600 hover:bg-stone-50"}`}
                                >
                                    {item}
                                </button>)
                            )
                        }
                    </nav>
                    <div className="mt-10 hidden rounded-xl bg-[#f7f6f2] p-4 md:block">
                        <p className="font-[family-name:var(--font-cormorant)] text-lg">Market notes</p>
                        <p className="mt-1 text-xs leading-5 text-stone-500">
                            Keep your collections current and your customers cared for.
                        </p>
                    </div>
                </aside>
                <section className="min-w-0 p-5 md:p-8 lg:p-10">
                    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="mb-2 text-[10px] uppercase tracking-[.22em] text-stone-400">Marketplace / {section}</p>
                            <h1 className="font-[family-name:var(--font-cormorant)] text-5xl">{section}</h1>
                        </div>
                            {
                                ["Products", "Brands", "Users", "Orders", "Reviews"].includes(section)
                                &&
                                <input value={search}
                                       onChange={onChangeHandler}
                                       placeholder={`Search ${section.toLowerCase()}…`}
                                       className="w-full max-w-xs rounded-lg border border-[#e5e0d8] bg-white px-4
                                       py-2.5 text-sm outline-none focus:border-[#41584b]"
                                />
                            }
                        </div>
                    {
                        notice && <Alert severity="success" className="!mb-5">{notice}</Alert>
                    }
                    {
                        error && <Alert severity="error" className="!mb-5">{error}</Alert>
                    }
                    {
                        section === "Overview" && <AdminOverview orderStatuses={orderStatuses} />
                    }
                    {
                        section === "Products" && <AdminProducts search={search} page={page} setPage={setPage} showError={showError} showNotice={showNotice} apiMessage={apiMessage} />
                    }
                    {
                        section === "Brands" && <AdminBrands search={search} showError={showError} showNotice={showNotice} apiMessage={apiMessage} />
                    }
                    {
                        section === "Users" && <AdminUsers search={search} page={page} setPage={setPage} showError={showError} showNotice={showNotice} apiMessage={apiMessage} />
                    }
                    {
                        section === "Orders" && <AdminOrders search={search} orderStatuses={orderStatuses} showError={showError} showNotice={showNotice} apiMessage={apiMessage} />
                    }
                    {
                        section === "Reviews" && <AdminReviews search={search} showError={showError} showNotice={showNotice} apiMessage={apiMessage} />
                    }
                </section>
            </div>
        </main>
    );
}
