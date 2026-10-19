"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Close, Collections } from "@mui/icons-material";
import { HEAD_CATEGORIES, ProductData, ProductFormData, ProductSchema } from "@/app/schema/ProductSchema";
import { useRouter } from "next/navigation";
import { useAddProductMutation, useUploadImagesMutation } from "@/lib/features/product/productApiSlice";
import {
    useCreateBrandMutation,
    useGetBrandsQuery,
    useUploadBrandLogoMutation,
} from "@/lib/features/product/brandApiSlice";

const colors = [
    { name: "Black", value: "#171717" },
    { name: "White", value: "#f5f3ef" },
    { name: "Red", value: "#9f3333" },
    { name: "Blue", value: "#345779" },
    { name: "Green", value: "#52634e" },
    { name: "Orange", value: "#b36d37" },
    { name: "Purple", value: "#6d5b7b" },
    { name: "Pink", value: "#bd8290" },
    { name: "Gray", value: "#85817d" },
    { name: "DarkBlue", value: "#222e45" },
];

const sizes = ["S", "M", "L", "XL", "2XL"];
const labelStyle = { fontFamily: "var(--font-smooch), sans-serif" };

interface ProductImagePreview {
    id: string;
    preview: string;
    url: string;
}

function getApiErrorMessage(error: unknown, fallback: string) {
    if (typeof error === "object" && error !== null && "data" in error) {
        const responseData = error.data;
        if (
            typeof responseData === "object" &&
            responseData !== null &&
            "message" in responseData &&
            typeof responseData.message === "string"
        ) {
            return responseData.message;
        }
    }
    return error instanceof Error ? error.message : fallback;
}

