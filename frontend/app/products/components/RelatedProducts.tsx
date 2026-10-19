"use client";

import { useMemo } from "react";
import ProductCard from "@/app/products/components/ProductCard";
import { useGetProductsQuery } from "@/lib/features/product/productApiSlice";
import type { ProductListItem } from "@/lib/features/product/types";

function brandId(product: ProductListItem) {
    return typeof product.brand === "string" ? product.brand : product.brand?._id ?? product.brand?.name ?? "";
}

export default function RelatedProducts({ product }: { product: ProductListItem }) {
    const { data: products, isLoading, isError } = useGetProductsQuery(undefined);
    const related = useMemo(() => {
        if (!products) return [];
        const selected = new Map<string, ProductListItem>();
        const addMatches = (matches: ProductListItem[]) => {
            for (const candidate of matches) {
                if (candidate._id && candidate._id !== product._id && !selected.has(candidate._id) && selected.size < 5) {
                    selected.set(candidate._id, candidate);
                }
            }
        };
        addMatches(products.filter((candidate) => candidate.category === product.category));
        if (selected.size < 5) addMatches(products.filter((candidate) => candidate.headCategory === product.headCategory));
        if (selected.size < 5) {
            const currentBrand = brandId(product);
            if (currentBrand) addMatches(products.filter((candidate) => brandId(candidate) === currentBrand));
        }
        return [...selected.values()];
    }, [products, product]);

    return <section className="mx-auto mt-12 w-[95%] animate-luxury-fade-in [animation-delay:180ms]" aria-labelledby="related-products-heading">
        <h2 id="related-products-heading" className="mb-5 font-serif text-2xl text-stone-900">You may also like</h2>
        {isLoading && <p role="status" className="text-sm text-stone-600">Loading related products…</p>}
        {isError && <p role="alert" className="text-sm text-red-700">Related products could not be loaded.</p>}
        {!isLoading && !isError && related.length === 0 && <p className="text-sm text-stone-600">No related products are available.</p>}
        {related.length > 0 && <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{related.map((item) => <ProductCard key={item._id} product={item} />)}</div>}
    </section>;
}
