import React from "react";
import { Flame } from "lucide-react";
import { NAV_SECTIONS } from "../utils/constants.js";
import { Badge } from "./primitives.jsx";

export default function NavContent({ active, onNavigate, lowStockCount, pendingBillingCount, businessName, ownerName }) {
  return (
    <>
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-white/[0.08] shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#EA9757] to-[#B45E23] flex items-center justify-center shadow-[0_0_16px_rgba(226,135,67,0.4)]">
          <Flame size={14} className="text-black" strokeWidth={2.5} />
        </div>
        <div>
          <div className="text-[13.5px] font-semibold tracking-tight leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {businessName}
          </div>
          <div className="text-[10px] text-[#9AA0A8] leading-none mt-0.5">Business OS</div>
        </div>
      </div>
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        {NAV_SECTIONS.map((sec) => (
          <div key={sec.section} className="mb-4 last:mb-0">
            <div className="px-3 mb-1.5 text-[10px] uppercase tracking-[0.14em] text-[#9AA0A8] font-bold">{sec.section}</div>
            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`relative w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                      isActive ? "text-white bg-white/[0.1]" : "text-[#D7DADF] hover:text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    {isActive && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2.5px] rounded-full bg-gradient-to-b from-[#EA9757] to-[#B45E23]"
                        style={{ boxShadow: "0 0 8px rgba(226,135,67,0.7)" }}
                      />
                    )}
                    <Icon size={16} strokeWidth={1.75} />
                    {item.label}
                    {item.id === "stock" && lowStockCount > 0 && (
                      <span className="ml-auto">
                        <Badge tone="bad">{lowStockCount}</Badge>
                      </span>
                    )}
                    {item.id === "billing" && pendingBillingCount > 0 && (
                      <span className="ml-auto">
                        <Badge tone="warn">{pendingBillingCount}</Badge>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-white/[0.08] shrink-0">
        <div className="rounded-xl bg-white/[0.06] border border-white/[0.08] p-3">
          <div className="text-[11px] text-[#9AA0A8] mb-1">Owner Control Center</div>
          <div className="text-[12.5px] font-medium text-white">{ownerName}</div>
        </div>
      </div>
    </>
  );
}
