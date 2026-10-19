import ProductList from "@/app/products/components/ProductList";
import ProductPageNavBar from "@/app/products/components/nav-bar/ProductPageNavBar";

export default async function LegacyCategoryPage({ params }: { params: Promise<{ category: string }> }) {
    const { category } = await params;
    return <><ProductPageNavBar /><ProductList categorySlug={category} /></>;
}
