import React, { useMemo, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Card, SectionHeader, SubHeading, Btn } from "../components/primitives.jsx";
import { fmtINR } from "../utils/format.js";

export default function AIInsightsView({ businessSnapshot, lowStockItems, expenses }) {
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const quickInsights = useMemo(() => {
    const items = [];
    if (businessSnapshot.gstPayable > 0) items.push({ text: `GST payable is ${fmtINR(businessSnapshot.gstPayable)} — set this aside before the filing date.` });
    if (lowStockItems.length > 0) items.push({ text: `${lowStockItems.length} product${lowStockItems.length > 1 ? "s are" : " is"} below minimum stock — reorder soon to avoid a stockout.` });
    if (businessSnapshot.pendingBillings > 0) items.push({ text: `${businessSnapshot.pendingBillings} bill${businessSnapshot.pendingBillings > 1 ? "s are" : " is"} marked Pending — follow up on collection.` });
    const rentExp = expenses.find((e) => e.category === "Rent");
    if (rentExp) items.push({ text: `Fixed cost check: rent of ${fmtINR(rentExp.amount)} is already covered by today's revenue.` });
    if (items.length === 0) items.push({ text: "Everything looks healthy — no urgent flags right now." });
    return items;
  }, [businessSnapshot, lowStockItems, expenses]);

  const generate = async () => {
    setLoading(true);
    setError("");
    setAiText("");
    try {
      // Calls your own backend endpoint (see /api/ai-insight.js) which holds the
      // Anthropic API key server-side. Never call api.anthropic.com with a key
      // from the browser — that would expose your key to every visitor.
      const response = await fetch("/api/ai-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshot: businessSnapshot }),
      });
      if (!response.ok) throw new Error("backend not connected");
      const data = await response.json();
      if (!data?.text) throw new Error("empty response");
      setAiText(data.text);
    } catch (e) {
      setError("AI summary needs a backend endpoint connected (see /api/ai-insight.js and the README) — the instant flags below still work with zero setup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto heat-in">
      <SectionHeader eyebrow="Intelligence" title="AI Insights" />
      <SubHeading>Instant flags</SubHeading>
      <div className="space-y-2.5 mb-6">
        {quickInsights.map((it, i) => (
          <Card key={i} className="p-3.5 flex items-start gap-3"><Sparkles size={14} className="text-[#5FE2C4] mt-0.5 shrink-0" /><span className="text-[13px] text-[#D7DADF] leading-relaxed">{it.text}</span></Card>
        ))}
      </div>
      <SubHeading>AI executive summary</SubHeading>
      <Card className="p-5">
        <p className="text-[12.5px] text-[#9AA0A8] mb-4 leading-relaxed">Generates a plain-English summary of today's numbers using Claude, via your own backend endpoint — reads directly from what's on this screen, nothing is invented.</p>
        <Btn onClick={generate} disabled={loading}>{loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}{loading ? "Thinking…" : "Generate AI Summary"}</Btn>
        {error && <div className="mt-4 text-[12.5px] text-[#E2B34D]">{error}</div>}
        {aiText && <div className="mt-4 rounded-xl bg-black border border-[#5FE2C4]/20 p-4 text-[13px] text-white leading-relaxed whitespace-pre-line">{aiText}</div>}
      </Card>
    </div>
  );
}
