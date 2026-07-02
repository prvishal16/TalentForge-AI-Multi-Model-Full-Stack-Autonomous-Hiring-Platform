import { type ReactNode } from "react";
import { AuroraBackground } from "@/components/talent/AuroraBackground";
import { AppSidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { CommandPaletteProvider } from "./CommandPalette";
import { SiteFooter } from "@/components/talent/SiteFooter";
import { AIAssistantWidget } from "@/components/talent/AIAssistantWidget";

export function AppShell({
  role,
  children,
}: {
  role: "recruiter" | "candidate";
  children: ReactNode;
}) {
  return (
    <CommandPaletteProvider>
      <div className="relative flex min-h-screen w-full">
        <AuroraBackground />
        <AppSidebar role={role} />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
          <SiteFooter />
        </div>
        <AIAssistantWidget />
      </div>
    </CommandPaletteProvider>
  );
}