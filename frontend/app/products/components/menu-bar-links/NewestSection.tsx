import Typography from "@mui/material/Typography";
import ViewCollectionBtn from "@/app/products/components/ViewCollectionBtn";

export default function NewestSection(){
    return (
        <div className="flex flex-col gap-8 items-start px-10 my-32">
            <Typography className="!text-xs !font-light !tracking-[.3em] uppercase text-gray-800">
                newest
            </Typography>
            <Typography className="!text-xl !font-light !tracking-[.35em] text-gray-800">THE LATEST EDITION</Typography>
            <Typography className="!text-xs !font-light !tracking-[.3em] text-gray-600">
                A considered selection of our newest arrivals, chosen for the season ahead.
            </Typography>
            <ViewCollectionBtn label={"View Collections"}/>
            <hr className="w-full mt-6 border-gray-200"/>
        </div>

    )
}