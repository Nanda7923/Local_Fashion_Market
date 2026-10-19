"use client";

import ProductList from "@/app/products/components/ProductList";
import ProductPageNavBar from "@/app/products/components/nav-bar/ProductPageNavBar";

export default function ProductPage() {
    return(
        <div>
            <ProductPageNavBar/>
            <ProductList/>
        </div>
    )
}
