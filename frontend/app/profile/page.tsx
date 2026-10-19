"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NavBar from "@/app/products/components/nav-bar/NavBar";
import ProductCard from "@/app/products/components/ProductCard";
import { useAuth } from "@/app/products/hooks/useAuth";
import { logout, profileUpdated, selectAuthInitialized } from "@/lib/features/auth/authSlice";
import { requestLoginModal } from "@/lib/features/auth/authEvents";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useGetUserProfileQuery, useUpdateUserProfileMutation, useUploadProfilePictureMutation, type UserProfileUpdate } from "@/lib/features/auth/authApiSlice";
import { useGetMyOrdersQuery, useCancelOrderMutation, type MyOrder } from "@/lib/features/product/adminApiSlice";
import { useGetWishlistQuery, useRemoveWishlistProductMutation } from "@/lib/features/product/wishlistApiSlice";

type Section = "Personal Information" | "My Orders" | "My Wishlist";

function getTokenUserId(token?: string) {
    try {
        const encoded = token?.split(".")[1];
        if (!encoded) return "";
        const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="))) as { userId?: string };
        return typeof payload.userId === "string" ? payload.userId : "";
    } catch {
        return "";
    }
}

function dateInputValue(value?: string | null) {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function displayDate(value?: string | null) {
    if (!value) return "Not provided";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Not provided" : date.toLocaleDateString("en-US", { timeZone: "UTC", year: "numeric", month: "long", day: "numeric" });
}

function formatAmount(amount: number) {
    return new Intl.NumberFormat("en-US").format(amount);
}

function errorMessage(error: unknown, fallback: string) {
    if (typeof error === "object" && error !== null && "data" in error) {
        const data = error.data;
        if (typeof data === "object" && data !== null && "message" in data && typeof data.message === "string") return data.message;
    }
    return fallback;
}

function OrderCard({ order }: { order: MyOrder }) {
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(order.orderStatus);
    const [cancelFeedback, setCancelFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

    useEffect(() => {
        setCurrentStatus(order.orderStatus);
    }, [order.orderStatus]);

    const isPending = currentStatus === "Pending";
    const statusClass = currentStatus === "Delivered" ? "bg-emerald-50 text-emerald-800" : currentStatus === "Cancelled" ? "bg-stone-100 text-stone-600" : "bg-[#f5eee6] text-[#805e3d]";

    const handleCancelOrder = async () => {
        const confirmed = window.confirm("Are you sure you want to cancel this order?");
        if (!confirmed) return;
        setCancelFeedback(null);
        try {
            const res = await cancelOrder(order._id).unwrap();
            setCurrentStatus("Cancelled");
            setCancelFeedback({
                type: "success",
                message: res?.message || "Order cancelled successfully.",
            });
        } catch (error) {
            setCancelFeedback({
                type: "error",
                message: errorMessage(error, "Could not cancel order. Please try again."),
            });
        }
    };

    return <article className="rounded-xl border border-[#e8e4dc] bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-xs uppercase tracking-[0.17em] text-stone-500">Order #{order._id.slice(-8)}</p><p className="mt-2 text-sm text-stone-600">{displayDate(order.createdAt)}</p></div>
            <div className="flex items-center justify-between gap-4 sm:justify-end"><span className={`rounded-full px-3 py-1 text-xs ${statusClass}`}>{currentStatus}</span><span className="text-sm font-medium text-[#292d29]">{formatAmount(order.totalAmount)} MMK</span></div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">
            <p className="text-xs text-stone-500">{order.items.length} {order.items.length === 1 ? "item" : "items"}</p>
            <div className="flex items-center gap-3">
                {isPending && <button
                    type="button"
                    onClick={handleCancelOrder}
                    disabled={isCancelling}
                    className="rounded-full border border-red-300 px-3.5 py-1 text-xs uppercase tracking-[0.12em] text-red-700 transition-colors hover:border-red-400 hover:bg-red-50 disabled:opacity-50"
                >
                    {isCancelling ? "Cancelling…" : "Cancel Order"}
                </button>}
                <button type="button" onClick={() => setDetailsOpen((open) => !open)} aria-expanded={detailsOpen} className="text-xs uppercase tracking-[0.13em] text-[#9d7952] underline underline-offset-4 hover:text-[#805e3d]">{detailsOpen ? "Hide details" : "View details"}</button>
            </div>
        </div>
        {cancelFeedback && <p role={cancelFeedback.type === "error" ? "alert" : "status"} className={`mt-3 text-xs ${cancelFeedback.type === "error" ? "text-red-700" : "text-emerald-800"}`}>{cancelFeedback.message}</p>}
        {detailsOpen && <div className="mt-4 divide-y divide-stone-100">{order.items.map((item, index) => {
            const product = typeof item.product === "string" ? null : item.product;
            return <div key={`${order._id}-${index}`} className="flex items-center gap-3 py-3">
                {product?.imageUrl?.[0] ? <img src={product.imageUrl[0]} alt={product.title} className="h-16 w-12 shrink-0 bg-stone-100 object-cover" /> : <div aria-hidden="true" className="h-16 w-12 shrink-0 bg-stone-100" />}
                <div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm text-stone-800">{product?.title ?? "Product details unavailable"}</p><p className="mt-1 text-xs text-stone-500">{item.size} · {item.color} · Qty {item.quantity}</p></div>
                <span className="shrink-0 text-xs text-stone-600">{formatAmount(item.price * item.quantity)} MMK</span>
            </div>;
        })}</div>}
    </article>;
}

export default function ProfilePage() {
    const { token, isAuthenticated } = useAuth();
    const authInitialized = useAppSelector(selectAuthInitialized);
    const userId = useMemo(() => getTokenUserId(token), [token]);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [section, setSection] = useState<Section>("Personal Information");
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<UserProfileUpdate>({ name: "", email: "", phone: "", address: "", dateOfBirth: "", profilePic: "" });
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const { data: profile, isLoading: isProfileLoading, isError: isProfileError, refetch: refetchProfile } = useGetUserProfileQuery(userId, { skip: !isAuthenticated || !userId });
    const [updateProfile, { isLoading: isSaving }] = useUpdateUserProfileMutation();
    const [uploadProfilePicture, { isLoading: isUploading }] = useUploadProfilePictureMutation();
    const { data: orders, isLoading: isOrdersLoading, isError: isOrdersError, refetch: refetchOrders } = useGetMyOrdersQuery(undefined, { skip: !isAuthenticated || section !== "My Orders" });
    const { data: wishlist, isLoading: isWishlistLoading, isError: isWishlistError, refetch: refetchWishlist } = useGetWishlistQuery(undefined, { skip: !isAuthenticated || section !== "My Wishlist" });
    const [removeWishlistProduct, { isLoading: isRemovingWishlist }] = useRemoveWishlistProductMutation();

    useEffect(() => {
        if (!profile || editing) return;
        setForm({ name: profile.name ?? "", email: profile.email ?? "", phone: profile.phone ?? "", address: profile.address ?? "", dateOfBirth: dateInputValue(profile.dateOfBirth), profilePic: profile.profilePic ?? "" });
    }, [profile, editing]);

    const handleFieldChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.currentTarget;
        if (name === "name" || name === "email" || name === "phone" || name === "address" || name === "dateOfBirth") {
            setForm((current) => ({ ...current, [name]: value }));
        }
    };

    const handlePictureChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setFeedback({ type: "error", message: "Choose an image file for your profile picture." });
            return;
        }
        const data = new FormData();
        data.append("profilePic", file);
        setFeedback(null);
        try {
            const result = await uploadProfilePicture(data).unwrap();
            const url = result.urls[0];
            if (!url) throw new Error("The upload did not return an image URL.");
            setForm((current) => ({ ...current, profilePic: url }));
            setFeedback({ type: "success", message: "Profile picture uploaded. Save changes to apply it." });
        } catch (error) {
            setFeedback({ type: "error", message: errorMessage(error, "Could not upload your profile picture. Please try again.") });
        }
    };

    const cancelEditing = () => {
        if (profile) setForm({ name: profile.name ?? "", email: profile.email ?? "", phone: profile.phone ?? "", address: profile.address ?? "", dateOfBirth: dateInputValue(profile.dateOfBirth), profilePic: profile.profilePic ?? "" });
        setEditing(false);
        setFeedback(null);
    };

    const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!userId || !form.name.trim() || !form.email.trim()) {
            setFeedback({ type: "error", message: "Name and email are required." });
            return;
        }
        setFeedback(null);
        const profileUpdate: UserProfileUpdate = { ...form, name: form.name.trim(), email: form.email.trim(), phone: form.phone?.trim() ?? "", address: form.address?.trim() ?? "", dateOfBirth: form.dateOfBirth || null };
        try {
            const response = await updateProfile({ userId, profile: profileUpdate }).unwrap();
            const saved = response.data;
            dispatch(profileUpdated({ name: saved.name, email: saved.email, profilePic: saved.profilePic ?? "" }));
            setForm({ ...profileUpdate, name: saved.name, email: saved.email, profilePic: saved.profilePic ?? "" });
            setEditing(false);
            setFeedback({ type: "success", message: "Your profile has been updated." });
        } catch (error) {
            setFeedback({ type: "error", message: errorMessage(error, "Could not save your profile. Please try again.") });
        }
    };

    const sections: Section[] = ["Personal Information", "My Orders", "My Wishlist"];

    return <>
        <NavBar />
        <main className="min-h-[calc(100vh-80px)] bg-[#F5F8FF] px-4 py-8 text-[#292d29] sm:px-6 lg:px-10 lg:py-12">
            <div className="mx-auto max-w-7xl">
                <header className="mb-8"><p className="text-[10px] uppercase tracking-[0.3em] text-[#9d7952]">Burma Collections · Account</p><h1 className="mt-2 font-cormorant text-4xl tracking-wide sm:text-5xl">My Profile</h1><p className="mt-2 text-sm text-stone-500">A considered space for your details, orders, and saved pieces.</p></header>
                {authInitialized && !isAuthenticated ? <section className="rounded-2xl border border-[#e8e4dc] bg-white px-6 py-16 text-center"><h2 className="font-cormorant text-3xl">Sign in to your account</h2><p className="mt-2 text-sm text-stone-500">Sign in to view your personal information, orders, and saved pieces.</p><button type="button" onClick={requestLoginModal} className="mt-6 rounded-full bg-[#293a32] px-6 py-3 text-xs uppercase tracking-[0.15em] text-white hover:bg-[#40564a]">Sign in</button></section> : !authInitialized ? <p role="status" className="py-16 text-center text-sm text-stone-500">Restoring your saved session…</p> : <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
                    <aside className="h-fit rounded-2xl border border-[#e8e4dc] bg-white p-3 lg:sticky lg:top-6">
                        <div className="hidden px-4 py-5 lg:block"><p className="text-[10px] uppercase tracking-[0.2em] text-stone-400">Account menu</p><p className="mt-2 truncate font-cormorant text-2xl">{profile?.name || "My account"}</p></div>
                        <nav aria-label="Profile sections" className="flex gap-2 overflow-x-auto lg:flex-col lg:border-t lg:border-stone-100 lg:pt-3">
                            {sections.map((item) => <button key={item} type="button" onClick={() => { setSection(item); setFeedback(null); }} aria-current={section === item ? "page" : undefined} className={`shrink-0 rounded-lg px-4 py-3 text-left text-sm transition-colors ${section === item ? "bg-[#f5eee6] text-[#805e3d]" : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"}`}>{item}</button>)}
                        </nav>
                        <button type="button" onClick={() => { dispatch(logout()); router.push("/"); }} className="mt-3 hidden w-full rounded-lg px-4 py-3 text-left text-sm text-stone-500 transition-colors hover:bg-stone-50 hover:text-stone-900 lg:block">Log out</button>
                    </aside>

                    <section className="min-w-0 rounded-2xl border border-[#e8e4dc] bg-white p-5 sm:p-8">
                        {section === "Personal Information" && <>
                            <div className="mb-7 flex flex-wrap items-start justify-between gap-4 border-b border-stone-100 pb-5"><div><p className="text-[10px] uppercase tracking-[0.22em] text-[#9d7952]">Your details</p><h2 className="mt-1 font-cormorant text-3xl">Personal Information</h2></div>{!editing && <button type="button" disabled={isProfileLoading || isProfileError} onClick={() => { setFeedback(null); setEditing(true); }} className="rounded-full border border-[#9d7952] px-5 py-2 text-xs uppercase tracking-[0.14em] text-[#805e3d] transition-colors hover:bg-[#9d7952] hover:text-white disabled:opacity-50">Edit Profile</button>}</div>
                            {isProfileLoading ? <p role="status" className="py-10 text-sm text-stone-500">Loading your profile…</p> : isProfileError ? <div className="py-8"><p role="alert" className="text-sm text-red-700">Your profile could not be loaded.</p><button type="button" onClick={() => refetchProfile()} className="mt-3 text-xs underline">Try again</button></div> : profile && <form onSubmit={saveProfile}>
                                <div className="mb-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                                    <div className="h-24 w-24 overflow-hidden rounded-full border border-stone-200 bg-stone-100">{form.profilePic ? <img src={form.profilePic} alt={`${form.name || "Your"} profile`} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center font-cormorant text-3xl text-stone-500">{form.name.charAt(0).toUpperCase() || "U"}</div>}</div>
                                    <div><p className="font-cormorant text-2xl">{form.name || profile.name}</p><p className="mt-1 text-sm text-stone-500">{profile.role}</p>{editing && <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-xs uppercase tracking-[0.12em] text-[#9d7952] underline underline-offset-4"><input type="file" accept="image/*" className="sr-only" disabled={isUploading} onChange={handlePictureChange} />{isUploading ? "Uploading…" : "Change profile picture"}</label>}</div>
                                </div>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <ProfileField label="Full name" name="name" value={form.name} editing={editing} onChange={handleFieldChange} required />
                                    <ProfileField label="Email" name="email" type="email" value={form.email} editing={editing} onChange={handleFieldChange} required />
                                    <ProfileField label="Phone number" name="phone" value={form.phone ?? ""} editing={editing} onChange={handleFieldChange} />
                                    <ProfileField label="Date of birth" name="dateOfBirth" type={editing ? "date" : "text"} value={editing ? form.dateOfBirth ?? "" : displayDate(profile.dateOfBirth)} editing={editing} onChange={handleFieldChange} />
                                    <div className="sm:col-span-2"><ProfileField label="Address" name="address" value={form.address ?? ""} editing={editing} onChange={handleFieldChange} /></div>
                                </div>
                                {feedback && <p role={feedback.type === "error" ? "alert" : "status"} className={`mt-5 text-sm ${feedback.type === "error" ? "text-red-700" : "text-emerald-800"}`}>{feedback.message}</p>}
                                {editing && <div className="mt-7 flex flex-wrap justify-end gap-3 border-t border-stone-100 pt-5"><button type="button" onClick={cancelEditing} disabled={isSaving || isUploading} className="rounded-full border border-stone-300 px-5 py-2.5 text-xs uppercase tracking-[0.12em] text-stone-600 hover:border-stone-500 disabled:opacity-50">Cancel</button><button type="submit" disabled={isSaving || isUploading} className="rounded-full bg-[#293a32] px-6 py-2.5 text-xs uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#40564a] disabled:opacity-50">{isSaving ? "Saving…" : "Save Changes"}</button></div>}
                            </form>}
                        </>}

                        {section === "My Orders" && <><div className="mb-7 border-b border-stone-100 pb-5"><p className="text-[10px] uppercase tracking-[0.22em] text-[#9d7952]">Your purchases</p><h2 className="mt-1 font-cormorant text-3xl">My Orders</h2></div>{isOrdersLoading ? <p role="status" className="py-10 text-sm text-stone-500">Loading your orders…</p> : isOrdersError ? <div className="py-8"><p role="alert" className="text-sm text-red-700">Your orders could not be loaded.</p><button type="button" onClick={() => refetchOrders()} className="mt-3 text-xs underline">Try again</button></div> : orders?.length ? <div className="space-y-4">{orders.map((order) => <OrderCard key={order._id} order={order} />)}</div> : <div className="rounded-xl border border-dashed border-stone-300 px-5 py-14 text-center"><p className="font-cormorant text-2xl">No orders yet</p><p className="mt-2 text-sm text-stone-500">Your purchases will appear here.</p><Link href="/products" className="mt-5 inline-block text-xs uppercase tracking-[0.15em] text-[#9d7952] underline underline-offset-4">Explore the collection</Link></div>}</>}

                        {section === "My Wishlist" && <><div className="mb-7 border-b border-stone-100 pb-5"><p className="text-[10px] uppercase tracking-[0.22em] text-[#9d7952]">Saved for later</p><h2 className="mt-1 font-cormorant text-3xl">My Wishlist</h2></div>{isWishlistLoading ? <p role="status" className="py-10 text-sm text-stone-500">Loading your wishlist…</p> : isWishlistError ? <div className="py-8"><p role="alert" className="text-sm text-red-700">Your wishlist could not be loaded.</p><button type="button" onClick={() => refetchWishlist()} className="mt-3 text-xs underline">Try again</button></div> : wishlist?.products.length ? <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">{wishlist.products.map((product) => <article key={product._id} className="min-w-0"><ProductCard product={product} showFavorite={false} /><button type="button" disabled={isRemovingWishlist} onClick={() => product._id && removeWishlistProduct(product._id)} className="mt-2 px-1 text-[10px] uppercase tracking-[0.15em] text-stone-500 underline underline-offset-4 hover:text-stone-900 disabled:opacity-50">Remove from wishlist</button></article>)}</div> : <div className="rounded-xl border border-dashed border-stone-300 px-5 py-14 text-center"><p className="font-cormorant text-2xl">Your wishlist is empty</p><p className="mt-2 text-sm text-stone-500">Save a piece to keep it close.</p><Link href="/products" className="mt-5 inline-block text-xs uppercase tracking-[0.15em] text-[#9d7952] underline underline-offset-4">Explore the collection</Link></div>}</>}
                    </section>
                </div>}
            </div>
        </main>
    </>;
}

function ProfileField({ label, name, value, editing, onChange, required = false, type = "text" }: { label: string; name: keyof UserProfileUpdate; value: string; editing: boolean; onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; required?: boolean; type?: string }) {
    return <label className="block"><span className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-stone-500">{label}</span>{editing ? <input name={name} type={type} value={value} onChange={onChange} required={required} className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 outline-none transition-colors focus:border-[#9d7952]" /> : <span className="block min-h-10 border-b border-stone-100 py-2.5 text-sm text-stone-800">{value || "Not provided"}</span>}</label>;
}
