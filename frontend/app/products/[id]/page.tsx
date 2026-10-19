"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import ProductDetailCard from "@/app/products/components/ProductDetailCard";
import ProductList from "@/app/products/components/ProductList";
import ProductPageNavBar from "@/app/products/components/nav-bar/ProductPageNavBar";
import NavBar from "../components/nav-bar/NavBar";

const objectIdPattern = /^[a-f\d]{24}$/i;

export default function ProductsDetailOrCategoryPage() {
    const params = useParams<{ id: string }>();
    const idOrSlug = typeof params.id === "string" ? params.id : "";
    const isProductDetail = objectIdPattern.test(idOrSlug);

    useEffect(() => {
        if (typeof window !== "undefined" && !window.location.hash) {
            window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }
    }, [idOrSlug]);

    if (isProductDetail) {
        return (
            <>
                <NavBar />
                <ProductDetailCard />
            </>
        );
    }
    return (
        <>
            <ProductPageNavBar />
            <ProductList categorySlug={idOrSlug} />
        </>
    );
}
