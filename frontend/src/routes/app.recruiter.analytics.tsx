import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/talent/PageHeader";
import { GlassCard } from "@/components/talent/GlassCard";
import { KpiCard } from "@/components/talent/KpiCard";
import { funnel, hiringTrend, resumeScoreDistribution, skillDemand } from "@/mocks/data";

export const Route = createFileRoute("/app/recruiter/analytics")({
  head: () => ({ meta: [{ title: "Analytics · TalentForge AI" }] }),
  component: Analytics,
});

const COLORS = ["#c084fc", "#22d3ee", "#818cf8", "#34d399", "#fbbf24"];
const tooltipStyle = { background: "rgba(15,17,25,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12, color: "#fff" } as const;
const tooltipItemStyle = { color: "#fff" } as const;
const tooltipLabelStyle = { color: "#fff" } as const;

function Analytics() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader eyebrow="Insights" title="Hiring Analytics" description="Every metric, sliced by team, source, and rubric dimension." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard index={0} label="Applications · MTD" value={"1,284"} delta="+18%" trend="up" />
        <KpiCard index={1} label="Offer acceptance" value={"84%"} delta="+3pt" trend="up" />
        <KpiCard index={2} label="Interview → Offer" value={"16%"} delta="-1pt" trend="down" />
        <KpiCard index={3} label="Quality of hire" value={"4.6"} unit="/ 5" delta="+0.2" trend="up" accent />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <h3 className="mb-4 text-sm font-medium text-foreground">Application trends</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={hiringTrend}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="applications" fill="#c084fc" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="mb-4 text-sm font-medium text-foreground">Funnel conversion</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={funnel} dataKey="value" nameKey="stage" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {funnel.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="mb-4 text-sm font-medium text-foreground">Skill demand</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <RadarChart data={skillDemand}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="skill" stroke="rgba(255,255,255,0.5)" fontSize={11} />
                <Radar dataKey="demand" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.35} />
                <Tooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="mb-4 text-sm font-medium text-foreground">Resume score distribution</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={resumeScoreDistribution}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="bucket" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#34d399" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}