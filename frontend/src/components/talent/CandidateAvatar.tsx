import { cn } from "@/lib/utils";

export function CandidateAvatar({
  initials,
  tint = "from-violet-500 to-cyan-500",
  size = 40,
  className,
}: {
  initials: string;
  tint?: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative grid shrink-0 place-items-center rounded-full font-medium text-white/95 ring-1 ring-white/10",
        `bg-gradient-to-br ${tint}`,
        className,
      )}
      style={{ width: size, height: size, fontSize: size / 2.8 }}
    >
      {initials}
    </div>
  );
}