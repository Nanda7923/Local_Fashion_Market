"use client";

import { useState, type FormEvent } from "react";
import {
  useCreateBrandMutation,
  useDeleteBrandMutation,
  useGetBrandsQuery,
  useUpdateBrandMutation,
  useUploadBrandLogoMutation,
} from "@/lib/features/product/brandApiSlice";
import type { Brand } from "@/lib/features/product/types";
import {
  Empty,
  ErrorState,
  Loading,
  Modal,
} from "@/app/admin/components/AdminPrimitives";

const inputClass =
  "w-full rounded-lg border border-[#e5e0d8] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#41584b]";

interface AdminBrandsProps {
  search: string;
  showError: (message: string) => void;
  showNotice: (message: string) => void;
  apiMessage: (error: unknown, fallback: string) => string;
}

export default function AdminBrands({
  search,
  showError,
  showNotice,
  apiMessage,
}: AdminBrandsProps) {
  const q = useGetBrandsQuery(undefined);
  const [createBrand, createState] = useCreateBrandMutation();
  const [updateBrand, updateState] = useUpdateBrandMutation();
  const [deleteBrand] = useDeleteBrandMutation();
  const [uploadLogo, uploadState] = useUploadBrandLogoMutation();
  const [selected, setSelected] = useState<Brand | null | false>(false);
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");
  const [saving, setSaving] = useState(false);
  const rows = (q.data ?? []).filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()),
  );

  const open = (brand?: Brand) => {
    setSelected(brand ?? null);
    s;
    etName(brand?.name ?? "");
    setLogo(brand?.logo ?? "");
  };

  const file = async (f?: File) => {
    if (!f) return;
    const fd = new FormData();
    fd.append("logo", f);
    try {
      const r = await uploadLogo(fd).unwrap();
      setLogo(r.urls[0] ?? "");
    } catch (e) {
      showError(apiMessage(e, "Logo upload failed."));
    }
  };
  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!name.trim() || !logo)
        throw new Error("Brand name and logo are required.");
      if (selected) {
        await updateBrand({
          id: selected._id,
          name: name.trim(),
          logo,
        }).unwrap();
      } else {
        await createBrand({ name: name.trim(), logo }).unwrap();
        setSelected(false);
      }
      showNotice(selected ? "Brand updated." : "Brand created.");
    } catch (e) {
      showError(apiMessage(e, "Could not save brand."));
    } finally {
      setSaving(false);
    }
  };
  if (q.isLoading) {
    return <Loading />;
    if (q.error) {
      return (
        <ErrorState message="Could not load brands." onRetry={q.refetch} />
      );
    }
  }

  const deleteBtnHandler = async (b) => {
    if (!window.confirm(`Delete brand “${b.name}”?`)) return;
    try {
      await deleteBrand(b._id).unwrap();
      showNotice("Brand deleted.");
    } catch (e) {
      showError(apiMessage(e, "Could not delete brand."));
    }
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-stone-500">{rows.length} brands</p>
        <button
          onClick={() => open()}
          className="rounded-lg bg-[#293a32] px-4 py-2.5 text-sm text-white"
        >
          + Add brand
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((b) => (
          <article
            key={b._id}
            className="flex items-center gap-4 rounded-2xl border border-[#e9e5de] bg-white p-5"
          >
            <img
              src={b.logo}
              alt={`${b.name} logo`}
              className="h-16 w-16 rounded-xl border border-stone-100 object-contain p-1"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{b.name}</p>
              <p className="mt-1 truncate text-xs text-stone-400">{b._id}</p>
              <div className="mt-3 flex gap-4 text-sm">
                <button onClick={() => open(b)} className="text-[#40584a]">
                  Edit
                </button>
                <button
                  onClick={() => deleteBtnHandler(b)}
                  className="text-rose-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!rows.length && <Empty>No brands found.</Empty>}
      {selected !== false && (
        <Modal
          title={selected ? "Edit brand" : "Create brand"}
          close={() => setSelected(false)}
        >
          <form onSubmit={save} className="space-y-4">
            <label className="block text-xs text-stone-500">
              Brand name
              <input
                required
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="block text-xs text-stone-500">
              Logo URL
              <input
                required
                className={inputClass}
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
              />
            </label>
            {logo && (
              <img
                src={logo}
                alt="Brand logo preview"
                className="h-20 w-20 rounded-xl border object-contain p-2"
              />
            )}
            <label className="block text-xs text-stone-500">
              Upload logo
              <input
                type="file"
                accept="image/*"
                onChange={(e) => void file(e.target.files?.[0])}
                className="mt-2 block w-full"
              />
            </label>
            <div className="flex justify-end">
              <button
                disabled={
                  saving ||
                  createState.isLoading ||
                  updateState.isLoading ||
                  uploadState.isLoading
                }
                className="rounded-lg bg-[#293a32] px-5 py-2.5 text-white"
              >
                {saving || uploadState.isLoading ? "Saving…" : "Save brand"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
