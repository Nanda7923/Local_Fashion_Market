"use client";

import { useMemo, useState } from "react";
import ProductEditor, { type ProductDraft } from "@/app/admin/ProductEditor";
import { Empty, ErrorState, Loading, Modal, Pager } from "@/app/admin/components/AdminPrimitives";
import { HEAD_CATEGORIES } from "@/app/schema/ProductSchema";
import { useDeleteProductMutation, useGetProductsQuery, useAddProductMutation, useUpdateProductMutation, useUploadImagesMutation } from "@/lib/features/product/productApiSlice";
import { useGetBrandsQuery } from "@/lib/features/product/brandApiSlice";
import type { PopulatedProductBrand, Product } from "@/lib/features/product/types";

type ProductRow = Omit<Product, "_id" | "brand"> & { _id: string; brand: PopulatedProductBrand };

interface AdminProductsProps {
    search: string;
    page: number;
    setPage: (page: number) => void;
    showError: (message: string) => void;
    showNotice: (message: string) => void;
    apiMessage: (error: unknown, fallback: string) => string;
}

export default function AdminProducts({ search, page, setPage, showError, showNotice, apiMessage }: AdminProductsProps) {
    const query = useGetProductsQuery(undefined);
    const brandsQuery = useGetBrandsQuery(undefined);
    const [removeProduct, removeState] = useDeleteProductMutation();
    const [addProduct, addState] = useAddProductMutation();
    const [updateProduct, updateState] = useUpdateProductMutation();
    const [uploadImages, uploadState] = useUploadImagesMutation();
    const [editing, setEditing] = useState<ProductRow | null>(null);
    const [creating, setCreating] = useState(false);
    const [headCategoryFilter, setHeadCategoryFilter] = useState("All head categories");
    const [stockFilter, setStockFilter] = useState("All stock");
    const [viewing, setViewing] = useState<ProductRow | null>(null);
    const allProducts = (query.data ?? []) as ProductRow[];
    const headCategories = [...new Set([...HEAD_CATEGORIES, ...allProducts.map((p) => p.headCategory).filter(Boolean)])];

    const existingCategories = [...new Map(allProducts.map((p) => p.category?.trim()).filter((category): category is string => Boolean(category)).map((category) => [category.toLocaleLowerCase(), category])).values()];

    const getBrandName = (brand: ProductRow["brand"]) => typeof brand === "string" ? brandsQuery.data?.find((item) => item._id === brand)?.name?.trim() || "No Brand" : brand?.name?.trim() || "No Brand";
    const rows = useMemo(() => {
        return allProducts.filter((p) => `${p.title} ${p.category} ${getBrandName(p.brand)}`
                                        .toLowerCase()
                                        .includes(search.toLowerCase()) && (headCategoryFilter === "All head categories" || p.headCategory === headCategoryFilter)
                                        &&
                                        (stockFilter === "All stock" || (stockFilter === "In stock" ? p.inStock : !p.inStock)))
    }, [query.data, brandsQuery.data, search, headCategoryFilter, stockFilter]);

    const pageSize = 8;
    const pageCount = Math.max(1, Math.ceil(rows.length / pageSize)); const shown = rows.slice((page - 1) * pageSize, page * pageSize);

    const begin = (item?: ProductRow) => { setEditing(item ?? null); setCreating(!item); };
    const closeEditor = () => {
        setEditing(null);
        setCreating(false);
    };

    const onSaveHandler = async (draft: ProductDraft) => {
        try {
            await save(draft);
        } catch (err) {
            const message = apiMessage(err, "Could not save product.");
            showError(message); throw new Error(message);
        }
    }

    const save = async (draft: ProductDraft) => {
        const isEditing = Boolean(editing);
        if (editing) {
            await updateProduct({...draft, _id: editing._id}).unwrap();
        } else {
            await addProduct(draft).unwrap();
        }
        closeEditor();
        showNotice(isEditing ? "Product updated." : "Product created.");
    };
    const upload = async (files: File[]) => {
        const fd = new FormData(); files.forEach((file) => fd.append("productImages", file));
        try {
            const result = await uploadImages(fd).unwrap();
            return result.urls ?? [];
        } catch (err) {
            const message = apiMessage(err, "Image upload failed.");
            showError(message);
            throw new Error(message); }
    };
    if (query.isLoading || brandsQuery.isLoading) return <Loading />;
    if (query.error || brandsQuery.error) return <ErrorState message="Could not load products or brands." onRetry={() => { query.refetch(); brandsQuery.refetch(); }} />;
    return (
        <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-stone-500">{rows.length} products</p>
                <div className="flex flex-wrap gap-2">
                    <select aria-label="Filter by head category" value={headCategoryFilter} onChange={(e) => { setHeadCategoryFilter(e.target.value); setPage(1); }}
                            className="rounded-lg border border-[#e5e0d8] bg-white px-3 py-2 text-sm">
                        <option>All head categories</option>
                        {
                            headCategories.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <select aria-label="Filter by stock" value={stockFilter} onChange={(e) => { setStockFilter(e.target.value); setPage(1); }} className="rounded-lg border border-[#e5e0d8] bg-white px-3 py-2 text-sm">
                        <option>All stock</option>
                        <option>In stock</option>
                        <option>Out of stock</option>
                    </select>
                    <button onClick={() => begin()} className="rounded-lg bg-[#293a32] px-4 py-2.5 text-sm text-white">+ Add product</button>
                </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[#e9e5de] bg-white">
                <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-[#f1f0eb] text-xs uppercase tracking-wider text-stone-500">
                    <tr>
                        <th className="px-5 py-4">Product</th>
                        <th className="px-5 py-4">Brand</th>
                        <th className="px-5 py-4">Category</th>
                        <th className="px-5 py-4">Head category</th>
                        <th className="px-5 py-4">Price</th>
                        <th className="px-5 py-4">Availability</th>
                        <th className="px-5 py-4">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        shown.map((p) => <tr key={p._id} className="border-t border-stone-100">
                            <td className="px-5 py-3">
                                <div className="flex items-center gap-3">
                                    {
                                        p.imageUrl?.[0] && <img src={p.imageUrl[0]} alt="" className="h-12 w-10 rounded object-cover" />
                                    }
                                    <div>
                                        <p className="font-medium">{p.title}</p>
                                        <p className="text-xs text-stone-400">{p._id}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-5 py-3">{getBrandName(p.brand)}</td>
                            <td className="px-5 py-3 capitalize">{p.category}</td>
                            <td className="px-5 py-3">{p.headCategory || "—"}</td>
                            <td className="px-5 py-3">{Number(p.price).toLocaleString()} MMK</td>
                            <td className="px-5 py-3">
                                <span className={`rounded-full px-2.5 py-1 text-xs ${p.inStock ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>
                                    {p.inStock ? "In stock" : "Out of stock"}
                                </span>
                            </td>
                            <td className="px-5 py-3"><div className="flex gap-3">
                                <button onClick={() => setViewing(p)} className="text-stone-600">View</button>
                                <button onClick={() => begin(p)} className="text-[#40584a]">Edit</button>
                                <button disabled={removeState.isLoading} onClick={async () => { if (!window.confirm(`Delete “${p.title}”?`)) return; try { await removeProduct(p._id).unwrap(); showNotice("Product deleted."); } catch (err) { showError(apiMessage(err, "Could not delete product.")); } }} className="text-rose-700">Delete</button>
                            </div>
                            </td>
                        </tr>
                        )
                    }
                    </tbody>
                </table>
                </div>
                {
                    !shown.length && <Empty>No products found.</Empty>
                }
                <Pager page={page} pageCount={pageCount} setPage={setPage} />
            </div>
    {
        viewing && <Modal title={viewing.title} close={() => setViewing(null)}>
            <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
                {
                    viewing.imageUrl?.[0] && <img src={viewing.imageUrl[0]} alt={viewing.title} className="aspect-[3/4] w-full rounded-xl object-cover" />
                }
                <dl className="grid grid-cols-[105px_1fr] content-start gap-y-3 text-sm">
                    <dt className="text-stone-500">Brand</dt>
                    <dd>{getBrandName(viewing.brand)}</dd>
                    <dt className="text-stone-500">Category</dt>
                    <dd className="capitalize">{viewing.category} / {viewing.headCategory}</dd>
                    <dt className="text-stone-500">Price</dt>
                    <dd>{viewing.price.toLocaleString()} MMK</dd>
                    <dt className="text-stone-500">Sizes</dt>
                    <dd>{viewing.size.join(", ")}</dd>
                    <dt className="text-stone-500">Colors</dt>
                    <dd>{viewing.color.join(", ")}</dd>
                    <dt className="text-stone-500">Inventory</dt>
                    <dd>{viewing.inStock ? "In stock" : "Out of stock"}</dd>
                    <dt className="text-stone-500">Product</dt>
                    <dd className="break-all text-xs">{viewing._id}</dd>
                </dl>
        </div>
    </Modal>
    }
    {
        (editing || creating) && <ProductEditor key={editing?._id ?? "new-product"}
                                                product={editing}
                                                brands={brandsQuery.data ?? []}
                                                existingCategories={existingCategories}
                                                busy={addState.isLoading || updateState.isLoading}
                                                uploading={uploadState.isLoading}
                                                onCancel={closeEditor}
                                                onUpload={upload}
                                                onSave={onSaveHandler}
        />
    }
    </>
    );
}
