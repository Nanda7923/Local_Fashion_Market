/** A brand reference as it may appear on a product response. */
export interface ProductBrandSummary {
    _id?: string;
    name: string;
    logo?: string;
}

/** Brand data returned by the brand endpoints. */
export interface Brand {
    _id: string;
    name: string;
    logo: string;
}

export type ProductBrand = ProductBrandSummary | string | null;
export type PopulatedProductBrand = Pick<Brand, "_id" | "name"> | string | null;

/** Product shape used by product API responses. */
export interface Product {
    _id?: string;
    title: string;
    brand: ProductBrand;
    category: string;
    headCategory: string;
    department?: string;
    price: number;
    size: string[];
    inStock: boolean;
    color: string[];
    imageUrl: string[];
}

/** Product shape used by listing cards, where the API may also return createdAt. */
export type ProductListItem = Product & { createdAt?: string };

/** Payload accepted by both product create and update requests. */
export interface ProductCreateRequest {
    title: string;
    brand: string;
    category: string;
    headCategory: string;
    price: number;
    size: string[];
    inStock: boolean;
    color: string[];
    imageUrl: string[];
}

export type BrandCreateRequest = Pick<Brand, "name" | "logo">;
export type BrandUpdateRequest = { id: string } & BrandCreateRequest;
