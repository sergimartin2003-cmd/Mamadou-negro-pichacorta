import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  pad?: boolean;
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { pad = false, hover = false, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn("card", pad && "pad", hover && "hover", className)}
      {...props}
    />
  );
});
