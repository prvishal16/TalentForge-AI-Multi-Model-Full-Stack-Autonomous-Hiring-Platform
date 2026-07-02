import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Save, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell/AppShell";
import { CandidateAvatar } from "@/components/talent/CandidateAvatar";
import { GlassCard } from "@/components/talent/GlassCard";
import { PageHeader } from "@/components/talent/PageHeader";
import { AuroraButton } from "@/components/talent/AuroraButton";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "Profile · TalentForge AI" }] }),
  component: () => (
    <AppShell role="recruiter">
      <Profile />
    </AppShell>
  ),
});

function Profile() {
  const [name, setName] = useState("Alex Rivera");
  const [email, setEmail] = useState("alex@northwind.co");
  const [title, setTitle] = useState("Lead Recruiter · Northwind");
  const invalidEmail = !/^\S+@\S+\.\S+$/.test(email);

  function saveProfile() {
    if (name.trim().length < 2 || invalidEmail || title.trim().length < 2) {
      toast.error("Check your profile details", {
        description: "Name, valid email, and role title are required.",
      });
      return;
    }
    toast.success("Profile updated", { description: "Your workspace identity is now up to date." });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader eyebrow="Account" title="Profile" description="Manage your workspace identity, role, and visible contact details." />

      <GlassCard className="overflow-hidden !p-0">
        <div className="border-b hairline bg-gradient-to-r from-aurora-violet/15 via-white/[0.03] to-aurora-cyan/15 p-6">
          <div className="flex flex-wrap items-center gap-4">
            <CandidateAvatar initials="AR" tint="from-aurora-violet to-aurora-cyan" size={64} />
            <div>
              <h2 className="text-xl font-semibold text-foreground">{name || "Your profile"}</h2>
              <p className="text-sm text-muted-foreground">{title || "Add your role"}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground"><UserRound className="size-3.5" /> Full name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border hairline surface-1 px-3 py-2 text-sm text-foreground outline-none focus:border-aurora-cyan/40" />
            {name.trim().length > 0 && name.trim().length < 2 && <p className="mt-1 text-[11px] text-destructive">Enter at least 2 characters.</p>}
          </label>
          <label className="block">
            <span className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="size-3.5" /> Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border hairline surface-1 px-3 py-2 text-sm text-foreground outline-none focus:border-aurora-cyan/40" />
            {email && invalidEmail && <p className="mt-1 text-[11px] text-destructive">Enter a valid email address.</p>}
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="size-3.5" /> Role title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border hairline surface-1 px-3 py-2 text-sm text-foreground outline-none focus:border-aurora-cyan/40" />
          </label>
          <div className="sm:col-span-2">
            <AuroraButton onClick={saveProfile}>
              <Save className="size-4" /> Save profile
            </AuroraButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}