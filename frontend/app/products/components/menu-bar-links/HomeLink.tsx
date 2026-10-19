import ViewCollectionBtn from "@/app/products/components/ViewCollectionBtn";

export default function HomeLink() {
    return(
        <div className="mt-24 flex flex-col items-start gap-12 pl-10 pr-10 max-w-2xl">
            {/* Micro Category Tag */}
            <span className="text-[9px] uppercase tracking-[0.5em] text-neutral-400 font-medium">
        01 / Studio Overview
    </span>

            {/* Clean, Massive Luxury Title */}
            <h1 className="text-2xl font-extralight tracking-[0.35em] uppercase sm:text-3xl text-neutral-900">
                Burma Collections
            </h1>

            {/* High-End Editorial Text Block */}
            <div className="flex flex-col gap-4 text-xs font-light leading-relaxed tracking-[0.2em] text-neutral-500">
                <p>
                    An intentional study of form, utility, and modern proportions.
                </p>
                <p>
                    We curate foundational wardrobe layers utilizing pristine, sustainably
                    sourced raw textiles. Monochromatic palettes designed to outlast seasonal trends.
                </p>
            </div>

            {/* Your Reusable Interactive Link Button */}
            <div className="mt-4">
                <ViewCollectionBtn label={"Enter Archive"} />
            </div>

            {/* Softened Section Divider Line */}
            <hr className="w-full mt-16 border-neutral-200" />
        </div>

    )
}