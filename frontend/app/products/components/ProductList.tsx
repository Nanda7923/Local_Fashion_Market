"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ProductCard from "@/app/products/components/ProductCard";
import ProductCardSkeleton from "@/app/products/components/ProductCardSkeleton";
import ProductFilters from "@/app/products/components/ProductFilters";
import { useProductListFilters } from "@/app/products/hooks/useProductListFilters";
import { useGetProductsQuery } from "@/lib/features/product/productApiSlice";
import type { ProductBrandSummary, ProductListItem } from "@/lib/features/product/types";
import { buildCategoryOptions, displayCategory, type CategoryOption } from "@/app/products/utils/productList";

export type Brand = ProductBrandSummary;
export type Product = ProductListItem;

export default function ProductList({ categorySlug: selectedCategorySlug }: { categorySlug?: string }) {
    const { data = [], error, isLoading } = useGetProductsQuery(undefined);
    const products = useMemo(() => {
        const seen = new Set<string>();
        return (data as Product[]).filter((product) => {
            const key = product._id ?? `${product.title}-${product.category}-${product.price}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [data]);
    const categories = useMemo(() => buildCategoryOptions(products), [products]);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const categoriesForHead = useMemo(() => categories, [categories]);
    const {
        selectedCategory,
        selectedHeadCategory,
        queryString,
        selectedBrands,
        selectedSizes,
        selectedColors,
        search,
        minPrice,
        maxPrice,
        inStockOnly,
        sort,
        brandOptions,
        sizes,
        colors,
        maxAvailablePrice,
        filtered,
        pageCount,
        page,
        shown,
        hasMultiplePages,
        toggleMulti,
        setSingle,
        setInStockOnly,
        clearFilters,
        changePage,
    } = useProductListFilters({ products, categories, categorySlug: selectedCategorySlug });
    const title = selectedCategory?.label ?? selectedHeadCategory ?? (selectedCategorySlug ? displayCategory(selectedCategorySlug.replace(/-/g, " ")) : "All Products");
    const categoryHref = (category: CategoryOption) => {
        const preserved = new URLSearchParams(queryString);
        preserved.delete("page");
        const query = preserved.toString();
        return `/products/${category.slug}${query ? `?${query}` : ""}`;
    };

    const filterPanel = <ProductFilters
        categories={categoriesForHead}
        selectedCategory={selectedCategory}
        categoryHref={categoryHref}
        minPrice={minPrice}
        maxPrice={maxPrice}
        maxAvailablePrice={maxAvailablePrice}
        onMinPriceChange={(value) => setSingle("minPrice", value)}
        onMaxPriceChange={(value) => setSingle("maxPrice", value)}
        brandOptions={brandOptions}
        selectedBrands={selectedBrands}
        onToggleBrand={(value) => toggleMulti("brand", value)}
        sizes={sizes}
        selectedSizes={selectedSizes}
        onToggleSize={(value) => toggleMulti("size", value)}
        colors={colors}
        selectedColors={selectedColors}
        onToggleColor={(value) => toggleMulti("color", value)}
        inStockOnly={inStockOnly}
        onInStockChange={setInStockOnly}
        onClearFilters={clearFilters}
    />;

    if (isLoading && products.length === 0) {
        return (
            <main className="min-h-screen bg-[#fffefa] px-4 pb-16 pt-8 text-[#242923] sm:px-6 lg:px-10">
                <div className="mx-auto max-w-[1500px]">
                    <div aria-hidden="true" className="mb-8 flex gap-5 overflow-x-auto border-b border-stone-200 pb-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-4 w-20 shrink-0 rounded-xs bg-[#ebe6db]/60 skeleton-shimmer" />
                        ))}
                    </div>
                    <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-stone-400">The collection</p>
                            <h1 className="font-[family-name:var(--font-cormorant)] text-5xl sm:text-6xl">{title}</h1>
                        </div>
                        <div aria-hidden="true" className="flex items-center gap-3">
                            <div className="h-9 w-48 rounded-xs bg-[#ebe6db]/50 skeleton-shimmer sm:w-64" />
                            <div className="h-9 w-28 rounded-xs bg-[#ebe6db]/50 skeleton-shimmer" />
                        </div>
                    </div>
                    <div aria-hidden="true" className="mb-4 flex items-center justify-between border-b border-stone-200 py-3 text-xs text-stone-500">
                        <div className="h-3 w-16 rounded-xs bg-[#ebe6db]/60 skeleton-shimmer" />
                        <div className="h-3 w-24 rounded-xs bg-[#ebe6db]/60 skeleton-shimmer" />
                    </div>
                    <div className="grid gap-8 lg:grid-cols-[230px_minmax(0,1fr)]">
                        <aside className="hidden lg:block">
                            <div className="sticky top-6 space-y-4 rounded-xl border border-stone-200 bg-white/70 p-5">
                                <div className="h-4 w-24 rounded-xs bg-[#ebe6db]/60 skeleton-shimmer" />
                                <div className="space-y-2.5 pt-2">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div key={i} className="h-3 w-full rounded-xs bg-[#ebe6db]/50 skeleton-shimmer" />
                                    ))}
                                </div>
                            </div>
                        </aside>
                        <section aria-label={`${title} products`} className="min-w-0">
                            <div
                                role="status"
                                aria-busy="true"
                                aria-label="Loading collection pieces"
                                className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                            >
                                <span className="sr-only">Loading collection pieces…</span>
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <ProductCardSkeleton key={i} />
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        );
    }
    if (error) return <div className="mx-auto max-w-7xl px-5 py-20 text-center text-sm text-rose-700">Could not load products. Please try again.</div>;

    return <main className="min-h-screen bg-[#fffefa] px-4 pb-16 pt-8 text-[#242923] sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1500px]">
            <nav aria-label="Product categories" className="mb-8 flex gap-5 overflow-x-auto border-b border-stone-200 pb-4">{categories.map((category) => <Link key={category.slug} href={categoryHref(category)} aria-current={selectedCategory?.slug === category.slug ? "page" : undefined} className={`shrink-0 text-xs uppercase tracking-[0.13em] ${selectedCategory?.slug === category.slug ? "border-b border-black pb-1 text-black" : "text-stone-500 hover:text-black"}`}>{category.label}</Link>)}</nav>
            <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-stone-400">The collection</p><h1 className="font-[family-name:var(--font-cormorant)] text-5xl sm:text-6xl">{title}</h1></div><div className="flex flex-wrap items-center gap-3"><label className="relative flex min-w-[220px] flex-1 items-center sm:flex-none"><span className="sr-only">Search products and brands</span><input value={search} onChange={(event) => setSingle("q", event.target.value)} placeholder="Search products or brands" className="w-full border-b border-stone-300 bg-transparent py-2 pr-2 text-sm outline-none placeholder:text-stone-400 focus:border-black sm:w-64" /></label><label className="sr-only" htmlFor="product-sort">Sort products</label><select id="product-sort" value={sort} onChange={(event) => setSingle("sort", event.target.value === "newest" ? "" : event.target.value)} className="border-b border-stone-300 bg-transparent py-2 text-sm outline-none"><option value="newest">Newest</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select><button type="button" onClick={() => setMobileFiltersOpen(true)} className="rounded-full border border-stone-300 px-4 py-2 text-xs uppercase tracking-wider lg:hidden">Filters</button></div></div>
            <div className="mb-4 flex items-center justify-between border-b border-stone-200 py-3 text-xs text-stone-500"><span>{filtered.length} {filtered.length === 1 ? "piece" : "pieces"}</span><span>{isLoading ? "Updating…" : `Page ${page} of ${pageCount}`}</span></div>
            <div className="grid gap-8 lg:grid-cols-[230px_minmax(0,1fr)]">
                <aside className="hidden lg:block"><div className="sticky top-6 rounded-xl border border-stone-200 bg-white/70 p-5">{filterPanel}</div></aside>
                <section aria-label={`${title} products`} className="min-w-0">
                    {shown.length ? (
                        <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                            {shown.map((product) => <ProductCard key={product._id} product={product} />)}
                        </div>
                    ) : isLoading ? (
                        <div
                            role="status"
                            aria-busy="true"
                            aria-label="Loading collection pieces"
                            className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                        >
                            <span className="sr-only">Loading collection pieces…</span>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <ProductCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-stone-200 bg-white px-6 py-20 text-center">
                            <p className="font-[family-name:var(--font-cormorant)] text-3xl">No pieces found</p>
                            <p className="mt-2 text-sm text-stone-500">Try adjusting your filters or search.</p>
                        </div>
                    )}
                    {hasMultiplePages && <nav aria-label="Product pages" className="mt-12 flex items-center justify-center gap-5 border-t border-stone-200 pt-6"><button type="button" disabled={page <= 1} onClick={() => changePage(page - 1)} className="text-xs uppercase tracking-wider text-stone-600 disabled:opacity-30">Previous</button><span className="text-xs text-stone-500">{page} / {pageCount}</span><button type="button" disabled={page >= pageCount} onClick={() => changePage(page + 1)} className="text-xs uppercase tracking-wider text-stone-600 disabled:opacity-30">Next</button></nav>}
                </section>
            </div>
        </div>
        {mobileFiltersOpen && <div className="fixed inset-0 z-[80] bg-black/40 lg:hidden" onMouseDown={(event) => { if (event.target === event.currentTarget) setMobileFiltersOpen(false); }}><section role="dialog" aria-modal="true" aria-label="Product filters" className="absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto bg-[#fffefa] p-6 shadow-xl"><div className="mb-7 flex items-center justify-between"><h2 className="font-[family-name:var(--font-cormorant)] text-3xl">Refine</h2><button type="button" aria-label="Close filters" onClick={() => setMobileFiltersOpen(false)} className="text-2xl text-stone-500">×</button></div>{filterPanel}<button type="button" onClick={() => setMobileFiltersOpen(false)} className="mt-8 w-full rounded-full bg-[#293a32] py-3 text-xs uppercase tracking-[0.15em] text-white">View {filtered.length} results</button></section></div>}
    </main>;
}
