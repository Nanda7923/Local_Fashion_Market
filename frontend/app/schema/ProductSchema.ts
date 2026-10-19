import {z} from "zod";

export const HEAD_CATEGORIES = [
    "Topwear",
    "Outerwear",
    "Bottomwear",
    "Footwear",
    "Accessories",
    "Dresses & Jumpsuits",
    "Activewear",
    "Traditional Wear",
    "Others",
] as const;

export const ProductSchema = z.object({
    title : z.string({ message: "Item name is required" })
                .min(1, "Item name cannot be empty"),

    brand : z.string({ message: "Choose a brand" })
                .min(1, "Choose a brand"),

    category : z.string({ message: "Category name is required" })
                .min(1, "Category name cannot be empty"),

    headCategory : z.enum(HEAD_CATEGORIES, {
                message: "Choose a head category",
            }),

    price : z.coerce
                .number( "Price must be a valid number" )
                .positive("Price must be greater than zero"),

    size : z.array(
                z.enum(['S','M','L','XL','2XL'], {
                    message: "Invalid size selected",
                })
            )
            .min(1,"At least one size is required"),

    inStock : z.boolean("InStock?").default(true),

    color : z.array(
                z.string("Color is required"),
            ).min(1,"At least one color is required"),

    imageUrl : z.array(
                z.string("Image is required"),
            ).min(1,"At least one image is required"),
})

export type ProductFormData = z.input<typeof ProductSchema>;
export type ProductData = z.output<typeof ProductSchema>;
