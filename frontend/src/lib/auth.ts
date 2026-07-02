import { useEffect, useState } from "react";

export type Role = "recruiter" | "candidate";

export type Session = {
  role: Role;
  name: string;
  email: string;
  initials: string;
  workspace: string;
};

type Account = {
  email: string;
  password: string;
  role: Role;
  name: string;
  initials: string;
  workspace: string;
};

export const DEMO_ACCOUNTS: Record<Role, Account> = {
  recruiter: {
    email: "test@recruiter.com",
    password: "recruiter@123",
    role: "recruiter",
    name: "Alex Rivera",
    initials: "AR",
    workspace: "Northwind Talent",
  },
  candidate: {
    email: "test@candidate.com",
    password: "candidate@123",
    role: "candidate",
    name: "Jordan Lee",
    initials: "JL",
    workspace: "My Career",
  },
};

const KEY = "tf.session";
const EVENT = "tf-auth";

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function emit() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

export function signIn(email: string, password: string): Session | null {
  const e = email.trim().toLowerCase();
  const match = Object.values(DEMO_ACCOUNTS).find(
    (a) => a.email === e && a.password === password,
  );
  if (!match) return null;
  const session: Session = {
    role: match.role,
    name: match.name,
    email: match.email,
    initials: match.initials,
    workspace: match.workspace,
  };
  window.localStorage.setItem(KEY, JSON.stringify(session));
  emit();
  return session;
}

export function signInAs(role: Role): Session {
  const a = DEMO_ACCOUNTS[role];
  return signIn(a.email, a.password)!;
}

export function signOut() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  emit();
}

export function useSession(): Session | null {
  const [s, setS] = useState<Session | null>(() => getSession());
  useEffect(() => {
    const sync = () => setS(getSession());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return s;
}