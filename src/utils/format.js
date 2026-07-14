export const fmtINR = (n) => "₹" + Math.round(n || 0).toLocaleString("en-IN");
export const fmtNum = (n, digits = 0) =>
  (n || 0).toLocaleString("en-IN", { maximumFractionDigits: digits });
export const uid = () => Math.random().toString(36).slice(2, 9);

export const dateKey = (t) => new Date(t).toISOString().slice(0, 10);
export const mondayKeyOf = (dk) => {
  const d = new Date(dk + "T00:00:00");
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d.toISOString().slice(0, 10);
};
export const monthKeyOf = (dk) => dk.slice(0, 7);
export const yearKeyOf = (dk) => dk.slice(0, 4);
export const dayLabel = (dk) =>
  new Date(dk + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
export const weekLabel = (mk) => {
  const s = new Date(mk + "T00:00:00");
  const e = new Date(s);
  e.setDate(e.getDate() + 6);
  return `${s.getDate()} – ${e.getDate()} ${e.toLocaleDateString("en-IN", { month: "short" })}`;
};
export const monthLabel = (mk) => new Date(mk + "-01").toLocaleDateString("en-IN", { month: "short", year: "numeric" });
export const yearLabel = (yk) => yk;

export const PERIODS = {
  day: { keyFn: (dk) => dk, label: dayLabel, limit: 60, name: "Day" },
  week: { keyFn: mondayKeyOf, label: weekLabel, limit: 16, name: "Week" },
  month: { keyFn: monthKeyOf, label: monthLabel, limit: 12, name: "Month" },
  sixmonth: { keyFn: monthKeyOf, label: monthLabel, limit: 6, name: "6 Months" },
  year: { keyFn: yearKeyOf, label: yearLabel, limit: 5, name: "Year" },
};

export function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Compute the full breakdown for a bill (used everywhere: Billing, Dashboard, Analytics, GST Report). */
export function computeBill(bill) {
  const items = bill.items || [];
  const itemsTotal = items.reduce((s, it) => s + (Number(it.amount) || 0), 0);
  const discount = Number(bill.discount) || 0;
  const taxable = Math.max(0, itemsTotal - discount);
  const cgstPercent = Number(bill.cgstPercent) || 0;
  const sgstPercent = Number(bill.sgstPercent) || 0;
  const cgstAmt = bill.gstEnabled ? (taxable * cgstPercent) / 100 : 0;
  const sgstAmt = bill.gstEnabled ? (taxable * sgstPercent) / 100 : 0;
  const gstAmt = cgstAmt + sgstAmt;
  const grand = taxable + gstAmt;
  return { itemsTotal, discount, taxable, cgstPercent, sgstPercent, cgstAmt, sgstAmt, gstAmt, grand };
}
