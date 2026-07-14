import React, { useRef } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export function Card({ children, className = "", ...rest }) {
  const ref = useRef(null);
  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className={`group relative rounded-2xl border border-white/[0.08] bg-[#0B0B0D]/90 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_20px_40px_-24px_rgba(0,0,0,0.8)] ${className}`}
      {...rest}
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "radial-gradient(180px circle at var(--mx,50%) var(--my,50%), rgba(226,135,67,0.12), transparent 70%)" }}
      />
      {children}
    </div>
  );
}

export function KPI({ label, value, delta, positive, icon: Icon, glow }) {
  return (
    <Card className="p-5 flex-1 min-w-[150px]">
      <div className="flex items-start justify-between">
        <span className="text-[11px] uppercase tracking-[0.14em] text-[#9AA0A8] font-medium">{label}</span>
        {Icon && <Icon size={15} className="text-[#5C6068]" strokeWidth={1.75} />}
      </div>
      <div className={`mt-2.5 text-[22px] font-semibold tracking-tight tabular-nums text-white ${glow ? "kpi-glow" : ""}`}>{value}</div>
      {delta != null && (
        <div className={`mt-1.5 flex items-center gap-1 text-[12px] font-medium ${positive ? "text-[#5FBE8A]" : "text-[#E2604D]"}`}>
          {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {delta}
        </div>
      )}
    </Card>
  );
}

export function SectionHeader({ eyebrow, title, action }) {
  return (
    <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
      <div>
        <div className="text-[11px] uppercase tracking-[0.16em] text-[#E28743] font-semibold mb-1">{eyebrow}</div>
        <h2 className="text-[22px] font-semibold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

export function SubHeading({ children }) {
  return <div className="text-[10.5px] uppercase tracking-[0.12em] text-[#9AA0A8] font-semibold mb-2.5 mt-1">{children}</div>;
}

export function Btn({ children, onClick, variant = "primary", className = "", type = "button", disabled }) {
  const base =
    "inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed";
  const styles = {
    primary:
      "bg-gradient-to-b from-[#EA9757] to-[#D97F3D] text-[#1A0F06] shadow-[0_1px_0_rgba(255,255,255,0.3)_inset,0_8px_20px_-8px_rgba(226,135,67,0.6)] hover:brightness-110",
    ghost: "bg-white/[0.06] text-white hover:bg-white/[0.12] border border-white/[0.1]",
    danger: "bg-[#E2604D]/10 text-[#E2604D] hover:bg-[#E2604D]/20 border border-[#E2604D]/20",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-[0.1em] text-[#9AA0A8] font-medium mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-[10.5px] text-[#6B7079] mt-1">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-lg bg-black border border-white/[0.12] px-3 py-2.5 text-[13.5px] text-white placeholder:text-[#6B7079] outline-none focus:border-[#E28743]/60 focus:ring-2 focus:ring-[#E28743]/15 transition-all tabular-nums";

/** A text input with a datalist of suggestions — always freely typable, never a locked dropdown. */
export function ComboInput({ value, onChange, options = [], placeholder, listId, className = "" }) {
  const id = listId || `combo-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <>
      <input
        list={id}
        className={`${inputCls} ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
      <datalist id={id}>
        {options.filter(Boolean).map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
    </>
  );
}

export function Row({ label, value, strong }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-[12px] ${strong ? "text-white font-medium" : "text-[#9AA0A8]"}`}>{label}</span>
      <span className={`text-[12.5px] tabular-nums ${strong ? "text-[#E28743] font-semibold text-[15px]" : "text-[#D7DADF]"}`}>{value}</span>
    </div>
  );
}

export function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/[0.1] py-14 text-center">
      <div className="text-[13px] text-[#6B7079]">{text}</div>
    </div>
  );
}

export function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-white/[0.1] text-white",
    good: "bg-[#5FBE8A]/15 text-[#5FBE8A]",
    warn: "bg-[#E2B34D]/15 text-[#E2B34D]",
    bad: "bg-[#E2604D]/15 text-[#E2604D]",
  };
  return <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${tones[tone]}`}>{children}</span>;
}

export function IconBtn({ icon: Icon, onClick, tone = "default", title }) {
  const cls = tone === "danger" ? "text-[#9AA0A8] hover:text-[#E2604D]" : "text-[#9AA0A8] hover:text-[#E28743]";
  return (
    <button onClick={onClick} title={title} className={`p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors ${cls}`}>
      <Icon size={14} />
    </button>
  );
}
