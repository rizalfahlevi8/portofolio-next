import StarIcon from "@/assets/icons/star.svg";
import { Fragment } from "react";

const words = ["Performant", "Accessible", "Secure", "Interactive", "Scalable", "User Friendly", "Maintainable", "Search Optimized", "Usable", "Reliable"];

interface TapeSectionProps {
    rotation: string;
    animation: string;
}

export const TapeSection = ({ rotation, animation }: TapeSectionProps) => {
  return (
    <div className="py-16 lg:py-24 overflow-x-clip">
      <div className={`bg-gradient-to-r from-gray-400 to-gray-600 ${rotation} -mx-1`}>
        <div className="flex [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          {/* Container dengan duplikasi untuk seamless infinite scroll */}
          <div className={`flex flex-none gap-4 pr-4 py-3 ${animation}`}>
            {/* Set pertama */}
            {[...new Array(8)].fill(0).map((_, idx) => (
              <Fragment key={`first-${idx}`}>
                {words.map(word => (
                  <div key={`${word}-${idx}`} className="inline-flex gap-4 items-center whitespace-nowrap">
                    <span className="text-white uppercase font-extrabold text-sm">{word}</span>
                    <StarIcon className="size-6 text-white -rotate-12" />
                  </div>
                ))}
              </Fragment>
            ))}
            
            {/* Set kedua - duplikasi untuk seamless loop */}
            {[...new Array(8)].fill(0).map((_, idx) => (
              <Fragment key={`second-${idx}`}>
                {words.map(word => (
                  <div key={`${word}-duplicate-${idx}`} className="inline-flex gap-4 items-center whitespace-nowrap">
                    <span className="text-white uppercase font-extrabold text-sm">{word}</span>
                    <StarIcon className="size-6 text-white -rotate-12" />
                  </div>
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};