export default function UploadedProduct({ initiallyOpen = false }: { initiallyOpen?: boolean }) {
    const [showForm, setShowForm] = useState(initiallyOpen);
    const [imagesUploaded, setImagesUploaded] = useState(false);
    const [imageItems, setImageItems] = useState<ProductImagePreview[]>([]);
    const [uploadError, setUploadError] = useState("");
    const [creationMessage, setCreationMessage] = useState("");
    const [creationError, setCreationError] = useState("");
    const [brandDialogOpen, setBrandDialogOpen] = useState(false);
    const [brandName, setBrandName] = useState("");
    const [brandLogoFile, setBrandLogoFile] = useState<File | null>(null);
    const [brandLogoPreview, setBrandLogoPreview] = useState("");
    const [brandError, setBrandError] = useState("");
    const [brandNameError, setBrandNameError] = useState("");
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imagePreviewUrlsRef = useRef<string[]>([]);
    const {
        data: brands = [],
        isLoading: loadingBrands,
        error: brandsError,
        refetch: refetchBrands,
    } = useGetBrandsQuery(undefined);
    const [uploadProductImages, { isLoading: uploading }] = useUploadImagesMutation();
    const [addProduct, { isLoading: addingProduct }] = useAddProductMutation();
    const [uploadBrandLogo, { isLoading: uploadingBrandLogo }] = useUploadBrandLogoMutation();
    const [createBrand, { isLoading: creatingBrand }] = useCreateBrandMutation();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<ProductFormData, any, ProductData>({
        resolver: zodResolver(ProductSchema),
        defaultValues: { inStock: true },
    });

    useEffect(() => () => imagePreviewUrlsRef.current.forEach((preview) => URL.revokeObjectURL(preview)), []);
    useEffect(() => () => {
        if (brandLogoPreview) URL.revokeObjectURL(brandLogoPreview);
    }, [brandLogoPreview]);

    const onSubmit = async (data: ProductData) => {
        setCreationMessage("");
        setCreationError("");
        if (!imagesUploaded || data.imageUrl.length === 0) {
            setUploadError("Upload at least one product image successfully before creating the product.");
            return;
        }

        try {
            await addProduct(data).unwrap();
            setCreationMessage("Product created successfully.");
        } catch (error) {
            setCreationError(getApiErrorMessage(error, "Could not create the product. Please try again."));
        }
    };

    const handleClose = () => {
        reset();
        setImagesUploaded(false);
        imagePreviewUrlsRef.current.forEach((preview) => URL.revokeObjectURL(preview));
        imagePreviewUrlsRef.current = [];
        setImageItems([]);
        setUploadError("");
        setCreationError("");
        setCreationMessage("");
        setShowForm(false);
        router.push(initiallyOpen ? "/products" : "/");
    };

    const uploadedImagesHandler = async (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        if (files.length === 0) return;

        setImagesUploaded(false);
        setUploadError("");
        setCreationMessage("");
        setValue("imageUrl", [], { shouldValidate: true, shouldDirty: true });
        imagePreviewUrlsRef.current.forEach((preview) => URL.revokeObjectURL(preview));
        imagePreviewUrlsRef.current = [];
        const selectedImages = files.map((file, index) => ({
            id: `${file.name}-${file.lastModified}-${index}`,
            preview: URL.createObjectURL(file),
            url: "",
        }));
        imagePreviewUrlsRef.current = selectedImages.map((item) => item.preview);
        setImageItems(selectedImages);

        if (files.length > 10) {
            setUploadError("Choose no more than 10 product images.");
            event.target.value = "";
            return;
        }

        const formData = new FormData();
        files.forEach((file) => formData.append("productImages", file));

        try {
            const result = await uploadProductImages(formData).unwrap();
            if (!Array.isArray(result.urls) || result.urls.length !== files.length) {
                throw new Error("The image upload response did not contain all image URLs.");
            }
            const uploadedItems = selectedImages.map((item, index) => ({ ...item, url: result.urls[index] }));
            setImageItems(uploadedItems);
            setValue("imageUrl", uploadedItems.map((item) => item.url), { shouldValidate: true, shouldDirty: true });
            setImagesUploaded(true);
        } catch (error) {
            setUploadError(getApiErrorMessage(error, "Image upload failed. Please try again."));
        } finally {
            event.target.value = "";
        }
    };

    const setPrimaryImage = (imageId: string) => {
        const selected = imageItems.find((item) => item.id === imageId);
        if (!selected || !selected.url) return;
        const reordered = [selected, ...imageItems.filter((item) => item.id !== imageId)];
        setImageItems(reordered);
        setValue("imageUrl", reordered.map((item) => item.url), { shouldValidate: true, shouldDirty: true });
    };

    const removeImage = (imageId: string) => {
        const removed = imageItems.find((item) => item.id === imageId);
        if (removed) {
            URL.revokeObjectURL(removed.preview);
            imagePreviewUrlsRef.current = imagePreviewUrlsRef.current.filter((preview) => preview !== removed.preview);
        }
        const remaining = imageItems.filter((item) => item.id !== imageId);
        setImageItems(remaining);
        const imageUrls = remaining.map((item) => item.url).filter(Boolean);
        setValue("imageUrl", imageUrls, { shouldValidate: true, shouldDirty: true });
        setImagesUploaded(imageUrls.length > 0 && imageUrls.length === remaining.length);
        setUploadError("");
    };

    const handleBrandLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        setBrandLogoFile(file);
        setBrandLogoPreview(file ? URL.createObjectURL(file) : "");
        setBrandError("");
    };

    const handleCreateBrand = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const normalizedName = brandName.trim();
        setBrandNameError("");
        setBrandError("");

        if (!normalizedName) {
            setBrandNameError("Brand name is required.");
            return;
        }
        if (!brandLogoFile) {
            setBrandError("Choose a logo image for the new brand.");
            return;
        }

        const formData = new FormData();
        formData.append("logo", brandLogoFile);
        try {
            const logoResult = await uploadBrandLogo(formData).unwrap();
            const logo = logoResult.urls[0];
            if (!logo) throw new Error("The logo upload did not return an image URL.");

            const result = await createBrand({ name: normalizedName, logo }).unwrap();
            if (!result.data._id) throw new Error("The created brand response did not include its ID.");

            await refetchBrands();
            setValue("brand", result.data._id, { shouldValidate: true, shouldDirty: true });
            setBrandDialogOpen(false);
            setBrandName("");
            setBrandLogoFile(null);
            setBrandLogoPreview("");
        } catch (error) {
            setBrandError(getApiErrorMessage(error, "Could not create the brand. Please try again."));
        }
    };

    return (
        <div className="min-h-screen bg-[#fdfcfb] text-[#171717]">
            {!initiallyOpen && !showForm && (
                <div className="px-6 py-10">
                    <button type="button" onClick={() => setShowForm(true)} className="border-b border-black pb-1 text-xs uppercase tracking-[0.2em] transition-opacity hover:opacity-60" style={labelStyle}>
                        Upload Product
                    </button>
                </div>
            )}

            {showForm && (
                <main className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-14 lg:py-16">
                    <header className="mb-10 flex items-end justify-between border-b border-[#dedbd6] pb-6 sm:mb-14 sm:pb-8">
                        <div>
                            <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-[#77736d]" style={labelStyle}>
                                Product Management <span className="px-2 text-[#b8b4ad]">/</span> Inventory
                            </p>
                            <h1 className="font-[family-name:var(--font-cormorant)] text-5xl font-medium uppercase leading-none tracking-[0.04em] sm:text-6xl lg:text-7xl">
                                New Product
                            </h1>
                        </div>
                        <p className="hidden pb-1 text-xs uppercase tracking-[0.18em] text-[#8a867f] sm:block" style={labelStyle}>
                            Product Studio <span className="ml-3 text-black">01</span>
                        </p>
                    </header>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
                            <section aria-labelledby="product-information-heading" className="space-y-9">
                                <div className="flex items-baseline justify-between border-b border-[#dedbd6] pb-3">
                                    <h2 id="product-information-heading" className="font-[family-name:var(--font-cormorant)] text-3xl sm:text-4xl">Product information</h2>
                                    <span className="text-[10px] uppercase tracking-[0.18em] text-[#8a867f]" style={labelStyle}>01 — Details</span>
                                </div>

                                <div>
                                    <label htmlFor="product-title" className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-[#77736d]" style={labelStyle}>Product title</label>
                                    <input id="product-title" {...register("title")} placeholder="Enter product name" className="w-full border-0 border-b border-[#c9c5be] bg-transparent px-0 py-3 text-lg outline-none transition-colors placeholder:text-[#aaa69f] focus:border-black" />
                                    {errors.title && <p className="mt-2 text-xs text-[#8a3737]">{errors.title.message}</p>}
                                </div>

                                <div>
                                    <div className="mb-2 flex items-center justify-between gap-4">
                                        <label htmlFor="product-brand" className="text-[11px] uppercase tracking-[0.16em] text-[#77736d]" style={labelStyle}>Brand</label>
                                        <button type="button" onClick={() => { setBrandError(""); setBrandNameError(""); setBrandDialogOpen(true); }} className="shrink-0 text-[11px] uppercase tracking-[0.14em] text-black transition-opacity hover:opacity-50" style={labelStyle}>
                                            Add New Brand <span aria-hidden="true">+</span>
                                        </button>
                                    </div>
                                    <select id="product-brand" {...register("brand")} className="w-full appearance-none border-0 border-b border-[#c9c5be] bg-transparent px-0 py-3 text-base outline-none transition-colors focus:border-black">
                                        <option value="">{loadingBrands ? "Loading brands…" : "Select a brand"}</option>
                                        {brands.map((brand) => <option key={brand._id} value={brand._id}>{brand.name}</option>)}
                                    </select>
                                    {brandsError && <p className="mt-2 text-xs text-[#8a3737]">Could not load brands. Please refresh and try again.</p>}
                                    {errors.brand && <p className="mt-2 text-xs text-[#8a3737]">{errors.brand.message}</p>}
                                </div>

                                <div className="grid gap-8 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="product-category" className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-[#77736d]" style={labelStyle}>Category</label>
                                        <input id="product-category" {...register("category")} placeholder="e.g. Ready to wear" className="w-full border-0 border-b border-[#c9c5be] bg-transparent px-0 py-3 text-base outline-none transition-colors placeholder:text-[#aaa69f] focus:border-black" />
                                        {errors.category && <p className="mt-2 text-xs text-[#8a3737]">{errors.category.message}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="product-head-category" className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-[#77736d]" style={labelStyle}>Head category</label>
                                        <select id="product-head-category" {...register("headCategory")} className="w-full border-0 border-b border-[#c9c5be] bg-transparent px-0 py-3 text-base outline-none transition-colors focus:border-black">
                                            <option value="">Select a head category</option>
                                            {HEAD_CATEGORIES.map((headCategory) => <option key={headCategory} value={headCategory}>{headCategory}</option>)}
                                        </select>
                                        {errors.headCategory && <p className="mt-2 text-xs text-[#8a3737]">{errors.headCategory.message}</p>}
                                    </div>
                                </div>

                                <div className="grid gap-8 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="product-price" className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-[#77736d]" style={labelStyle}>Price</label>
                                        <div className="flex items-center border-b border-[#c9c5be] focus-within:border-black">
                                            <span className="pr-3 text-xs tracking-[0.1em] text-[#77736d]" style={labelStyle}>MMK</span>
                                            <input id="product-price" type="number" min="0" step="any" {...register("price")} placeholder="0.00" className="w-full border-0 bg-transparent px-0 py-3 text-base outline-none placeholder:text-[#aaa69f]" />
                                        </div>
                                        {errors.price && <p className="mt-2 text-xs text-[#8a3737]">{errors.price.message}</p>}
                                    </div>
                                    <label className="flex cursor-pointer items-center justify-between border-b border-[#c9c5be] py-3">
                                        <span>
                                            <span className="block text-[11px] uppercase tracking-[0.16em] text-[#77736d]" style={labelStyle}>Availability</span>
                                            <span className="mt-1 block text-sm">In stock</span>
                                        </span>
                                        <input type="checkbox" {...register("inStock")} className="h-4 w-4 accent-black" />
                                    </label>
                                </div>

                                <fieldset>
                                    <legend className="mb-3 text-[11px] uppercase tracking-[0.16em] text-[#77736d]" style={labelStyle}>Available sizes</legend>
                                    <div className="flex flex-wrap gap-2">
                                        {sizes.map((size) => (
                                            <label key={size} className="group cursor-pointer">
                                                <input type="checkbox" value={size} {...register("size")} className="peer sr-only" />
                                                <span className="flex h-11 min-w-11 items-center justify-center border border-[#d3d0ca] px-3 text-xs tracking-[0.08em] transition-colors group-hover:border-black peer-checked:border-black peer-checked:bg-black peer-checked:text-white" style={labelStyle}>{size}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.size && <p className="mt-2 text-xs text-[#8a3737]">{errors.size.message}</p>}
                                </fieldset>

                                <fieldset>
                                    <legend className="mb-3 text-[11px] uppercase tracking-[0.16em] text-[#77736d]" style={labelStyle}>Available colors</legend>
                                    <div className="flex flex-wrap gap-x-5 gap-y-3">
                                        {colors.map((color) => (
                                            <label key={color.name} className="flex cursor-pointer items-center gap-2.5">
                                                <input type="checkbox" value={color.name} {...register("color")} className="peer sr-only" />
                                                <span className="h-5 w-5 rounded-full border border-[#bdb9b2] ring-offset-2 transition-shadow peer-checked:ring-1 peer-checked:ring-black" style={{ backgroundColor: color.value }} />
                                                <span className="text-xs text-[#625f5a] transition-colors peer-checked:text-black" style={labelStyle}>{color.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.color && <p className="mt-2 text-xs text-[#8a3737]">{errors.color.message}</p>}
                                </fieldset>
                            </section>

                            <section aria-labelledby="product-images-heading" className="space-y-5">
                                <div className="flex items-baseline justify-between border-b border-[#dedbd6] pb-3">
                                    <h2 id="product-images-heading" className="font-[family-name:var(--font-cormorant)] text-3xl sm:text-4xl">Product imagery</h2>
                                    <span className="text-[10px] uppercase tracking-[0.18em] text-[#8a867f]" style={labelStyle}>02 — Visuals</span>
                                </div>

                                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading || addingProduct} className="group flex min-h-[230px] w-full flex-col items-center justify-center border border-dashed border-[#c9c5be] bg-[#faf9f7] px-6 py-10 text-center transition-colors hover:border-black hover:bg-white disabled:cursor-wait disabled:opacity-60 sm:min-h-[280px]">
                                    <span className="mb-5 flex h-12 w-12 items-center justify-center border border-[#dedbd6] text-[#5f5b55] transition-colors group-hover:border-black group-hover:text-black">
                                        {imagesUploaded ? <CheckCircle fontSize="small" /> : <Collections fontSize="small" />}
                                    </span>
                                    <span className="text-[11px] uppercase tracking-[0.18em]" style={labelStyle}>{uploading ? "Uploading selected images" : "Add product images"}</span>
                                    <span className="mt-2 text-xs text-[#85817b]">Choose up to 10 images · JPG, PNG or WEBP</span>
                                    <span className="mt-5 border-b border-[#aaa69f] pb-1 text-[10px] uppercase tracking-[0.15em] transition-colors group-hover:border-black" style={labelStyle}>Browse files</span>
                                </button>
                                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={uploadedImagesHandler} className="sr-only" aria-label="Choose product images" />

                                {imageItems.length > 0 && (
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label="Product image previews">
                                        {imageItems.map((item, index) => (
                                            <figure key={item.id} className="group relative aspect-[4/5] overflow-hidden bg-[#f2f0ec]">
                                                <img src={item.preview} alt={`Product image ${index + 1}`} className="h-full w-full object-cover" />
                                                {index === 0 && item.url && <figcaption className="absolute bottom-0 left-0 bg-white/95 px-3 py-2 text-[9px] uppercase tracking-[0.15em]" style={labelStyle}>Primary image</figcaption>}
                                                <button type="button" aria-label={`Remove image ${index + 1}`} disabled={uploading} onClick={() => removeImage(item.id)} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center bg-white/95 text-black opacity-100 transition-opacity hover:bg-black hover:text-white sm:opacity-0 sm:group-hover:opacity-100">
                                                    <Close fontSize="small" />
                                                </button>
                                                {item.url && index !== 0 && <button type="button" onClick={() => setPrimaryImage(item.id)} disabled={uploading || addingProduct} className="absolute bottom-2 right-2 bg-white/95 px-2 py-1.5 text-[9px] uppercase tracking-[0.12em] opacity-100 transition-colors hover:bg-black hover:text-white sm:opacity-0 sm:group-hover:opacity-100" style={labelStyle}>Set primary</button>}
                                            </figure>
                                        ))}
                                    </div>
                                )}
                                <p className="text-[10px] uppercase tracking-[0.12em] text-[#8a867f]" style={labelStyle}>The first image will be shown as the primary product image.</p>
                                {uploadError && <p role="alert" className="border-l border-[#8a3737] py-2 pl-3 text-sm text-[#8a3737]">{uploadError}</p>}
                                {errors.imageUrl && <p role="alert" className="text-sm text-[#8a3737]">{errors.imageUrl.message}</p>}
                            </section>
                        </div>

                        <div className="mt-14 flex flex-col-reverse items-start justify-between gap-5 border-t border-[#dedbd6] pt-6 sm:mt-20 sm:flex-row sm:items-center">
                            <button type="button" onClick={handleClose} className="text-[11px] uppercase tracking-[0.18em] text-[#77736d] transition-colors hover:text-black" style={labelStyle}>Cancel</button>
                            <div className="w-full sm:w-auto sm:min-w-64">
                                {creationMessage && <p role="status" className="mb-3 text-sm text-[#52634e]">{creationMessage}</p>}
                                {creationError && <p role="alert" className="mb-3 border-l border-[#8a3737] py-2 pl-3 text-sm text-[#8a3737]">{creationError}</p>}
                                <button type="submit" disabled={addingProduct || uploading || !imagesUploaded} className="w-full bg-black px-10 py-4 text-[11px] uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#393733] disabled:cursor-not-allowed disabled:bg-[#aaa69f]" style={labelStyle}>
                                    {addingProduct ? "Creating product…" : "Create product"}
                                </button>
                            </div>
                        </div>
                    </form>
                </main>
            )}

            {brandDialogOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4 py-8" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !creatingBrand && !uploadingBrandLogo) setBrandDialogOpen(false); }}>
                    <section role="dialog" aria-modal="true" aria-labelledby="new-brand-heading" className="relative w-full max-w-lg border border-[#dedbd6] bg-[#fdfcfb] p-6 sm:p-10">
                        <button type="button" aria-label="Close add brand dialog" onClick={() => setBrandDialogOpen(false)} disabled={creatingBrand || uploadingBrandLogo} className="absolute right-5 top-5 text-[#77736d] transition-colors hover:text-black disabled:opacity-40">
                            <Close fontSize="small" />
                        </button>
                        <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[#85817b]" style={labelStyle}>Product management / Brands</p>
                        <h2 id="new-brand-heading" className="mb-8 font-[family-name:var(--font-cormorant)] text-4xl">Add new brand</h2>

                        <form onSubmit={handleCreateBrand} className="space-y-7">
                            <div>
                                <label htmlFor="new-brand-name" className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-[#77736d]" style={labelStyle}>Brand name</label>
                                <input id="new-brand-name" autoFocus value={brandName} onChange={(event) => setBrandName(event.target.value)} className="w-full border-0 border-b border-[#c9c5be] bg-transparent px-0 py-3 outline-none focus:border-black" />
                                {brandNameError && <p role="alert" className="mt-2 text-xs text-[#8a3737]">{brandNameError}</p>}
                            </div>

                            <div>
                                <label htmlFor="new-brand-logo" className="mb-3 block text-[11px] uppercase tracking-[0.16em] text-[#77736d]" style={labelStyle}>Brand logo</label>
                                <label htmlFor="new-brand-logo" className="flex cursor-pointer items-center gap-4 border border-dashed border-[#c9c5be] p-4 transition-colors hover:border-black">
                                    {brandLogoPreview ? <img src={brandLogoPreview} alt="Selected brand logo preview" className="h-16 w-16 object-cover" /> : <span className="flex h-16 w-16 items-center justify-center bg-[#f1efeb] text-[#77736d]"><Collections fontSize="small" /></span>}
                                    <span>
                                        <span className="block text-sm">{brandLogoFile?.name ?? "Choose a logo image"}</span>
                                        <span className="mt-1 block text-xs text-[#85817b]">JPG, PNG or WEBP</span>
                                    </span>
                                </label>
                                <input id="new-brand-logo" type="file" accept="image/*" onChange={handleBrandLogoChange} className="sr-only" />
                            </div>

                            {brandError && <p role="alert" className="border-l border-[#8a3737] py-2 pl-3 text-sm text-[#8a3737]">{brandError}</p>}
                            <div className="flex items-center justify-between border-t border-[#dedbd6] pt-5">
                                <button type="button" onClick={() => setBrandDialogOpen(false)} disabled={creatingBrand || uploadingBrandLogo} className="text-[10px] uppercase tracking-[0.16em] text-[#77736d] hover:text-black disabled:opacity-40" style={labelStyle}>Cancel</button>
                                <button type="submit" disabled={creatingBrand || uploadingBrandLogo} className="min-w-44 bg-black px-6 py-3.5 text-[10px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#393733] disabled:cursor-wait disabled:bg-[#aaa69f]" style={labelStyle}>
                                    {uploadingBrandLogo ? "Uploading logo…" : creatingBrand ? "Creating brand…" : "Create brand"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </div>
    );
}
