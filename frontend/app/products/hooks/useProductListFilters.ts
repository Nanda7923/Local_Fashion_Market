import { useCallback, useEffect, useMemo, useState } from "react";
import {
    canonicalHeadCategory,
    getBrandKey,
    getBrandName,
    matchHeadCategory,
    normalizeValues,
    uniqueOptions,
    BrandOption,
    CategoryOption,
} from "@/app/products/utils/productList";
import type { ProductListItem } from "@/lib/features/product/types";

const pageSize = 12;

interface UseProductListFiltersOptions {
    products: ProductListItem[];
    categories: CategoryOption[];
    categorySlug?: string;
}

function productMatchesHeadCategory(product: ProductListItem, headCategory: string): boolean {
    const target = headCategory.toLocaleLowerCase();
    const productHead = (product.headCategory || "").trim().toLocaleLowerCase();
    const productDept = (product.department || "").trim().toLocaleLowerCase();

    if (productHead === target || productDept === target) return true;
    if (canonicalHeadCategory(product.headCategory)?.toLocaleLowerCase() === target) return true;
    if (canonicalHeadCategory(product.department)?.toLocaleLowerCase() === target) return true;

    if (target === "bottomwear") {
        if (productHead === "pants" || productDept === "pants") return true;
    }
    return false;
}

export function useProductListFilters({ products, categories, categorySlug }: UseProductListFiltersOptions) {
    const normalizedCategorySlug = categorySlug ? categorySlug.trim().toLocaleLowerCase() : "";
    let decodedCategorySlug = normalizedCategorySlug;
    try {
        decodedCategorySlug = decodeURIComponent(normalizedCategorySlug);
    } catch {
        // ignore malformed URI
    }

    const selectedCategory = useMemo(() => {
        if (!normalizedCategorySlug) return undefined;
        return categories.find((category) => {
            const catSlug = category.slug.toLocaleLowerCase();
            const catKey = category.key.toLocaleLowerCase();
            return (
                catSlug === normalizedCategorySlug ||
                catSlug === decodedCategorySlug ||
                catKey === normalizedCategorySlug ||
                catKey === decodedCategorySlug
            );
        });
    }, [categories, normalizedCategorySlug, decodedCategorySlug]);

    const selectedHeadCategory = useMemo(() => {
        if (selectedCategory || !categorySlug) return undefined;
        return matchHeadCategory(categorySlug);
    }, [selectedCategory, categorySlug]);

    const [queryString, setQueryString] = useState("");

    useEffect(() => {
        const readLocation = () => setQueryString(window.location.search.replace(/^\?/, ""));
        readLocation();
        window.addEventListener("popstate", readLocation);
        return () => window.removeEventListener("popstate", readLocation);
    }, [categorySlug]);

    const params = useMemo(() => new URLSearchParams(queryString), [queryString]);
    const selectedBrands = params.getAll("brand");
    const selectedSizes = params.getAll("size");
    const selectedColors = params.getAll("color");
    const search = params.get("q") ?? "";
    const minPrice = params.get("minPrice") ?? "";
    const maxPrice = params.get("maxPrice") ?? "";
    const inStockOnly = params.get("inStock") === "1";
    const sort = params.get("sort") ?? "newest";
    const requestedPage = Math.max(1, Number(params.get("page")) || 1);

    const updateParams = useCallback((update: (next: URLSearchParams) => void, resetPage = true) => {
        const next = new URLSearchParams(queryString);
        update(next);
        if (resetPage) next.delete("page");
        const value = next.toString();
        setQueryString(value);
        const url = `${window.location.pathname}${value ? `?${value}` : ""}`;
        window.history.pushState({}, "", url);
    }, [queryString]);

    const brandOptions = useMemo<BrandOption[]>(() => {
        const options = new Map<string, string>();
        products.forEach((product) => options.set(getBrandKey(product.brand), getBrandName(product.brand)));
        return [...options].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
    }, [products]);
    const sizes = useMemo(() => uniqueOptions(products.flatMap((product) => product.size ?? [])), [products]);
    const colors = useMemo(() => uniqueOptions(products.flatMap((product) => product.color ?? [])), [products]);
    const maxAvailablePrice = useMemo(() => Math.ceil(Math.max(0, ...products.map((product) => Number(product.price) || 0))), [products]);

    const filtered = useMemo(() => {
        const searchValue = search.trim().toLocaleLowerCase();
        const brandValues = new Set(selectedBrands);
        const sizeValues = new Set(normalizeValues(selectedSizes));
        const colorValues = new Set(normalizeValues(selectedColors));
        const min = minPrice === "" ? undefined : Number(minPrice);
        const max = maxPrice === "" ? undefined : Number(maxPrice);
        const validCategorySlug = !categorySlug || Boolean(selectedCategory) || Boolean(selectedHeadCategory);
        return products.filter((product) => {
            if (!validCategorySlug) return false;
            if (selectedCategory && product.category?.trim().toLocaleLowerCase() !== selectedCategory.key) return false;
            if (selectedHeadCategory && !productMatchesHeadCategory(product, selectedHeadCategory)) return false;
            if (searchValue && !`${product.title} ${getBrandName(product.brand)}`.toLocaleLowerCase().includes(searchValue)) return false;
            if (min !== undefined && Number(product.price) < min) return false;
            if (max !== undefined && Number(product.price) > max) return false;
            if (brandValues.size && !brandValues.has(getBrandKey(product.brand))) return false;
            if (sizeValues.size && !(product.size ?? []).some((value) => sizeValues.has(value.trim().toLocaleLowerCase()))) return false;
            if (colorValues.size && !(product.color ?? []).some((value) => colorValues.has(value.trim().toLocaleLowerCase()))) return false;
            if (inStockOnly && !product.inStock) return false;
            return true;
        }).sort((a, b) => {
            if (sort === "price-asc") return Number(a.price) - Number(b.price);
            if (sort === "price-desc") return Number(b.price) - Number(a.price);
            return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
        });
    }, [products, categorySlug, selectedCategory, selectedHeadCategory, search, minPrice, maxPrice, selectedBrands.join("|"), selectedSizes.join("|"), selectedColors.join("|"), inStockOnly, sort]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
    const page = Math.min(requestedPage, pageCount);
    const shown = filtered.slice((page - 1) * pageSize, page * pageSize);

    const toggleMulti = (key: "brand" | "size" | "color", value: string) => updateParams((next) => {
        const values = next.getAll(key);
        next.delete(key);
        const selected = values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
        selected.forEach((item) => next.append(key, item));
    });
    const setSingle = (key: string, value: string) => updateParams((next) => { if (value) next.set(key, value); else next.delete(key); });
    const setInStockOnly = (checked: boolean) => updateParams((next) => checked ? next.set("inStock", "1") : next.delete("inStock"));
    const clearFilters = () => updateParams((next) => { ["q", "minPrice", "maxPrice", "brand", "size", "color", "inStock", "sort", "page"].forEach((key) => next.delete(key)); }, false);
    const changePage = (nextPage: number) => updateParams((next) => next.set("page", String(nextPage)), false);

    return {
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
        hasMultiplePages: filtered.length > pageSize,
        toggleMulti,
        setSingle,
        setInStockOnly,
        clearFilters,
        changePage,
    };
}
