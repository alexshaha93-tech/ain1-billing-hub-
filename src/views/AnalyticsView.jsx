import React, { useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Users, Package, UserCircle2, Percent, Wallet, ShoppingCart } from "lucide-react";
import { Card, SectionHeader, SubHeading, Row, EmptyState } from "../components/primitives.jsx";
import { fmtINR, PERIODS } from "../utils/format.js";

export default function AnalyticsView({ dailyIndex, sortedDateKeys }) {
  const [period, setPeriod] = useState("day");
  const [selectedKey, setSelectedKey] = useState(null);
  const cfg = PERIODS[period];

  const buckets = useMemo(() => {
    const map = {};
    sortedDateKeys.forEach((dk) => {
      const d = dailyIndex[dk];
      const bk = cfg.keyFn(dk);
      if (!map[bk])
        map[bk] = {
          key: bk, revenue: 0, gst: 0, expenseTotal: 0, purchaseTotal: 0,
          billingsCount: 0, purchasesCount: 0, staffBreakdown: {}, customersServed: new Set(), stockMoved: {},
        };
      const b = map[bk];
      b.revenue += d.revenue;
      b.gst += d.gst;
      b.expenseTotal += d.expenseTotal;
      b.purchaseTotal += d.purchaseTotal;
      b.billingsCount += d.billings.length;
      b.purchasesCount += d.purchases.length;
      Object.entries(d.staffBreakdown).forEach(([name, v]) => {
        b.staffBreakdown[name] = b.staffBreakdown[name] || { count: 0, total: 0 };
        b.staffBreakdown[name].count += v.count;
        b.staffBreakdown[name].total += v.total;
      });
      d.customersServed.forEach((c) => b.customersServed.add(c));
      Object.entries(d.stockMoved).forEach(([name, qty]) => { b.stockMoved[name] = (b.stockMoved[name] || 0) + qty; });
    });
    return Object.values(map).sort((a, b) => (a.key > b.key ? 1 : -1)).slice(-cfg.limit);
  }, [dailyIndex, sortedDateKeys, cfg]);

  const chartData = buckets.map((b) => ({ key: b.key, label: cfg.label(b.key), revenue: Math.round(b.revenue), profit: Math.round(b.revenue - b.expenseTotal - b.purchaseTotal) }));
  const selected = buckets.find((b) => b.key === selectedKey) || buckets[buckets.length - 1];

  return (
    <div className="max-w-[1200px] mx-auto heat-in">
      <SectionHeader
        eyebrow="Deep Dive"
        title="Analytics"
        action={
          <div className="flex gap-1.5 bg-white/[0.06] border border-white/[0.08] rounded-xl p-1">
            {Object.entries(PERIODS).map(([id, c]) => (
              <button key={id} onClick={() => { setPeriod(id); setSelectedKey(null); }} className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${period === id ? "bg-[#E28743] text-black" : "text-[#D7DADF] hover:text-white"}`}>{c.name}</button>
            ))}
          </div>
        }
      />

      <Card className="p-5 mb-5">
        <span className="text-[13px] font-medium text-[#D7DADF] mb-4 block">Revenue vs Profit — click a bar for full breakdown</span>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} onClick={(e) => { if (e?.activePayload?.[0]) setSelectedKey(e.activePayload[0].payload.key); }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="label" stroke="#6B7079" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#6B7079" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
            <Tooltip contentStyle={{ background: "#0B0B0D", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }} formatter={(v) => fmtINR(v)} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="revenue" fill="#E28743" radius={[5, 5, 0, 0]} cursor="pointer" />
            <Bar dataKey="profit" fill="#5FBE8A" radius={[5, 5, 0, 0]} cursor="pointer" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {!selected && <EmptyState text="No data yet for this period." />}

      {selected && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-5">
            <SubHeading>{cfg.label(selected.key)} — full calculation</SubHeading>
            <div className="space-y-1.5">
              <Row label="Revenue (billing incl. GST)" value={fmtINR(selected.revenue)} />
              <Row label="GST collected" value={fmtINR(selected.gst)} />
              <Row label="Purchases" value={"− " + fmtINR(selected.purchaseTotal)} />
              <Row label="Expenses" value={"− " + fmtINR(selected.expenseTotal)} />
              <div className="h-px bg-white/[0.08] my-1.5" />
              <Row label="Net profit" value={fmtINR(selected.revenue - selected.purchaseTotal - selected.expenseTotal)} strong />
              <div className="h-px bg-white/[0.08] my-1.5" />
              <Row label="Bills raised" value={selected.billingsCount} />
              <Row label="Purchases made" value={selected.purchasesCount} />
              <Row label="Customers served" value={selected.customersServed.size} />
            </div>
          </Card>

          <Card className="p-5">
            <SubHeading className="flex items-center gap-2"><UserCircle2 size={13} className="inline mr-1" />Staff performance — who billed what</SubHeading>
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {Object.entries(selected.staffBreakdown).sort((a, b) => b[1].total - a[1].total).map(([name, v]) => (
                <Row key={name} label={`${name} — ${v.count} bill${v.count > 1 ? "s" : ""}`} value={fmtINR(v.total)} />
              ))}
              {Object.keys(selected.staffBreakdown).length === 0 && <div className="text-[12px] text-[#6B7079]">No billing in this period.</div>}
            </div>
          </Card>

          <Card className="p-5">
            <SubHeading>Stock moved — quantity sold by product</SubHeading>
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {Object.entries(selected.stockMoved).sort((a, b) => b[1] - a[1]).map(([name, qty]) => (
                <Row key={name} label={name} value={qty.toLocaleString("en-IN")} />
              ))}
              {Object.keys(selected.stockMoved).length === 0 && <div className="text-[12px] text-[#6B7079]">No stock movement in this period.</div>}
            </div>
          </Card>

          <Card className="p-5">
            <SubHeading>Customers served</SubHeading>
            <div className="flex flex-wrap gap-1.5 max-h-[220px] overflow-y-auto pr-1">
              {[...selected.customersServed].map((c) => (
                <span key={c} className="text-[11.5px] px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-[#D7DADF]">{c}</span>
              ))}
              {selected.customersServed.size === 0 && <div className="text-[12px] text-[#6B7079]">No customers in this period.</div>}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
