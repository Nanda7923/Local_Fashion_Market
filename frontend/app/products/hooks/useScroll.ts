import { useRef } from "react";

export const useScroll = () => {
    const sliderRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        const slider = sliderRef.current;
        if (!slider) return;

        const cards = [...slider.children] as HTMLElement[];
        if (cards.length === 0) return;

        // Get the actual computed horizontal padding of the slider container
        const computedStyle = getComputedStyle(slider);
        const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
        const gap = parseFloat(computedStyle.columnGap) || 0;

        const cardWidth = cards[0].getBoundingClientRect().width;

        const visibleCards = Math.max(
            1,
            Math.floor(
                (slider.clientWidth + gap) / (cardWidth + gap)
            )
        );

        // Find current card index relative to the container scroll track position
        const currentIndex = cards.reduce(
            (closestIndex, card, index) => {
                // Fix distance check by factoring in the padding offset
                const currentDistance = Math.abs((card.offsetLeft - paddingLeft) - slider.scrollLeft);
                const closestDistance = Math.abs((cards[closestIndex].offsetLeft - paddingLeft) - slider.scrollLeft);

                return currentDistance < closestDistance ? index : closestIndex;
            },
            0
        );

        // Last position that can show the final card group fully
        const lastIndex = Math.max(0, cards.length - visibleCards);

        const targetIndex =
            direction === "right"
                ? Math.min(currentIndex + visibleCards, lastIndex)
                : Math.max(currentIndex - visibleCards, 0);

        // FIX: Subtract paddingLeft so the slider respects your padding gutter boundary!
        let targetScrollLeft = cards[targetIndex].offsetLeft - paddingLeft;

        // Safely force absolute 0 check for the first element boundary
        if (targetIndex === 0) {
            targetScrollLeft = 0;
        }

        slider.scrollTo({
            left: targetScrollLeft,
            behavior: "smooth",
        });
    };

    return {
        sliderRef,
        scroll
    };
};
