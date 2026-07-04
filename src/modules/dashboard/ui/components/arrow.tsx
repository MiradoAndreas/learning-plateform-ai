import { cn } from "@/lib/utils";

type ArrowProps = {
  className?: string;
};

// todos: deplace it to another place later

export function Arrow({ className }: ArrowProps) {
  return (
    <div
      className={cn(
        "absolute h-2 w-2 rotate-45 border-t border-l bg-popover",
        className,
      )}
    />
  );
}
