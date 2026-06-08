import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "default" | "primary" | "ghost" | "outline" | "profit";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  default: "",
  primary: "primary",
  ghost: "ghost",
  outline: "outline",
  profit: "profit",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "sm",
  md: "",
  lg: "lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "default", size = "md", block = false, className, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn("btn", VARIANT_CLASS[variant], SIZE_CLASS[size], block && "block", className)}
      {...props}
    />
  );
});
