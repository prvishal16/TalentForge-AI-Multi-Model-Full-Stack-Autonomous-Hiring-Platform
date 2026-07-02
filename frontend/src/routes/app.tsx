import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSession } from "@/lib/auth";

export const Route = createFileRoute("/app")({
  component: AppGate,
});

function AppGate() {
  const session = useSession();
  const navigate = useNavigate();
  useEffect(() => {
    if (!session) navigate({ to: "/auth/sign-in" });
  }, [session, navigate]);
  if (!session) return null;
  return <Outlet />;
}