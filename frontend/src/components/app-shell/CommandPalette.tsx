import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  KanbanSquare,
  CalendarDays,
  BarChart3,
  Sparkles,
  FileText,
  Send,
  Compass,
  Search,
  Wand2,
} from "lucide-react";

interface Ctx {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}
const CmdCtx = createContext<Ctx | null>(null);

export function useCommandPalette() {
  const ctx = useContext(CmdCtx);
  if (!ctx) throw new Error("CommandPaletteProvider missing");
  return ctx;
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const navigate = useNavigate();

  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (to: string) => {
    close();
    navigate({ to });
  };

  const value = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);

  return (
    <CmdCtx.Provider value={value}>
      {children}
      <CommandDialog open={isOpen} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command, name, or role…" />
        <CommandList>
          <CommandEmpty>No matches.</CommandEmpty>
          <CommandGroup heading="AI Actions">
            <CommandItem onSelect={() => go("/app/recruiter/ai-assistant")}>
              <Sparkles className="size-4 text-aurora-cyan" />
              Ask TalentForge AI
            </CommandItem>
            <CommandItem onSelect={() => go("/app/recruiter/candidates")}>
              <Wand2 className="size-4 text-aurora-violet" />
              Rank candidates for a role
            </CommandItem>
            <CommandItem onSelect={() => go("/app/candidate/resume")}>
              <Search className="size-4" />
              Score my resume
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Recruiter">
            <CommandItem onSelect={() => go("/app/recruiter/dashboard")}>
              <LayoutDashboard className="size-4" /> Dashboard
            </CommandItem>
            <CommandItem onSelect={() => go("/app/recruiter/jobs")}>
              <Briefcase className="size-4" /> Jobs
            </CommandItem>
            <CommandItem onSelect={() => go("/app/recruiter/candidates")}>
              <Users className="size-4" /> Candidates
            </CommandItem>
            <CommandItem onSelect={() => go("/app/recruiter/pipeline")}>
              <KanbanSquare className="size-4" /> Pipeline
            </CommandItem>
            <CommandItem onSelect={() => go("/app/recruiter/interviews")}>
              <CalendarDays className="size-4" /> Interviews
            </CommandItem>
            <CommandItem onSelect={() => go("/app/recruiter/analytics")}>
              <BarChart3 className="size-4" /> Analytics
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Candidate">
            <CommandItem onSelect={() => go("/app/candidate/dashboard")}>
              <LayoutDashboard className="size-4" /> Overview
            </CommandItem>
            <CommandItem onSelect={() => go("/app/candidate/resume")}>
              <FileText className="size-4" /> My Resume
            </CommandItem>
            <CommandItem onSelect={() => go("/app/candidate/jobs")}>
              <Search className="size-4" /> Browse Jobs
            </CommandItem>
            <CommandItem onSelect={() => go("/app/candidate/applications")}>
              <Send className="size-4" /> Applications
            </CommandItem>
            <CommandItem onSelect={() => go("/app/candidate/career")}>
              <Compass className="size-4" /> Career AI
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </CmdCtx.Provider>
  );
}