import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Receipt, Percent, Wallet, Boxes, CircleDollarSign, AlertTriangle, ArrowUpRight } from "lucide-react";
import { Card, KPI, SectionHeader, Badge } from "../components/primitives.jsx";
import { fmtINR, computeBill } from "../utils/format.js";
import { CATEGORY_COLORS } from "../utils/constants.js";

export default function DashboardView(p) {
  return (
    <div className="max-w-[1200px] mx-auto heat-in">
      <SectionHeader
        eyebrow="Overview"
        title="Today's Command Center"
        action={
          <div className="text-[12px] text-[#9AA0A8]">
            Full history? Open <span className="text-[#E28743] font-medium">Analytics →</span>
          </div>
        }
      />
      <div className="flex flex-wrap gap-4 mb-6">
        <KPI label="Today's Revenue" value={fmtINR(p.todayRevenue)} delta="Billing (incl. GST)" positive icon={Receipt} glow />
        <KPI label="Today's GST" value={fmtINR(p.todayGST)} icon={Percent} />
        <KPI label="Today's Expense" value={fmtINR(p.todayExpense)} delta="Rent + Salary" positive={false} icon={Wallet} />
        <KPI label="Stock Value" value={fmtINR(p.stockValue)} icon={Boxes} />
        <KPI label="GST Payable" value={fmtINR(Math.max(0, p.outputGST - p.inputGST))} icon={CircleDollarSign} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] font-medium text-[#D7DADF]">Revenue — last 7 days</span>
            <span className="text-[11px] text-[#5FBE8A] flex items-center gap-1">
              <ArrowUpRight size={12} />
              live from Billing
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={p.chartData}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E28743" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#E28743" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="day" stroke="#6B7079" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#6B7079" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip contentStyle={{ background: "#0B0B0D", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }} formatter={(v) => fmtINR(v)} />
              <Area type="monotone" dataKey="revenue" stroke="#E28743" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] font-medium text-[#D7DADF]">Low Stock Alerts</span>
            <AlertTriangle size={14} className="text-[#E2B34D]" />
          </div>
          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {p.lowStockItems.length === 0 && <div className="text-[12.5px] text-[#6B7079] py-8 text-center">All stock levels healthy.</div>}
            {p.lowStockItems.map((it) => (
              <div key={it.id} className="flex items-center justify-between rounded-lg bg-[#E2B34D]/[0.08] border border-[#E2B34D]/20 px-3 py-2">
                <div>
                  <div className="text-[12.5px] font-medium text-white">{it.name}{it.size ? ` · ${it.size}` : ""}</div>
                  <div className="text-[11px] text-[#9AA0A8]">{it.qty} {it.unit} left · min {it.min}</div>
                </div>
                <Badge tone="warn">LOW</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Card className="p-5">
          <span className="text-[13px] font-medium text-[#D7DADF] mb-3 block">Recent Billing</span>
          <div className="space-y-1">
            {p.billings.slice(0, 5).map((b) => {
              const c = computeBill(b);
              return (
                <div key={b.id} className="flex items-center justify-between py-2 border-b border-white/[0.06] last:border-0">
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-medium truncate">{b.billNo} · {b.customer}</div>
                    <div className="text-[11px] text-[#6B7079]">{b.staff} · {b.mode}</div>
                  </div>
                  <div className="text-[13px] font-semibold tabular-nums shrink-0">{fmtINR(c.grand)}</div>
                </div>
              );
            })}
            {p.billings.length === 0 && <div className="text-[12.5px] text-[#6B7079] py-6 text-center">No bills yet.</div>}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-[13px] font-medium text-[#D7DADF] mb-3 block">Recent Purchases</span>
          <div className="space-y-1">
            {p.purchases.slice(0, 5).map((pu) => (
              <div key={pu.id} className="flex items-center justify-between py-2 border-b border-white/[0.06] last:border-0">
                <div className="min-w-0">
                  <div className="text-[12.5px] font-medium truncate">{pu.invoice} · {pu.supplier}</div>
                  <div className="text-[11px] text-[#6B7079]">{new Date(pu.time).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</div>
                </div>
                <div className="text-[13px] font-semibold tabular-nums shrink-0">{fmtINR(pu.qty * pu.rate)}</div>
              </div>
            ))}
            {p.purchases.length === 0 && <div className="text-[12.5px] text-[#6B7079] py-6 text-center">No purchases yet.</div>}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-[13px] font-medium text-[#D7DADF] mb-3 block">Live Activity</span>
          <div className="space-y-3">
            {p.timeline.slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-start gap-2.5">
                <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: CATEGORY_COLORS[e.category] || "#8CA3B8", boxShadow: `0 0 6px ${CATEGORY_COLORS[e.category] || "#8CA3B8"}` }} />
                <div className="min-w-0">
                  <div className="text-[12px] text-[#D7DADF] truncate">{e.title}</div>
                  <div className="text-[10.5px] text-[#6B7079]">{new Date(e.time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              </div>
            ))}
            {p.timeline.length === 0 && <div className="text-[12.5px] text-[#6B7079] py-6 text-center">Actions you take will appear here automatically.</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}
