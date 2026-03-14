import clsx from "clsx";

interface AdPlaceholderProps {
  slot: "sidebar" | "in-content" | "banner";
  className?: string;
}

export default function AdPlaceholder({ slot, className }: AdPlaceholderProps) {
  // Only render the placeholder box in development so it doesn't show on the live site
  if (process.env.NODE_ENV === "production") return null;

  return (
    <div
      className={clsx(
        "border border-dashed border-border rounded-xl flex items-center justify-center text-xs text-muted-foreground bg-muted/30",
        slot === "sidebar" && "w-full h-[250px]",
        slot === "in-content" && "w-full h-[90px] my-6",
        slot === "banner" && "w-full h-[90px]",
        className
      )}
      data-ad-slot={slot}
    >
      <span className="opacity-50">Ad · {slot}</span>
    </div>
  );
}
