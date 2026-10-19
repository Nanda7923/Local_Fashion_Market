"use client";
import { useGetProductByIdQuery } from "@/lib/features/product/productApiSlice";
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Typography from "@mui/material/Typography";
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import Rating from '@mui/material/Rating';
import {useGetAverageRatingQuery} from "@/lib/features/product/reviewApiSlice";
import ReviewCard from "@/app/products/components/review/ReviewCard"
import { useAuth } from "@/app/products/hooks/useAuth";
import { useAddCartItemMutation } from "@/lib/features/product/cartApiSlice";
import { useAppSelector } from "@/lib/hooks";
import { selectAuthInitialized } from "@/lib/features/auth/authSlice";
import ReviewList from "@/app/products/components/review/ReviewList";
import RelatedProducts from "@/app/products/components/RelatedProducts";
import WishlistButton from "@/app/products/components/wishlist/WishlistButton";



export default function ProductDetailCard(){
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const shouldReduceMotion = useReducedMotion();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(1);
    const [orderCount , setOrderCount] = useState(1);
    const [selectedColor, setSelectedColor] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [cartFeedback, setCartFeedback] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
    const [variantErrors, setVariantErrors] = useState({ size: false, color: false });
    const [showReviewForm,setShowReviewForm] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined" && !window.location.hash) {
            window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }
        setCurrentIndex(0);
        setOrderCount(1);
        setSelectedColor("");
        setSelectedSize("");
        setCartFeedback(null);
        setVariantErrors({ size: false, color: false });
    }, [id]);

    const handleBack = () => {
        const hasNextHistory =
            typeof window !== "undefined" &&
            typeof window.history.state?.idx === "number" &&
            window.history.state.idx > 0;

        const hasSameOriginReferrer =
            typeof document !== "undefined" &&
            Boolean(document.referrer) &&
            document.referrer.startsWith(window.location.origin);

        if (hasNextHistory || hasSameOriginReferrer) {
            router.back();
        } else {
            router.push("/products");
        }
    };
    console.log("id",id);
    const {data:product, isLoading, error} = useGetProductByIdQuery(id);
    const { isAuthenticated } = useAuth();
    const authInitialized = useAppSelector(selectAuthInitialized);
    const [addCartItem, { isLoading: isAddingToCart }] = useAddCartItemMutation();
    const {data:review} = useGetAverageRatingQuery(product?._id!!,{
        skip: !product?._id,
    });
    console.log("Review:", review);
    console.log("Loading:", isLoading);
    console.log("Error:", error);


    console.log("review",review)
    console.log("BRAND:", product?.brand);
    const handleNext = () => {
        if (!product?.imageUrl?.length) return;

        setDirection(1);

        setCurrentIndex((prev) => prev === product.imageUrl.length - 1 ? 0 : prev + 1);
    };

    const handlePrev = () => {
        if (!product?.imageUrl?.length) return;

        setDirection(-1);

        setCurrentIndex((prev) => prev === 0 ? product.imageUrl.length - 1 : prev - 1)
    };

    const ratingHandler = () => {
        setCartFeedback(null);
        if (!authInitialized) {
            setCartFeedback({ type: "info", message: "Checking your saved session. Please try again in a moment." });
            return;
        }
        if (!isAuthenticated) {
            setCartFeedback({ type: "info", message: "Please log in before submitting a review." });
            return;
        }
        if (!product?._id) return;
        setShowReviewForm(true);
    }

    const addToCartHandler = async () => {
        setCartFeedback(null);
        if (!authInitialized) {
            setCartFeedback({ type: "info", message: "Checking your saved session. Please try again in a moment." });
            return;
        }
        if (!isAuthenticated) {
            setCartFeedback({ type: "info", message: "Please log in before adding items to your cart." });
            return;
        }
        if (!product?._id) {
            setCartFeedback({ type: "error", message: "Product details are unavailable. Refresh the page and try again." });
            return;
        }
        if (!selectedSize || !selectedColor) {
            setVariantErrors({ size: !selectedSize, color: !selectedColor });
            setCartFeedback({ type: "info", message: "Choose a size and color before adding this item." });
            return;
        }

        try {
            await addCartItem({
                productId: product._id,
                quantity: orderCount,
                size: selectedSize,
                color: selectedColor,
            }).unwrap();
            setCartFeedback({ type: "success", message: "Added to your cart." });
        } catch (requestError) {
            let message = "Could not add this item. Please try again.";
            if (typeof requestError === "object" && requestError !== null && "data" in requestError) {
                const responseData = requestError.data;
                if (typeof responseData === "object" && responseData !== null && "message" in responseData && typeof responseData.message === "string") {
                    message = responseData.message;
                }
            }
            setCartFeedback({ type: "error", message });
        }
    };

    return(
        <>
        <div className="w-[95%] mx-auto pt-6 pb-2">
            <button
                type="button"
                onClick={handleBack}
                aria-label="Back to shopping"
                className="group inline-flex items-center gap-2 text-xs md:text-sm font-medium uppercase tracking-[0.22em] text-[#263a31] hover:text-[#9d7952] transition-colors duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#263a31] py-1"
            >
                <ArrowBackIcon className="!text-base transition-transform duration-300 ease-out group-hover:-translate-x-1" />
                <span>Back to Shopping</span>
            </button>
        </div>
        <div className="flex flex-col md:flex-row gap-20 w-[95%] mx-auto mt-2 shadow-lg">
            <div className="w-full md:w-[36%] lg:w-[35%] shrink-0 animate-luxury-fade-in">
                <div className="w-full aspect-[3/4] bg-neutral-50 overflow-hidden relative group">
                    <AnimatePresence
                        initial={false}
                        custom={direction}
                        mode="popLayout"
                    >
                        <motion.img
                            key={currentIndex}
                            src={product?.imageUrl?.[currentIndex]}
                            alt="Product's image"
                            custom={direction}
                            variants={{
                                enter: (direction: number) => ({
                                    x: shouldReduceMotion ? 0 : direction > 0 ? "-100%" : "100%",
                                    opacity: shouldReduceMotion ? 1 : 0.85,
                                }),

                                center: {
                                    x: 0,
                                    opacity: 1,
                                },

                                exit: (direction: number) => ({
                                    x: shouldReduceMotion ? 0 : direction > 0 ? "100%" : "-100%",
                                    opacity: shouldReduceMotion ? 1 : 0.85,
                                }),
                            }}
                            initial={shouldReduceMotion ? false : "enter"}
                            animate="center"
                            exit="exit"
                            transition={{
                                duration: shouldReduceMotion ? 0 : 0.5,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </AnimatePresence>

                    <div className="absolute z-50 bottom-3 left-1/2 -translate-x-1/2 bg-white/80 px-2 py-1 rounded-full">
                        <span className="text-neutral-400 font-light font-xs select-none font-mono">
                            {(currentIndex + 1).toString().padStart(2, '0')} / {product?.imageUrl?.length.toString().padStart(2, '0')}
                        </span>
                    </div>

                    {
                        (product?.imageUrl?.length??0) >1 && (
                            <div>
                                <button onClick={handlePrev}
                                        aria-label="Previous product image"
                                        className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/30
                                        hover:bg-white/80 p-1 backdrop-blur-lg shadow-md cursor-pointer transition-colors duration-200"
                                >
                                    <ChevronLeft className="!text-4xl"/>
                                </button>
                                <button onClick={handleNext}
                                        aria-label="Next product image"
                                        className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/30
                                        hover:bg-white/80 !backdrop-blur-lg  p-1 shadow-md cursor-pointer transition-colors duration-200"
                                >
                                    <ChevronRight className="!text-4xl" />
                                </button>
                            </div>
                        )
                    }
                </div>
            </div>
            <div className="p-5 mt-5 w-full animate-luxury-fade-in [animation-delay:120ms]">
                <Typography className="!font-cormorant !text-2xl md:!text-3xl lg:!text-4xl !font-normal !tracking-[0.12em] pb-5 ">{product?.title}</Typography>
                <Typography className="!font-smoochSans !text-sm md:!text-lg text-gray-500 px-3 py-1">Brand - {typeof product?.brand === "string" ? product.brand || "No Brand" : product?.brand?.name?.trim() || "No Brand"}</Typography>
                <Typography className="!font-smoochSans !text-sm md:!text-lg text-gray-500 px-3 py-1">
                    Colors - {product?.color?.join(", ")}
                </Typography>
                <Typography className="!font-smoochSans !text-sm md:!text-lg text-gray-500 px-3 py-1">
                    Size - {product?.size?.join(", ")}
                </Typography>
                <div className="flex gap-3 items-center">
                    <Typography className="!font-smoochSans !text-sm md:!text-lg flex items-center gap-3 text-gray-500 px-3 py-1">
                        <Rating
                            name="read-only"
                            value={review?.averageRating ?? 0}
                            precision={0.1}
                            className="w-[130px]"
                            readOnly
                        />
                        {(review?.averageRating ?? 0).toFixed(2)}
                    </Typography>

                    <span className="text-xs text-gray-600">
                        ({review?.reviewCount ?? 0} reviews)
                    </span>
                </div>
                <Typography className="!font-smoochSans !text-sm md:!text-lg text-gray-500 px-3 py-1">Price - {product?.price} MMK</Typography>
                <Typography className="!font-smoochSans !text-xs md:!text-sm text-gray-500 px-3 pt-3">Available colors</Typography>
                <div className="flex items-center gap-4 px-3 pt-4 pb-7">
                    {
                        product?.color?.map((c)=>(
                            <label key={c} className="cursor-pointer">
                                <input type='radio' name="color" value={c} checked={selectedColor === c} onChange={() => { setSelectedColor(c); setVariantErrors((current) => ({ ...current, color: false })); setCartFeedback(null); }} className="peer hidden"/>
                                <span
                                    className="inline-block h-8 w-8 rounded-full border-2 border-gray-300 transition-all duration-200 ease-out peer-checked:scale-105
                                    peer-checked:ring-2 peer-checked:ring-[#263a31] peer-checked:ring-offset-2"
                                    style={{backgroundColor: c}}
                                />
                            </label>
                        ))
                    }
                </div>
                {variantErrors.color && <p role="alert" className="px-3 -mt-5 pb-3 text-sm text-red-700">Choose a color to continue.</p>}
                <hr className="w-full pr-10 pl-3 border-gray-300" />
                <Typography className="!font-smoochSans !text-xs md:!text-sm text-gray-500 px-3 pt-3">Available size</Typography>
                <div className="flex items-center gap-4 px-3 pt-5 pb-7">
                    {
                        product?.size?.map((s)=>(
                            <label key={s} className="cursor-pointer">
                                <input type="radio" name="size" value={s} checked={selectedSize === s} onChange={() => { setSelectedSize(s); setVariantErrors((current) => ({ ...current, size: false })); setCartFeedback(null); }} className="peer hidden"/>
                                <span
                                    className="inline-flex h-8 w-8 bg-white items-center justify-center text-gray-700 font-semibold text-sm rounded-full border-2 border-gray-400 transition-all duration-200 ease-out peer-checked:scale-105
                                    peer-checked:ring-2 peer-checked:ring-[#263a31] peer-checked:ring-offset-2"
                                >{s}</span>
                            </label>
                        ))
                    }
                </div>
                {variantErrors.size && <p role="alert" className="px-3 -mt-5 pb-3 text-sm text-red-700">Choose a size to continue.</p>}
                <div className="flex w-full gap-4 max-w-[450px]">
                    <div className="bg-gray-300 p-3 border-gray-700 w-[130px] flex justify-between items-center transition-colors">
                        <button aria-label="Increase quantity" onClick={() => setOrderCount((count) => count + 1)} className="cursor-pointer hover:text-gray-600 transition-colors">
                            <AddIcon className="!text-[24px]"/>
                        </button>
                        <span className='w-[20px] text-center text-sm font-medium'>{orderCount}</span>
                        <button aria-label="Decrease quantity" disabled={orderCount <= 1} onClick={() => setOrderCount((count) => Math.max(1, count - 1))} className="cursor-pointer hover:text-gray-600 transition-colors disabled:opacity-40">
                            <RemoveIcon className="!text-[24px]"/>
                        </button>
                    </div>
                    <div className="flex-1 bg-gray-900 py-3 text-sm uppercase tracking-[0.15em] text-center text-white transition-all duration-300 hover:bg-gray-800 active:scale-[0.99]">
                        <button type="button" onClick={addToCartHandler} disabled={!authInitialized || isLoading || isAddingToCart || !product?.inStock} className="cursor-pointer disabled:opacity-50 w-full h-full">
                            {!authInitialized ? "Checking Session..." : isLoading ? "Loading Product..." : isAddingToCart ? "Adding..." : !product?._id ? "Unavailable" : product.inStock ? "Add To Cart" : "Out Of Stock"}
                        </button>
                    </div>
                </div>
                {!authInitialized && <p role="status" className="mt-2 max-w-[450px] text-sm text-gray-600">Restoring your saved session…</p>}
                {!isLoading && (error || !product) && <p role="alert" className="mt-2 max-w-[450px] text-sm text-red-700">Product details could not be loaded. Refresh the page and try again.</p>}
                {cartFeedback && <p role={cartFeedback.type === "error" ? "alert" : "status"} className={`mt-2 max-w-[450px] text-sm ${cartFeedback.type === "error" ? "text-red-700" : cartFeedback.type === "success" ? "text-green-800" : "text-gray-700"}`}>{cartFeedback.message}</p>}
                {isAddingToCart && <p role="status" className="mt-2 max-w-[450px] text-sm text-gray-600">Adding this item to your cart…</p>}
                <div className="flex gap-6 mt-3 items-center max-w-[450px] justify-between">
                    <button onClick={ratingHandler} aria-label="Rate product" className="cursor-pointer transition-transform duration-200 hover:scale-105">
                        <Rating name="half-rating" defaultValue={1} precision={0.5} className="w-[130px]" />
                    </button>

                    <div className="flex flex-1 justify-center items-center bg-gray-300 w-full cursor-pointer transition-colors duration-200 hover:bg-gray-400/80">
                        <WishlistButton productId={product?._id} productTitle={product?.title ?? "this product"} showLabel />
                    </div>
                </div>
                {
                    showReviewForm && product?._id && <ReviewCard setShowReviewForm={setShowReviewForm} productId={product._id}/>
                }
            </div>
        </div>
        {product?._id && <div className="mx-auto w-[95%]"><ReviewList productId={product._id} />{product && <RelatedProducts product={product} />}</div>}
        </>
    )
}
