import { Briefcase, User2 } from "lucide-react";
import { useSession } from "@/lib/auth";

export function RoleSwitcher({ current }: { current: "recruiter" | "candidate" }) {
  const session = useSession();
  const Icon = current === "recruiter" ? Briefcase : User2;
  return (
    <div className="flex items-center gap-2 rounded-xl border hairline surface-1 px-3 py-2">
      <div className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-aurora-violet/25 to-aurora-cyan/15 text-foreground ring-1 ring-white/10">
        <Icon className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-medium capitalize text-foreground">
          {current} workspace
        </p>
        <p className="truncate text-[10px] text-muted-foreground">
          {session?.workspace ?? "TalentForge AI"}
        </p>
      </div>
    </div>
  );
}