"use client";

import Link from "next/link";
import { useGetProductsQuery } from "@/lib/features/product/productApiSlice";
import { HEAD_CATEGORIES } from "@/app/schema/ProductSchema";

type Props = { onNavigate: () => void };
type MenuGroup = { label: string; categories: Map<string, string> };

function canonicalHeadCategory(value: string) {
    const trimmed = value.trim();
    if (trimmed.toLocaleLowerCase() === "pants") return "Bottomwear";
    return HEAD_CATEGORIES.find((category) => category.toLocaleLowerCase() === trimmed.toLocaleLowerCase());
}

export default function CategorySection({ onNavigate }: Props) {
    const { data: products = [], isLoading, isError } = useGetProductsQuery(undefined);
    const groups = new Map<string, MenuGroup>();

    for (const product of products) {
        const category = product.category?.trim();
        const headCategory = typeof product.headCategory === "string" ? canonicalHeadCategory(product.headCategory) : undefined;
        if (!category || !headCategory) continue;
        const group = groups.get(headCategory) ?? { label: headCategory, categories: new Map<string, string>() };
        const categoryKey = category.toLocaleLowerCase();
        if (!group.categories.has(categoryKey)) group.categories.set(categoryKey, category);
        groups.set(headCategory, group);
    }

    const orderedGroups = HEAD_CATEGORIES.flatMap((category) => groups.has(category) ? [groups.get(category)!] : []);

    return <section aria-label="Shop products by category" className="h-[calc(100dvh-5rem)] overflow-y-auto px-5 pb-8 sm:px-8 lg:px-10">
        {isLoading ?
            <p className="py-8 text-sm text-stone-500" role="status">Loading product categories…</p>
            : isError ?
                <p className="py-8 text-sm text-rose-700" role="alert">Could not load product categories.</p>
                : orderedGroups.length === 0 ? <p className="py-8 text-sm text-stone-500">No product categories are available yet.</p>
                    : <div className="grid grid-cols-1 gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {orderedGroups.map((group) => (
                            <section key={group.label} className="min-w-0 border-t border-stone-200 pt-4">
                                <Link href={`/products/${encodeURIComponent(group.label)}`} onClick={onNavigate} className="inline-block text-xs font-semibold uppercase tracking-[0.17em] text-[#293a32] transition-colors hover:text-stone-500">
                                    {group.label}
                                </Link>
                                <ul className="mt-4 space-y-3">{[...group.categories.values()].map((category) => (
                                    <li key={category.toLocaleLowerCase()}>
                                        <Link href={`/products/${encodeURIComponent(category.toLowerCase())}`}
                                                                                 onClick={onNavigate}
                                              className="text-sm text-stone-600 transition-colors hover:text-black">{category}
                                        </Link>
                                    </li>))}
                                </ul>
                            </section>))}
                    </div>}
    </section>;
}
