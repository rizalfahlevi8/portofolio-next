import { Skill } from "@/schema/skill-schema";
import React, { Fragment } from "react";
import { twMerge } from "tailwind-merge";

export const ToolboxItems = ({ items, className, itemsWrapperClassName }: {
    items: Skill[];
    className?: string;
    itemsWrapperClassName?: string;
}) => {
    return (
        <div className={twMerge("flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]", className)}>
            <div className={twMerge("flex flex-none py-0.5 gap-6 pr-6", itemsWrapperClassName)}>
                {[...new Array(6)].fill(0).map((_, index) => (
                    <Fragment key={index}>
                        {items.map(item => (
                            <div key={`${item.id}-${index}`} className="inline-flex items-center gap-4 py-2 px-3 outline outline-2 outline-black/10 rounded-lg whitespace-nowrap">
                                <i className={`${item.icon} text-base`}></i>
                                <span className="font-semibold">{item.name}</span>
                            </div>
                        ))}
                    </Fragment>
                ))}
            </div>
        </div>
    );
}