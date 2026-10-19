import Link from "next/link";
export default function ViewCollectionBtn({label}:{label:string}) {
    return(
        <Link href="/products"
              className="group relative inline-flex items-center gap-3 text-[10px] uppercase
                            tracking-[0.3em] sm:text-xs"
        >
            <span>{label}</span>

            <span className="transition-transform duration-300 group-hover:translate-x-1">
                                →
                            </span>

            <span className=" absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 bg-black
                             transition-transform duration-500 group-hover:scale-x-100"
            />
        </Link>
    )
}