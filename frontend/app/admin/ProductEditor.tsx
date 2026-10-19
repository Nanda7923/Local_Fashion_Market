"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CloudUpload, Close } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import { HEAD_CATEGORIES } from "@/app/schema/ProductSchema";
import type {
  Brand,
  PopulatedProductBrand,
  ProductCreateRequest,
} from "@/lib/features/product/types";

const inputClass =
  "w-full rounded-lg border border-[#e5e0d8] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#41584b]";
const maxImages = 10;
const supportedSizes = ["S", "M", "L", "XL", "2XL"];
const palette = [
  { name: "Black", hex: "#171717" },
  { name: "White", hex: "#fafaf9" },
  { name: "Red", hex: "#dc2626" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Green", hex: "#15803d" },
  { name: "Orange", hex: "#ea580c" },
  { name: "Purple", hex: "#9333ea" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Gray", hex: "#9ca3af" },
  { name: "DarkBlue", hex: "#1e3a8a" },
  { name: "Beige", hex: "#d6c4a1" },
  { name: "Brown", hex: "#854d0e" },
  { name: "Yellow", hex: "#eab308" },
  { name: "Navy", hex: "#172554" },
];

export type ProductDraft = ProductCreateRequest;
export type ProductEditorProduct = Omit<ProductDraft, "brand"> & {
  _id: string;
  brand: PopulatedProductBrand;
};
type ImageItem = { key: string; url: string; file?: File };
type Props = {
  product: ProductEditorProduct | null;
  brands: Pick<Brand, "_id" | "name">[];
  existingCategories: string[];
  busy: boolean;
  uploading: boolean;
  onCancel: () => void;
  onUpload: (files: File[]) => Promise<string[]>;
  onSave: (draft: ProductDraft) => Promise<void>;
};

export default function ProductEditor({
  product,
  brands,
  existingCategories,
  busy,
  uploading,
  onCancel,
  onUpload,
  onSave,
}: Props) {
  const [title, setTitle] = useState(product?.title ?? "");
  const [brand, setBrand] = useState(
    typeof product?.brand === "string"
      ? product.brand
      : (product?.brand?._id ?? ""),
  );
  const [category, setCategory] = useState(product?.category ?? "");
  const [categoryOptionsOpen, setCategoryOptionsOpen] = useState(false);
  const [headCategory, setHeadCategory] = useState(
    product?.headCategory ?? "Topwear",
  );
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [sizes, setSizes] = useState<string[]>(product?.size ?? ["M"]);
  const [sizesOpen, setSizesOpen] = useState(false);
  const [inStock, setInStock] = useState(product?.inStock ?? true);
  const [images, setImages] = useState<ImageItem[]>(() =>
    (product?.imageUrl ?? []).map((url, i) => ({
      key: `saved-${i}-${url}`,
      url,
    })),
  );
  const initialColors = product?.color ?? ["Black"];
  const [colors, setColors] = useState(initialColors);
  const [customColors, setCustomColors] = useState(
    initialColors.filter(
      (name) =>
        !palette.some((item) => item.name.toLowerCase() === name.toLowerCase()),
    ),
  );
  const [swatches, setSwatches] = useState<Record<string, string>>({});
  const [customName, setCustomName] = useState("");
  const [customHex, setCustomHex] = useState("#a78bfa");
  const [photoError, setPhotoError] = useState("");
  const [colorError, setColorError] = useState("");
  const [customError, setCustomError] = useState("");
  const [formError, setFormError] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const previewUrls = useRef(new Set<string>());
  useEffect(
    () => () => {
      previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );
  const availableColors = [
    ...palette,
    ...customColors.map((name) => ({ name, hex: swatches[name] ?? "#a8a29e" })),
  ];
  const matchingCategories = existingCategories.filter(
    (item) =>
      !category.trim() ||
      item.toLocaleLowerCase().includes(category.trim().toLocaleLowerCase()),
  );
  const visibleCategories = matchingCategories.length
    ? matchingCategories
    : existingCategories;

  const addFiles = (list: FileList | File[]) => {
    const files = Array.from(list);
    if (!files.length) return;
    if (files.some((file) => !file.type.startsWith("image/"))) {
      setPhotoError("Please choose image files only.");
      return;
    }
    if (images.length + files.length > maxImages) {
      setPhotoError(
        `You can add up to ${maxImages} photos. Remove a photo before adding more.`,
      );
      return;
    }
    setPhotoError("");
    const additions = files.map((file) => {
      const url = URL.createObjectURL(file);
      previewUrls.current.add(url);
      return {
        key: `${file.name}-${file.size}-${crypto.randomUUID()}`,
        url,
        file,
      };
    });
    setImages((current) => [...current, ...additions]);
  };
  const removeImage = (item: ImageItem) => {
    if (item.file) {
      URL.revokeObjectURL(item.url);
      previewUrls.current.delete(item.url);
    }
    setImages((current) => current.filter((image) => image.key !== item.key));
    setPhotoError("");
  };
  const toggleColor = (name: string) => {
    setColors((current) =>
      current.some((item) => item.toLowerCase() === name.toLowerCase())
        ? current.filter((item) => item.toLowerCase() !== name.toLowerCase())
        : [...current, name],
    );
    setColorError("");
  };
  const toggleSize = (value: string) =>
    setSizes((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  const addCustomColor = () => {
    const name = customName.trim();
    if (!name) {
      setCustomError("Enter a name for this color.");
      return;
    }
    if (
      [...palette.map((item) => item.name), ...customColors].some(
        (item) => item.toLowerCase() === name.toLowerCase(),
      )
    ) {
      setCustomError("That color name already exists.");
      return;
    }
    setCustomColors((current) => [...current, name]);
    setSwatches((current) => ({ ...current, [name]: customHex }));
    setColors((current) => [...current, name]);
    setCustomName("");
    setCustomError("");
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");
    const uniqueColors = [
      ...new Map(colors.map((name) => [name.toLowerCase(), name])).values(),
    ];
    const normalizedCategory = category.trim();
    const canonicalCategory =
      existingCategories.find(
        (item) =>
          item.toLocaleLowerCase() === normalizedCategory.toLocaleLowerCase(),
      ) ?? normalizedCategory;
    const draft: ProductDraft = {
      title: title.trim(),
      brand,
      category: canonicalCategory,
      headCategory,
      price: Number(price),
      size: supportedSizes.filter((value) => sizes.includes(value)),
      inStock,
      color: uniqueColors,
      imageUrl: [],
    };
    if (
      !draft.title ||
      !draft.brand ||
      !draft.category ||
      !Number.isFinite(draft.price) ||
      draft.price <= 0 ||
      !draft.size.length
    ) {
      setFormError("Complete the product details and enter a valid price.");
      return;
    }
    if (!uniqueColors.length) {
      setColorError("Choose at least one color.");
      return;
    }
    if (!images.length) {
      setPhotoError("Add at least one product photo.");
      return;
    }
    try {
      const files = images.flatMap((image) => (image.file ? [image.file] : []));
      let resolved = images;
      if (files.length) {
        const urls = await onUpload(files);
        if (urls.length !== files.length)
          throw new Error("The upload did not return a URL for every photo.");
        let index = 0;
        resolved = images.map((image) =>
          image.file
            ? { ...image, file: undefined, url: urls[index++] }
            : image,
        );
        images.forEach((image) => {
          if (image.file) {
            URL.revokeObjectURL(image.url);
            previewUrls.current.delete(image.url);
          }
        });
        setImages(resolved);
      }
      await onSave({ ...draft, imageUrl: resolved.map((image) => image.url) });
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not save product.",
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy && !uploading)
          onCancel();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-[#fffefa] p-6 shadow-xl sm:p-8"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2
            id="product-form-title"
            className="font-[family-name:var(--font-cormorant)] text-3xl"
          >
            {product ? "Edit product" : "Create product"}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy || uploading}
            aria-label="Close dialog"
            className="rounded-md px-3 py-1 text-xl text-stone-500 hover:bg-stone-100 disabled:opacity-40"
          >
            ×
          </button>
        </div>
        <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
          <label className="text-xs text-stone-500">
            Product name
            <input
              required
              className={inputClass}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <label className="text-xs text-stone-500">
            Brand
            <select
              required
              className={inputClass}
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
            >
              <option value="">Choose brand</option>
              {brands.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <div className="relative">
            <label
              htmlFor="product-category"
              className="mb-1 block text-xs text-stone-500"
            >
              Category
            </label>
            <div className="flex">
              <input
                id="product-category"
                required
                autoComplete="off"
                className={`${inputClass} rounded-r-none`}
                value={category}
                onFocus={() => setCategoryOptionsOpen(true)}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setCategoryOptionsOpen(true);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setCategoryOptionsOpen(false);
                }}
              />
              <button
                type="button"
                aria-label="Show existing categories"
                aria-expanded={categoryOptionsOpen}
                onClick={() => setCategoryOptionsOpen((open) => !open)}
                className="rounded-r-lg border border-l-0 border-[#e5e0d8] bg-white px-3 text-stone-600 hover:bg-stone-50"
              >
                ▾
              </button>
            </div>
            {categoryOptionsOpen && visibleCategories.length > 0 && (
              <div className="absolute z-30 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-[#e5e0d8] bg-white py-1 shadow-lg">
                {visibleCategories.map((item) => (
                  <button
                    key={item.toLocaleLowerCase()}
                    type="button"
                    onClick={() => {
                      setCategory(item);
                      setCategoryOptionsOpen(false);
                    }}
                    className="block w-full px-3 py-2 text-left text-sm text-stone-700 hover:bg-[#f1f0eb]"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
          <label className="text-xs text-stone-500">
            Head category
            <select
              required
              className={inputClass}
              value={headCategory}
              onChange={(event) => setHeadCategory(event.target.value)}
            >
              {[
                ...HEAD_CATEGORIES,
                ...(product?.headCategory &&
                !HEAD_CATEGORIES.includes(
                  product.headCategory as (typeof HEAD_CATEGORIES)[number],
                )
                  ? [product.headCategory]
                  : []),
              ].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-stone-500">
            Price (MMK)
            <input
              required
              type="number"
              min="1"
              step="1"
              className={inputClass}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </label>
          <fieldset className="relative">
            <legend className="mb-1 text-xs text-stone-500">
              Available Sizes
            </legend>
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={sizesOpen}
              onClick={() => setSizesOpen((open) => !open)}
              className={`${inputClass} flex items-center justify-between text-left`}
            >
              <span
                className={sizes.length ? "text-stone-800" : "text-stone-400"}
              >
                {sizes.length ? sizes.join(", ") : "Choose sizes"}
              </span>
              <span aria-hidden="true" className="text-stone-500">
                {sizesOpen ? "▲" : "▼"}
              </span>
            </button>
            {sizesOpen && (
              <div
                role="group"
                aria-label="Available sizes"
                className="absolute z-20 mt-1 w-full rounded-lg border border-[#e5e0d8] bg-white p-2 shadow-lg"
              >
                {supportedSizes.map((value) => (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-stone-50"
                  >
                    <input
                      type="checkbox"
                      checked={sizes.includes(value)}
                      onChange={() => toggleSize(value)}
                    />
                    {value}
                  </label>
                ))}
              </div>
            )}
            {!sizes.length && (
              <p className="mt-1 text-xs text-rose-700">
                Choose at least one size.
              </p>
            )}
          </fieldset>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(event) => setInStock(event.target.checked)}
            />{" "}
            In stock
          </label>
          <fieldset className="sm:col-span-2">
            <legend className="mb-2 text-xs text-stone-500">
              Product colors
            </legend>
            <div className="flex flex-wrap gap-3">
              {availableColors.map(({ name, hex }) => {
                const selected = colors.some(
                  (item) => item.toLowerCase() === name.toLowerCase(),
                );
                return (
                  <button
                    type="button"
                    key={name}
                    aria-pressed={selected}
                    onClick={() => toggleColor(name)}
                    className={`flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs transition ${selected ? "border-[#293a32] bg-[#edf2ee] ring-1 ring-[#293a32]" : "border-stone-200 hover:border-stone-400"}`}
                  >
                    <span
                      className="h-5 w-5 rounded-full border border-black/15"
                      style={{ backgroundColor: hex }}
                    />
                    {name}
                    {selected && (
                      <span
                        aria-hidden="true"
                        className="font-bold text-[#293a32]"
                      >
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {colorError && (
              <p className="mt-2 text-xs text-rose-700" role="alert">
                {colorError}
              </p>
            )}
          </fieldset>
          <div className="rounded-xl border border-stone-200 bg-white p-4 sm:col-span-2">
            <p className="mb-3 text-sm font-medium">Add Custom Color</p>
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-xs text-stone-500">
                Color
                <input
                  type="color"
                  aria-label="Choose custom color"
                  value={customHex}
                  onChange={(event) => setCustomHex(event.target.value)}
                  className="mt-1 block h-10 w-14 cursor-pointer rounded border border-stone-200 bg-white p-1"
                />
              </label>
              <label className="min-w-44 flex-1 text-xs text-stone-500">
                Color name
                <input
                  className={inputClass}
                  placeholder="e.g. Lavender or Olive Green"
                  value={customName}
                  onChange={(event) => {
                    setCustomName(event.target.value);
                    setCustomError("");
                  }}
                />
              </label>
              <button
                type="button"
                onClick={addCustomColor}
                className="rounded-lg border border-[#293a32] px-4 py-2.5 text-sm text-[#293a32] hover:bg-[#f1f5f2]"
              >
                Add custom color
              </button>
            </div>
            {customError && (
              <p className="mt-2 text-xs text-rose-700" role="alert">
                {customError}
              </p>
            )}
          </div>
          <section className="sm:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Product photos</h3>
                <p className="mt-1 text-xs text-stone-500">
                  {images.length} photo{images.length === 1 ? "" : "s"} selected
                  · maximum {maxImages}
                </p>
              </div>
            </div>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(event) => {
                if (event.target.files) addFiles(event.target.files);
                event.target.value = "";
              }}
            />
            <button
              type="button"
              disabled={busy || uploading || images.length >= maxImages}
              onClick={() => fileInput.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                addFiles(event.dataTransfer.files);
              }}
              className={`flex min-h-36 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-5 text-center transition ${dragging ? "border-[#41584b] bg-[#edf2ee]" : "border-stone-300 bg-white hover:border-stone-400"}`}
            >
              <CloudUpload className="mb-2 text-[#41584b]" fontSize="large" />
              <span className="text-sm font-medium">Upload Product Photos</span>
              <span className="mt-1 text-xs text-stone-500">
                Click to browse or drag and drop images
              </span>
              <span className="mt-2 text-[11px] text-stone-400">
                Up to {maxImages} photos
              </span>
            </button>
            {photoError && (
              <p className="mt-2 text-xs text-rose-700" role="alert">
                {photoError}
              </p>
            )}
            {!!images.length && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {images.map((image, index) => (
                  <div
                    key={image.key}
                    className="group relative aspect-[4/5] overflow-hidden rounded-lg border border-stone-200 bg-stone-50"
                  >
                    <img
                      src={image.url}
                      alt={`Product photo ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      disabled={busy || uploading}
                      onClick={() => removeImage(image)}
                      aria-label={`Remove photo ${index + 1}`}
                      className="absolute right-2 top-2 rounded-full bg-white/95 p-1.5 text-stone-700 shadow hover:text-rose-700"
                    >
                      <Close fontSize="small" />
                    </button>
                    {image.file && (
                      <span className="absolute bottom-2 left-2 rounded bg-black/65 px-2 py-1 text-[10px] text-white">
                        New photo
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
          {(formError || uploading) && (
            <div className="sm:col-span-2" aria-live="polite">
              {formError && (
                <p className="text-sm text-rose-700" role="alert">
                  {formError}
                </p>
              )}
              {uploading && (
                <p className="flex items-center gap-2 text-sm text-stone-600">
                  <CircularProgress size={16} /> Uploading photos…
                </p>
              )}
            </div>
          )}
          <div className="flex justify-end gap-3 sm:col-span-2">
            <button
              type="button"
              disabled={busy || uploading}
              onClick={onCancel}
              className="rounded-lg border px-4 py-2 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              disabled={busy || uploading}
              className="rounded-lg bg-[#293a32] px-5 py-2 text-white disabled:opacity-60"
            >
              {uploading
                ? "Uploading photos…"
                : busy
                  ? "Saving…"
                  : "Save product"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
