import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  /** Icon size in rem-ish pixels via className on the img */
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  to?: string | false;
};

const SIZE = {
  sm: "size-7",
  md: "size-9",
  lg: "size-14",
} as const;

export function Logo({
  className,
  size = "md",
  showWordmark = true,
  to = "/",
}: LogoProps) {
  const body = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <img
        src="/logo.svg"
        alt=""
        className={cn(SIZE[size], "shrink-0 drop-shadow-[0_0_18px_rgba(107,92,245,0.35)]")}
        width={size === "lg" ? 56 : size === "sm" ? 28 : 36}
        height={size === "lg" ? 56 : size === "sm" ? 28 : 36}
      />
      {showWordmark ? (
        <span className="font-display text-xl tracking-tight text-fg sm:text-2xl">nexora</span>
      ) : null}
    </span>
  );

  if (to === false) return body;
  return (
    <Link to={to} className="inline-flex items-center hover:opacity-90 transition-opacity">
      {body}
    </Link>
  );
}
