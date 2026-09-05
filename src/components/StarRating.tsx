"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";

interface StarRatingProps {
  rating: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export function StarRating({
  rating,
  size = 16,
  interactive = false,
  onChange,
}: StarRatingProps) {
  const { t } = useLanguage();
  const [hovered, setHovered] = useState(0);
  const display = interactive && hovered > 0 ? hovered : rating;

  return (
    <div className="inline-flex items-center gap-0.5" role={interactive ? "radiogroup" : "img"} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.floor(display);
        const half = !filled && star === Math.ceil(display) && display % 1 >= 0.25;

        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onMouseEnter={() => interactive && setHovered(star)}
            onMouseLeave={() => interactive && setHovered(0)}
            onClick={() => interactive && onChange?.(star)}
            className={`${interactive ? "cursor-pointer" : "cursor-default"} transition-colors`}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill={filled ? "#ec4899" : half ? "#f9a8d4" : "none"}
              stroke={filled || half ? "#ec4899" : "#d1d5db"}
              strokeWidth="1.5"
            >
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
