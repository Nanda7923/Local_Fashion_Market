import Link from "next/link";
import type { ReactNode } from "react";
import { displayCategory, type BrandOption, type CategoryOption } from "@/app/products/utils/productList";

interface ProductFiltersProps {
    categories: CategoryOption[];
    selectedCategory?: CategoryOption;
    categoryHref: (category: CategoryOption) => string;
    minPrice: string;
    maxPrice: string;
    maxAvailablePrice: number;
    onMinPriceChange: (value: string) => void;
    onMaxPriceChange: (value: string) => void;
    brandOptions: BrandOption[];
    selectedBrands: string[];
    onToggleBrand: (value: string) => void;
    sizes: string[];
    selectedSizes: string[];
    onToggleSize: (value: string) => void;
    colors: string[];
    selectedColors: string[];
    onToggleColor: (value: string) => void;
    inStockOnly: boolean;
    onInStockChange: (checked: boolean) => void;
    onClearFilters: () => void;
}

export default function ProductFilters({
    categories,
    selectedCategory,
    categoryHref,
    minPrice,
    maxPrice,
    maxAvailablePrice,
    onMinPriceChange,
    onMaxPriceChange,
    brandOptions,
    selectedBrands,
    onToggleBrand,
    sizes,
    selectedSizes,
    onToggleSize,
    colors,
    selectedColors,
    onToggleColor,
    inStockOnly,
    onInStockChange,
    onClearFilters,
}: ProductFiltersProps) {
    return <div className="space-y-7">
        <div className="flex items-center justify-between"><h2 className="text-xs font-semibold uppercase tracking-[0.18em]">Filters</h2><button type="button" onClick={onClearFilters} className="text-xs text-stone-500 underline underline-offset-4 hover:text-black">Clear all</button></div>
        <FilterGroup title="Category"><div className="max-h-48 space-y-2 overflow-y-auto">{categories.map((category) => <Link key={category.slug} href={categoryHref(category)} className={`block text-sm ${selectedCategory?.slug === category.slug ? "font-medium text-black" : "text-stone-600 hover:text-black"}`}>{category.label}</Link>)}</div></FilterGroup>
        <FilterGroup title="Price range"><div className="grid grid-cols-2 gap-2"><label className="text-[11px] text-stone-500">Min<input aria-label="Minimum price" type="number" min="0" placeholder="0" value={minPrice} onChange={(event) => onMinPriceChange(event.target.value)} className="mt-1 w-full rounded border border-stone-200 px-2 py-2 text-sm text-stone-800" /></label><label className="text-[11px] text-stone-500">Max<input aria-label={`Maximum price, up to ${maxAvailablePrice}`} type="number" min="0" placeholder={String(maxAvailablePrice)} value={maxPrice} onChange={(event) => onMaxPriceChange(event.target.value)} className="mt-1 w-full rounded border border-stone-200 px-2 py-2 text-sm text-stone-800" /></label></div></FilterGroup>
        <FilterGroup title="Brand">{brandOptions.length ? <CheckOptions options={brandOptions} selected={selectedBrands} onToggle={onToggleBrand} /> : <p className="text-xs text-stone-400">No brands available.</p>}</FilterGroup>
        <FilterGroup title="Size">{sizes.length ? <CheckOptions options={sizes.map((value) => ({ value, label: value }))} selected={selectedSizes} onToggle={onToggleSize} /> : <p className="text-xs text-stone-400">No sizes available.</p>}</FilterGroup>
        <FilterGroup title="Color">{colors.length ? <CheckOptions options={colors.map((value) => ({ value, label: displayCategory(value) }))} selected={selectedColors} onToggle={onToggleColor} /> : <p className="text-xs text-stone-400">No colors available.</p>}</FilterGroup>
        <label className="flex items-center gap-3 text-sm text-stone-700"><input type="checkbox" checked={inStockOnly} onChange={(event) => onInStockChange(event.target.checked)} className="h-4 w-4 accent-[#293a32]" /> In stock only</label>
    </div>;
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
    return <fieldset className="border-t border-stone-200 pt-4"><legend className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-600">{title}</legend>{children}</fieldset>;
}

function CheckOptions({ options, selected, onToggle }: { options: { value: string; label: string }[]; selected: string[]; onToggle: (value: string) => void }) {
    return <div className="max-h-44 space-y-2 overflow-y-auto">{options.map((option) => <label key={option.value} className="flex cursor-pointer items-center gap-3 text-sm text-stone-600 hover:text-black"><input type="checkbox" checked={selected.includes(option.value)} onChange={() => onToggle(option.value)} className="h-4 w-4 accent-[#293a32]" />{option.label}</label>)}</div>;
}
