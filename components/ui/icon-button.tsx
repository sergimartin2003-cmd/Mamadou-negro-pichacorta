import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "./icon";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  iconSize?: number;
  iconSw?: number;
  iconFill?: boolean;
  size?: "sm" | "md";
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, iconSize = 19, iconSw = 1.8, iconFill = false, size = "md", className, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn("th-iconbtn", size === "sm" && "sm", className)}
      {...props}
    >
      <Icon name={icon} size={iconSize} sw={iconSw} fill={iconFill} />
    </button>
  );
});
