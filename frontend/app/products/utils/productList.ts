import type { ProductListItem } from "@/lib/features/product/types";
import { HEAD_CATEGORIES } from "@/app/schema/ProductSchema";

export type CategoryOption = { value: string; label: string; slug: string; key: string };
export type BrandOption = { value: string; label: string };

export function categorySlug(value: string) {
    const slug = value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().trim().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return /^[a-f\d]{24}$/i.test(slug) ? `category-${slug}` : slug;
}

export function canonicalHeadCategory(value?: string | null): string | undefined {
    if (!value) return undefined;
    const trimmed = value.trim();
    if (trimmed.toLocaleLowerCase() === "pants") return "Bottomwear";
    return HEAD_CATEGORIES.find((category) => category.toLocaleLowerCase() === trimmed.toLocaleLowerCase());
}

export function matchHeadCategory(slug?: string): string | undefined {
    if (!slug) return undefined;
    const raw = slug.trim().toLocaleLowerCase();
    let decoded = raw;
    try {
        decoded = decodeURIComponent(raw);
    } catch {
        // use raw if URI decoding fails
    }
    const normalizedRaw = categorySlug(raw);
    const normalizedDecoded = categorySlug(decoded);

    return HEAD_CATEGORIES.find((cat) => {
        const catLower = cat.toLocaleLowerCase();
        const catSlug = categorySlug(cat);
        return (
            catLower === raw ||
            catLower === decoded ||
            catSlug === normalizedRaw ||
            catSlug === normalizedDecoded
        );
    });
}

export function displayCategory(value: string) {
    return value.trim().toLocaleLowerCase().replace(/(^|[\s-])([\p{L}\p{N}])/gu, (_match, prefix: string, character: string) => `${prefix}${character.toLocaleUpperCase()}`);
}

export function getBrandName(brand: ProductListItem["brand"]) {
    if (brand && typeof brand === "object" && typeof brand.name === "string" && brand.name.trim()) return brand.name.trim();
    if (typeof brand === "string" && brand.trim() && !/^[a-f\d]{24}$/i.test(brand.trim())) return brand.trim();
    return "No Brand";
}

export function getBrandKey(brand: ProductListItem["brand"]) {
    if (brand && typeof brand === "object") return brand._id || (brand.name ? `name:${brand.name.trim().toLocaleLowerCase()}` : "__no_brand__");
    if (typeof brand === "string" && brand.trim() && !/^[a-f\d]{24}$/i.test(brand.trim())) return `name:${brand.trim().toLocaleLowerCase()}`;
    return "__no_brand__";
}

export function uniqueOptions(values: string[]) {
    const grouped = new Map<string, string>();
    values.forEach((value) => {
        const trimmed = value?.trim();
        if (trimmed && !grouped.has(trimmed.toLocaleLowerCase())) grouped.set(trimmed.toLocaleLowerCase(), trimmed);
    });
    return [...grouped.values()].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

export function buildCategoryOptions(products: ProductListItem[]): CategoryOption[] {
    const categories = uniqueOptions(products.map((product) => product.category));
    const usedSlugs = new Set<string>();
    return categories.map((value) => {
        const base = categorySlug(value);
        let slug = base || "category";
        let suffix = 2;
        while (usedSlugs.has(slug)) slug = `${base || "category"}-${suffix++}`;
        usedSlugs.add(slug);
        return { value, label: displayCategory(value), slug, key: value.toLocaleLowerCase() };
    });
}

export function normalizeValues(values: string[]) {
    return values.map((value) => value.trim().toLocaleLowerCase());
}
