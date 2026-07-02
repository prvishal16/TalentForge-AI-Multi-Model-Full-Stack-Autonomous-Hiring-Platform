import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Resume } from "@/lib/resume/types";
import { emptyResume } from "@/lib/resume/types";

type ResumeStore = {
  resume: Resume | null;
  updatedAt: number;
  setResume: (r: Resume) => void;
  clearResume: () => void;
  update: (updater: (r: Resume) => void) => void;
};

// Shallow structural clone (safe for our plain-JSON Resume shape)
function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set, get) => ({
      resume: null,
      updatedAt: 0,
      setResume: (r) => set({ resume: clone(r), updatedAt: Date.now() }),
      clearResume: () => set({ resume: null, updatedAt: Date.now() }),
      update: (updater) => {
        const current = get().resume ?? emptyResume();
        const next = clone(current);
        updater(next);
        set({ resume: next, updatedAt: Date.now() });
      },
    }),
    {
      name: "talentforge.resume.v1",
      // Guard against SSR / no-localStorage envs.
      storage: {
        getItem: (name) => {
          if (typeof window === "undefined") return null;
          const s = window.localStorage.getItem(name);
          return s ? JSON.parse(s) : null;
        },
        setItem: (name, value) => {
          if (typeof window === "undefined") return;
          window.localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          if (typeof window === "undefined") return;
          window.localStorage.removeItem(name);
        },
      },
    },
  ),
);