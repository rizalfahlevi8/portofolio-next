import StartIcon from "@/assets/icons/star.svg";
import { twMerge } from "tailwind-merge";

export const CardHeader = ({ title, description, className }: {
  title: string;
  description: string;
  className?: string;
}) => {
  return (
    <div className={twMerge("flex flex-col p-6 md:pt-8 md:pb-5  md:px-10", className)}>
      <div className="inline-flex items-center gap-2">
        <StartIcon className="size-9 text-gray-600" />
        <h3 className="font-serif text-3xl">{title}</h3>
      </div>
      <p className="text-sm lg:text-base max-w-xs text-black/60 mt-2">{description}</p>
    </div>
  );
}