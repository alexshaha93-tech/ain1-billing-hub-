import React, { useState } from "react";
import { Sparkles, Clock } from "lucide-react";
import { Card, SectionHeader, EmptyState } from "../components/primitives.jsx";
import { fmtINR } from "../utils/format.js";
import { CATEGORY_COLORS } from "../utils/constants.js";

export default function TimelineView({ timeline, todayRevenue, todayGST, todayExpense }) {
  const [filter, setFilter] = useState("All");
  const cats = ["All", ...Object.keys(CATEGORY_COLORS)];
  const filtered = filter === "All" ? timeline : timeline.filter((e) => e.category === filter);
  const summary = `Today your business logged ${timeline.length} action${timeline.length !== 1 ? "s" : ""}, generated ${fmtINR(todayRevenue)} in revenue and ${fmtINR(todayGST)} in GST, with ${fmtINR(todayExpense)} in expenses recorded.`;
  return (
    <div className="max-w-[900px] mx-auto heat-in">
      <SectionHeader eyebrow="Memory" title="Business Timeline" />
      <Card className="p-4 mb-5 flex items-start gap-3 border-[#E28743]/25"><Sparkles size={16} className="text-[#E28743] mt-0.5 shrink-0" /><p className="text-[13px] text-[#D7DADF] leading-relaxed">{summary}</p></Card>
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
        {cats.map((c) => (
          <button key={c} onClick={() => setFilter(c)} className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all ${filter === c ? "bg-[#E28743]/15 border-[#E28743]/40 text-[#E28743]" : "bg-white/[0.06] border-white/[0.1] text-[#D7DADF] hover:text-white"}`}>{c}</button>
        ))}
      </div>
      <div className="relative pl-6">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-[#E28743]/50 via-white/[0.1] to-transparent" />
        <div className="space-y-4">
          {filtered.map((e) => (
            <div key={e.id} className="relative heat-in">
              <span className="absolute -left-[19px] top-1.5 w-2.5 h-2.5 rounded-full" style={{ background: CATEGORY_COLORS[e.category] || "#8CA3B8", boxShadow: `0 0 8px ${CATEGORY_COLORS[e.category] || "#8CA3B8"}` }} />
              <Card className="p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-white">{e.title}</div>
                    <div className="text-[11px] text-[#9AA0A8] mt-0.5 flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: `${CATEGORY_COLORS[e.category] || "#8CA3B8"}25`, color: CATEGORY_COLORS[e.category] || "#8CA3B8" }}>{e.category}</span>
                      <Clock size={10} />{new Date(e.time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  {e.meta?.amount != null && <div className="text-[13px] font-semibold tabular-nums shrink-0">{fmtINR(e.meta.amount)}</div>}
                </div>
              </Card>
            </div>
          ))}
          {filtered.length === 0 && <EmptyState text="No activity in this category yet — try Billing, Purchase or Stock." />}
        </div>
      </div>
    </div>
  );
}
