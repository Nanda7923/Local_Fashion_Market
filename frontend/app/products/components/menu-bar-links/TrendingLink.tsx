import Typography from "@mui/material/Typography";
import ViewCollectionBtn from "@/app/products/components/ViewCollectionBtn";

export default function TrendingLink() {
    return(
        <div className="mt-32 flex flex-col gap-10 pl-10 items-start">
            <Typography className="!font-light !text-sm !tracking-[0.3em]">THE TRENDING REPORT</Typography>
            <Typography className="!text-xs !tracking-[0.2em]">
                A strict curation of our most-viewed and highest-rated pieces this week.
                Elevated design metrics for effortless wardrobe styling.
            </Typography>
            <ViewCollectionBtn label={ "DISCOVER THE TOP PICKS"}/>
        </div>
    )
}