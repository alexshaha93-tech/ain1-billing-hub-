import React from "react";
import { Card, SectionHeader, EmptyState } from "../components/primitives.jsx";
import { fmtINR } from "../utils/format.js";

export default function CustomersView({ customers }) {
  return (
    <div className="max-w-[1200px] mx-auto heat-in">
      <SectionHeader eyebrow="Relationships" title="Customers" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {customers.map((c) => (
          <Card key={c.name} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E28743]/30 to-[#E28743]/5 border border-[#E28743]/20 flex items-center justify-center text-[13px] font-semibold text-[#E28743] shrink-0">
                {c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </div>
              <div className="min-w-0">
                <div className="text-[13.5px] font-medium truncate">{c.name}</div>
                <div className="text-[11px] text-[#9AA0A8] truncate">{c.orders} order{c.orders > 1 ? "s" : ""}</div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[14px] font-semibold tabular-nums">{fmtINR(c.total)}</div>
              <div className="text-[10.5px] text-[#6B7079]">lifetime value</div>
            </div>
          </Card>
        ))}
        {customers.length === 0 && <EmptyState text="Customers appear automatically as soon as you save a bill." />}
      </div>
    </div>
  );
}
