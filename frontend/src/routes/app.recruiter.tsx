import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell/AppShell";
import { useSession } from "@/lib/auth";

export const Route = createFileRoute("/app/recruiter")({
  component: RecruiterGate,
});

function RecruiterGate() {
  const session = useSession();
  const navigate = useNavigate();
  useEffect(() => {
    if (!session) {
      navigate({ to: "/auth/sign-in" });
    } else if (session.role !== "recruiter") {
      toast.error("Access Restricted", {
        description: "You don't have permission to access this workspace.",
      });
      navigate({ to: "/app/candidate/dashboard" });
    }
  }, [session, navigate]);
  if (!session || session.role !== "recruiter") return null;
  return (
    <AppShell role="recruiter">
      <Outlet />
    </AppShell>
  );
}