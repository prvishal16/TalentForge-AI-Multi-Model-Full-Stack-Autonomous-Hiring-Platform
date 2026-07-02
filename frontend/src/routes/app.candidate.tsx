import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell/AppShell";
import { useSession } from "@/lib/auth";

export const Route = createFileRoute("/app/candidate")({
  component: CandidateGate,
});

function CandidateGate() {
  const session = useSession();
  const navigate = useNavigate();
  useEffect(() => {
    if (!session) {
      navigate({ to: "/auth/sign-in" });
    } else if (session.role !== "candidate") {
      toast.error("Access Restricted", {
        description: "You don't have permission to access this workspace.",
      });
      navigate({ to: "/app/recruiter/dashboard" });
    }
  }, [session, navigate]);
  if (!session || session.role !== "candidate") return null;
  return (
    <AppShell role="candidate">
      <Outlet />
    </AppShell>
  );
}