import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { GlassCard } from "@/components/talent/GlassCard";
import { AIThinking } from "@/components/talent/AIThinking";
import { extractSkills, inferLevel, inferRole, inferYears } from "@/lib/interview/skills";
import type { Analysis } from "@/lib/interview/types";

const STAGES = [
  "Parsing resume structure",
  "Extracting skills & technologies",
  "Detecting experience level",
  "Parsing job description",
  "Matching resume to JD",
  "Building candidate profile",
];

export function AnalysisRunner({
  resumeText,
  jdText,
  onDone,
}: {
  resumeText: string;
  jdText: string;
  onDone: (a: Analysis) => void;
}) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (let i = 0; i < STAGES.length; i++) {
        await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
        if (cancelled) return;
        setStage(i + 1);
      }
      const combined = `${resumeText}\n\n${jdText}`;
      const resumeSkills = extractSkills(resumeText);
      const jdSkills = extractSkills(jdText);
      const skills = Array.from(new Set([...resumeSkills, ...jdSkills]));
      const missing = jdSkills.filter((s) => !resumeSkills.includes(s));
      const analysis: Analysis = {
        skills: skills.length ? skills : extractSkills(combined),
        missingSkills: missing,
        role: inferRole(jdText),
        level: inferLevel(jdText),
        years: inferYears(resumeText),
        resumeChars: resumeText.length,
        jdChars: jdText.length,
      };
      await new Promise((r) => setTimeout(r, 400));
      if (!cancelled) onDone(analysis);
    })();
    return () => { cancelled = true; };
  }, [resumeText, jdText, onDone]);

  return (
    <GlassCard className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">AI is analyzing your fit</h3>
          <p className="text-xs text-muted-foreground">On-device — nothing leaves your browser.</p>
        </div>
        <AIThinking label="Working" />
      </div>
      <ol className="space-y-2">
        {STAGES.map((s, i) => {
          const done = i < stage;
          const active = i === stage;
          return (
            <motion.li
              key={s}
              initial={{ opacity: 0.4, x: -6 }}
              animate={{ opacity: done || active ? 1 : 0.4, x: 0 }}
              className="flex items-center gap-3 rounded-lg border hairline surface-1 px-3 py-2.5"
            >
              <span className="grid size-6 place-items-center rounded-full ring-1 ring-white/10">
                {done ? (
                  <Check className="size-3.5 text-aurora-emerald" />
                ) : active ? (
                  <motion.span
                    className="size-2 rounded-full bg-aurora-cyan"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.1, repeat: Infinity }}
                  />
                ) : (
                  <span className="size-2 rounded-full bg-white/20" />
                )}
              </span>
              <span className="text-sm text-foreground">{s}</span>
              {done && <span className="ml-auto font-mono text-[10px] text-aurora-emerald">done</span>}
              {active && <span className="ml-auto font-mono text-[10px] text-aurora-cyan">running…</span>}
            </motion.li>
          );
        })}
      </ol>
    </GlassCard>
  );
}