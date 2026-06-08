import { Button, type ButtonProps } from "@/components/ui";

export interface SubmitButtonProps extends Omit<ButtonProps, "type"> {
  pending: boolean;
  label: string;
  pendingLabel?: string;
}

export function SubmitButton({
  pending,
  label,
  pendingLabel = "Working…",
  disabled,
  ...props
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      variant="primary"
      size="lg"
      block
      disabled={pending || disabled}
      style={{ opacity: pending ? 0.85 : 1 }}
      {...props}
    >
      {pending ? pendingLabel : label}
    </Button>
  );
}
