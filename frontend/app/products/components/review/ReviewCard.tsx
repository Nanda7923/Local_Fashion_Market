"use client";
import React,{useState} from 'react';
import { Card, CardContent, CardActions, Typography, Rating, Box } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import {useCreatedReviewMutation} from "@/lib/features/product/reviewApiSlice";


interface ReviewCardProps {
    productId : string;
    setShowReviewForm : React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ReviewCard({ productId , setShowReviewForm }: ReviewCardProps) {
    const  [createReview,{isLoading}] = useCreatedReviewMutation();
    const [rating, setRating] = useState<number>(2.5);
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");

    const cancelBtnHandler = () => {
        setShowReviewForm(false);
    }

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setShowReviewForm(false);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [setShowReviewForm]);

    const postBtnHandler =  async () => {
        try {
            await createReview({
                productId,
                review: { rating, comment },
            }).unwrap();

            setShowReviewForm(false);
        } catch {
            setError("Your review could not be saved. Please try again.");
        }
    };
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) setShowReviewForm(false);
            }}
        >
            <Card
                elevation={0}
                className="max-w-[360px] bg-[#FAFAF9] rounded-[20px] border border-[#E7E5E4] shadow-2xl p-1.5 animate-luxury-scale-in"
            >
                <CardContent className="text-center pb-2">
                    {/* Main Title */}
                    <Typography
                        variant="h6"
                        className="font-serif font-medium text-[#1C1917] tracking-[0.01em] mb-1"
                    >
                        Rate Our Product
                    </Typography>

                    {/* Subtitle */}
                    <Typography
                        variant="body2"
                        className="text-[#78716C] text-[0.85rem] mb-4"
                    >
                        Your opinion shapes our standard of quality.
                    </Typography>

                    {/* Rating Container */}
                    <Box className="flex justify-center">
                        <Rating
                            name="champagne-rating"
                            value={rating}
                            onChange={(_, newValue) => setRating(newValue ?? 0)}
                            precision={0.5}
                            icon={<StarIcon fontSize="inherit" className="text-[#D97706]" />}
                            emptyIcon={<StarIcon fontSize="inherit" className="text-[#E7E5E4]" />}
                            className="text-[2.2rem] [&_.MuiRating-icon]:mx-[3px]"
                        />
                    </Box>
                <textarea aria-label="Review comment" value={comment} onChange={(event) => setComment(event.target.value)} maxLength={2000} placeholder="Share your thoughts about this product" className="mt-4 min-h-24 w-full resize-y rounded-lg border border-stone-300 bg-white p-3 text-sm text-stone-800" />
                {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
                </CardContent>

                <CardActions className="justify-end gap-2 px-4 pb-2">
                    {/* Cancel Button */}
                    <button
                        onClick={cancelBtnHandler}
                        className="text-[#78716C] normal-case font-medium rounded-[10px] hover:bg-[#F5F5F4]"
                    >
                        Cancel
                    </button>

                    {/* Post Button */}
                    <button
                        onClick={postBtnHandler}
                        disabled={isLoading || rating === null || rating === 0}
                        className="bg-[#1C1917] text-[#FAFAF9] normal-case font-semibold rounded-[10px] px-5 py-[6.4px] hover:bg-[#292524] disabled:opacity-50"
                    >
                        {isLoading ? "Posting..." : "Post"}
                    </button>
                </CardActions>
            </Card>
        </div>

    );
}
