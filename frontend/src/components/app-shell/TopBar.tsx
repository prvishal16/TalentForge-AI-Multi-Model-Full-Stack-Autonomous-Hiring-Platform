import { useEffect, useState } from "react";
import { ArrowLeft, Bell, LogOut, Moon, Search, Settings, Sun, UserRound } from "lucide-react";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { CandidateAvatar } from "@/components/talent/CandidateAvatar";
import { useCommandPalette } from "./CommandPalette";
import { signOut as authSignOut, useSession } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopBar() {
  const { open } = useCommandPalette();
  const router = useRouter();
  const navigate = useNavigate();
  const [dark, setDark] = useState(true);
  const session = useSession();
  const name = session?.name ?? "Guest";
  const email = session?.email ?? "guest@talentforge.ai";
  const initials = session?.initials ?? "G";
  const roleLabel =
    session?.role === "recruiter"
      ? `Lead Recruiter · ${session.workspace}`
      : session?.role === "candidate"
        ? `Candidate · ${session.workspace}`
        : "Guest session";

  useEffect(() => {
    const stored = window.localStorage.getItem("talentforge-theme");
    const shouldDark = stored ? stored === "dark" : document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", shouldDark);
    setDark(shouldDark);
  }, []);

  function toggleTheme() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("talentforge-theme", next ? "dark" : "light");
    setDark(next);
    toast.success(next ? "Dark mode enabled" : "Light mode enabled", {
      description: "Your workspace theme updated instantly.",
    });
  }

  async function signOut() {
    authSignOut();
    toast.success("Signed out", { description: "Your session has ended safely." });
    await navigate({ to: "/auth/sign-in" });
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b hairline bg-background/40 px-4 backdrop-blur-xl md:px-8">
      <div className="flex flex-1 items-center gap-2">
        <button
          onClick={() => router.history.back()}
          aria-label="Go back"
          className="grid size-9 shrink-0 place-items-center rounded-full border hairline surface-1 text-muted-foreground transition-colors hover:hairline-strong hover:surface-2 hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
        </button>
        <button
          onClick={open}
          className="group flex w-full max-w-md items-center gap-3 rounded-full border hairline surface-1 px-4 py-2 text-left text-sm text-muted-foreground transition-colors hover:hairline-strong hover:surface-2 hover:text-foreground"
        >
          <Search className="size-4 shrink-0" />
          <span className="flex-1 truncate">Search candidates, jobs, or ask AI…</span>
          <kbd className="hidden shrink-0 items-center gap-0.5 rounded border hairline surface-1 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={toggleTheme}
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          className="grid size-9 place-items-center rounded-full border hairline surface-1 text-muted-foreground transition-colors hover:hairline-strong hover:surface-2 hover:text-foreground"
        >
          {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
        <button
          onClick={() => toast.info("You're all caught up.", { description: "No new notifications in the last 24h." })}
          aria-label="Notifications"
          className="relative grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:surface-1 hover:text-foreground"
        >
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-aurora-cyan ring-2 ring-background" />
        </button>
        <div className="hidden text-right sm:block">
          <p className="text-xs font-medium text-foreground">{name}</p>
          <p className="text-[10px] text-muted-foreground">{roleLabel}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Open profile menu"
              className="rounded-full ring-offset-background transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora-cyan focus-visible:ring-offset-2"
            >
              <CandidateAvatar initials={initials} tint="from-aurora-violet to-aurora-cyan" size={36} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 hairline bg-background/95 p-2 shadow-2xl backdrop-blur-xl">
            <DropdownMenuLabel className="px-3 py-2">
              <p className="text-sm text-foreground">{name}</p>
              <p className="text-xs font-normal text-muted-foreground">{email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="surface-3" />
            <DropdownMenuItem asChild className="cursor-pointer rounded-lg px-3 py-2">
              <Link to="/app/profile">
                <UserRound className="size-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer rounded-lg px-3 py-2">
              <Link to="/app/settings">
                <Settings className="size-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer rounded-lg px-3 py-2">
              <Link to="/app/notifications">
                <Bell className="size-4" /> Notifications
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="surface-3" />
            <DropdownMenuItem onClick={signOut} className="cursor-pointer rounded-lg px-3 py-2 text-destructive focus:text-destructive">
              <LogOut className="size-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}