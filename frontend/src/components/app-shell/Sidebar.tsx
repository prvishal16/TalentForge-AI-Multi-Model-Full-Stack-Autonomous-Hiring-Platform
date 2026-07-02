import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  KanbanSquare,
  CalendarDays,
  BarChart3,
  Sparkles,
  FileText,
  PencilRuler,
  Search,
  Send,
  Compass,
  Bell,
  Settings,
  Mic,
} from "lucide-react";
import { Logo } from "@/components/talent/Logo";
import { cn } from "@/lib/utils";
import { RoleSwitcher } from "./RoleSwitcher";

type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };

const recruiterNav: NavItem[] = [
  { to: "/app/recruiter/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/recruiter/jobs", label: "Jobs", icon: Briefcase },
  { to: "/app/recruiter/candidates", label: "Candidates", icon: Users },
  { to: "/app/recruiter/pipeline", label: "Pipeline", icon: KanbanSquare },
  { to: "/app/recruiter/interviews", label: "Interviews", icon: CalendarDays },
  { to: "/app/recruiter/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/recruiter/ai-assistant", label: "AI Assistant", icon: Sparkles },
];

const candidateNav: NavItem[] = [
  { to: "/app/candidate/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/app/candidate/resume", label: "My Resume", icon: FileText },
  { to: "/app/candidate/resume-builder", label: "Resume Builder", icon: PencilRuler },
  { to: "/app/candidate/jobs", label: "Browse Jobs", icon: Search },
  { to: "/app/candidate/applications", label: "Applications", icon: Send },
  { to: "/app/candidate/interviews", label: "Interviews", icon: CalendarDays },
  { to: "/app/candidate/interview-studio", label: "InterviewIQ AI", icon: Mic },
  { to: "/app/candidate/career", label: "Career AI", icon: Compass },
];

const footerNav: NavItem[] = [
  { to: "/app/notifications", label: "Notifications", icon: Bell },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

export function AppSidebar({ role }: { role: "recruiter" | "candidate" }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const primaryNav = role === "recruiter" ? recruiterNav : candidateNav;
  const groupLabel = role === "recruiter" ? "Recruit" : "Career";

  return (
    <aside className="sticky top-0 z-30 hidden h-screen w-64 shrink-0 flex-col border-r hairline bg-black/20 backdrop-blur-xl lg:flex">
      <div className="p-5">
        <Link to="/" className="block">
          <Logo />
        </Link>
      </div>

      <div className="px-3">
        <RoleSwitcher current={role} />
      </div>

      <nav className="mt-6 flex-1 space-y-6 overflow-y-auto px-3 pb-4">
        <NavGroup label={groupLabel} items={primaryNav} pathname={pathname} />
        <NavGroup label="Workspace" items={footerNav} pathname={pathname} />
      </nav>

      <div className="px-4 pb-5">
        <div className="rounded-xl border hairline bg-gradient-to-br from-aurora-violet/10 via-white/[0.02] to-aurora-cyan/10 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">Plan Usage</span>
            <span className="font-mono text-[10px] text-aurora-cyan">76%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full surface-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "76%" }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-aurora-violet to-aurora-cyan"
            />
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">
            76% of hiring credits used this cycle
          </p>
        </div>
      </div>
    </aside>
  );
}

function NavGroup({
  label,
  items,
  pathname,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <div>
      <p className="mb-2 px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
        {label}
      </p>
      <div className="space-y-0.5">
        {items.map((item) => {
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "surface-2 text-foreground ring-1 ring-white/10"
                  : "text-muted-foreground hover:surface-1 hover:text-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active-bar"
                  className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-aurora-violet to-aurora-cyan shadow-[0_0_10px_var(--color-aurora-cyan)]"
                />
              )}
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}