import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Menu, Search, X, CheckCircle2,
} from "lucide-react";

import NavContent from "./components/Nav.jsx";
import { usePersistentState } from "./utils/persist.js";
import { uid, dateKey, computeBill, fmtINR } from "./utils/format.js";
import { seedStaff, seedStock, seedSuppliersDirectory, generateHistory } from "./data/seed.js";

import DashboardView from "./views/DashboardView.jsx";
import AnalyticsView from "./views/AnalyticsView.jsx";
import BillingView from "./views/BillingView.jsx";
import PurchaseView from "./views/PurchaseView.jsx";
import StockView from "./views/StockView.jsx";
import GSTReportView from "./views/GSTReportView.jsx";
import ExpensesView from "./views/ExpensesView.jsx";
import DrawingView from "./views/DrawingView.jsx";
import CustomersView from "./views/CustomersView.jsx";
import SuppliersView from "./views/SuppliersView.jsx";
import StaffView from "./views/StaffView.jsx";
import TimelineView from "./views/TimelineView.jsx";
import AIInsightsView from "./views/AIInsightsView.jsx";
import SettingsView from "./views/SettingsView.jsx";
import OwnerPanelView from "./views/OwnerPanelView.jsx";

const SEED = generateHistory();

const DEFAULT_SETTINGS = {
  businessName: "Ain1 Forge",
  ownerName: "Ravi Chandavarkar",
  gstin: "27ABCPT1234F1Z5",
  invoicePrefix: "BILL-",
  defaultGstPercent: 18,
  tagline: "Steel & Hardware Trading",
};

export default function App() {
  const [active, setActive] = useState("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [settings, setSettings] = usePersistentState("settings", DEFAULT_SETTINGS);
  const [staff, setStaff] = usePersistentState("staff", seedStaff);
  const [billings, setBillings] = usePersistentState("billings", SEED.billings);
  const [purchases, setPurchases] = usePersistentState("purchases", SEED.purchases);
  const [stock, setStock] = usePersistentState("stock", seedStock);
  const [expenses, setExpenses] = usePersistentState("expenses", SEED.expenses);
  const [drawings, setDrawings] = usePersistentState("drawings", SEED.drawings);
  const [suppliersDirectory, setSuppliersDirectory] = usePersistentState("suppliersDirectory", seedSuppliersDirectory);
  const [partnerSplit, setPartnerSplit] = usePersistentState("partnerSplit", { ownerPercent: 60, partnerPercent: 40 });
  const [timeline, setTimeline] = usePersistentState("timeline", []);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const logEvent = useCallback(
    (category, title, meta = {}) => setTimeline((t) => [{ id: uid(), category, title, meta, time: Date.now() }, ...t].slice(0, 400)),
    [setTimeline]
  );
  const notify = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);
  const navigate = (id) => {
    setActive(id);
    setMobileNavOpen(false);
  };

  const decrementStockForItems = (items) => {
    if (!items || items.length === 0) return;
    setStock((s) =>
      s.map((it) => {
        const match = items.find((li) => li.name && li.name.toLowerCase() === it.name.toLowerCase());
        if (!match) return it;
        return { ...it, qty: Math.max(0, it.qty - (Number(match.qty) || 0)) };
      })
    );
  };
  const incrementStockForPurchase = (p) => {
    if (!p.product) return;
    setStock((s) => {
      const existing = s.find((it) => it.name.toLowerCase() === p.product.toLowerCase());
      if (existing) {
        return s.map((it) => (it.id === existing.id ? { ...it, qty: it.qty + (Number(p.qty) || 0) } : it));
      }
      return s;
    });
  };

  /* ---- Billing (unified, GST built-in, multi line-item) ---- */
  const addBilling = (b) => {
    setBillings((s) => [b, ...s]);
    decrementStockForItems(b.items);
    const c = computeBill(b);
    logEvent("Billing", `${b.billNo} — ${b.customer} (${b.mode})`, { amount: c.grand });
    notify(`${b.billNo} saved by ${b.staff} — ${fmtINR(c.grand)}`);
  };
  const updateBilling = (id, patch) => {
    setBillings((s) => s.map((b) => (b.id === id ? { ...b, ...patch } : b)));
    logEvent("Billing", `Bill updated — ${patch.billNo || id}`);
    notify("Bill updated");
  };
  const removeBilling = (id, billNo) => {
    setBillings((s) => s.filter((x) => x.id !== id));
    logEvent("Billing", `${billNo} deleted`);
  };
  const toggleBillingStatus = (id) =>
    setBillings((s) => s.map((b) => (b.id === id ? { ...b, status: b.status === "Paid" ? "Pending" : "Paid" } : b)));

  /* ---- Purchase ---- */
  const addPurchase = (p) => {
    setPurchases((s) => [p, ...s]);
    incrementStockForPurchase(p);
    logEvent("Purchase", `Purchase ${p.invoice} — ${p.supplier}`, { amount: p.qty * p.rate });
    notify(`Purchase ${p.invoice} recorded — stock updated`);
  };
  const updatePurchase = (id, patch) => {
    setPurchases((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    notify("Purchase updated");
    logEvent("Purchase", `Purchase ${patch.invoice || id} updated`);
  };
  const removePurchase = (id, inv) => {
    setPurchases((s) => s.filter((x) => x.id !== id));
    logEvent("Purchase", `Purchase ${inv} deleted`);
  };
  const togglePurchaseStatus = (id) =>
    setPurchases((s) => s.map((p) => (p.id === id ? { ...p, status: p.status === "Paid" ? "Pending" : "Paid" } : p)));

  /* ---- Stock ---- */
  const addStock = (item) => {
    setStock((s) => [item, ...s]);
    logEvent("Stock", `Product added — ${item.name}`);
    notify(`${item.name} added to stock`);
  };
  const updateStockItem = (id, patch) => setStock((s) => s.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const adjustStock = (id, delta) => {
    setStock((s) => s.map((it) => (it.id === id ? { ...it, qty: Math.max(0, it.qty + delta) } : it)));
    const it = stock.find((x) => x.id === id);
    if (it) {
      logEvent("Stock", `${delta > 0 ? "Stock increased" : "Stock decreased"} — ${it.name}`, { amount: Math.abs(delta) });
      if (it.qty + delta <= it.min) logEvent("Stock", `Low stock alert — ${it.name}`);
    }
  };
  const removeStock = (id, name) => {
    setStock((s) => s.filter((x) => x.id !== id));
    logEvent("Stock", `Product removed — ${name}`);
  };

  /* ---- Expenses ---- */
  const addExpense = (e) => {
    setExpenses((s) => [e, ...s]);
    logEvent("Expense", `${e.category}${e.itemName ? " — " + e.itemName : ""}`, { amount: e.amount });
    notify(`Expense of ${fmtINR(e.amount)} added`);
  };
  const updateExpense = (id, patch) => {
    setExpenses((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    notify("Expense updated");
  };
  const removeExpense = (id, cat) => {
    setExpenses((s) => s.filter((x) => x.id !== id));
    logEvent("Expense", `${cat} expense deleted`);
  };

  /* ---- Drawing ---- */
  const addDrawing = (d) => {
    setDrawings((s) => [d, ...s]);
    logEvent("Drawing", `${d.person} · ${d.type} — ${fmtINR(d.amount)}`, { amount: d.amount });
    notify(`${d.type} recorded for ${d.person}`);
  };
  const updateDrawing = (id, patch) => {
    setDrawings((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    notify("Entry updated");
  };
  const removeDrawing = (id, type) => {
    setDrawings((s) => s.filter((x) => x.id !== id));
    logEvent("Drawing", `${type} entry deleted`);
  };

  /* ---- Staff / Suppliers ---- */
  const addStaff = (s) => {
    setStaff((st) => [s, ...st]);
    logEvent("System", `Staff added — ${s.name} (${s.role})`);
    notify(`${s.name} added to team`);
  };
  const removeStaff = (id, name) => {
    setStaff((st) => st.filter((x) => x.id !== id));
    logEvent("System", `Staff removed — ${name}`);
  };
  const addSupplierContact = (s) => {
    setSuppliersDirectory((d) => [s, ...d]);
    notify(`${s.name} added to directory`);
  };
  const removeSupplierContact = (id) => setSuppliersDirectory((d) => d.filter((x) => x.id !== id));

  /* ---- derived: today ---- */
  const isToday = (t) => Date.now() - t < 86400000;
  const todayBillings = useMemo(() => billings.filter((b) => isToday(b.time)), [billings]);
  const todayRevenue = useMemo(() => todayBillings.reduce((s, b) => s + computeBill(b).grand, 0), [todayBillings]);
  const todayGST = useMemo(() => todayBillings.reduce((s, b) => s + computeBill(b).gstAmt, 0), [todayBillings]);
  const todayExpense = useMemo(() => expenses.filter((e) => isToday(e.time)).reduce((s, e) => s + e.amount, 0), [expenses]);
  const stockValue = useMemo(() => stock.reduce((s, i) => s + i.qty * i.rate, 0), [stock]);
  const lowStockItems = useMemo(() => stock.filter((i) => i.qty <= i.min), [stock]);
  const pendingBillingCount = useMemo(() => billings.filter((b) => b.status === "Pending").length, [billings]);
  const outputGST = useMemo(() => billings.reduce((s, b) => s + computeBill(b).gstAmt, 0), [billings]);
  const inputGST = useMemo(() => purchases.reduce((s, p) => s + (p.qty * p.rate * (Number(p.gstPercent) || 0)) / 100, 0), [purchases]);

  const chartData = useMemo(() => {
    const days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dk = dateKey(d.getTime());
      const dayTotal = billings.filter((b) => dateKey(b.time) === dk).reduce((s, b) => s + computeBill(b).grand, 0);
      return { day: d.toLocaleDateString("en-IN", { weekday: "short" }), revenue: Math.round(dayTotal) };
    });
    return days;
  }, [billings]);

  /* ---- date-wise index for Analytics (staff / customer / stock drill-down) ---- */
  const dailyIndex = useMemo(() => {
    const map = {};
    const ensure = (k) => {
      if (!map[k])
        map[k] = {
          date: k, billings: [], expenses: [], purchases: [], drawings: [],
          revenue: 0, gst: 0, expenseTotal: 0, purchaseTotal: 0, modeBreakdown: {},
          staffBreakdown: {}, customersServed: new Set(), stockMoved: {},
        };
      return map[k];
    };
    billings.forEach((b) => {
      const d = ensure(dateKey(b.time));
      const c = computeBill(b);
      d.billings.push(b);
      d.revenue += c.grand;
      d.gst += c.gstAmt;
      d.modeBreakdown[b.mode] = (d.modeBreakdown[b.mode] || 0) + c.grand;
      d.staffBreakdown[b.staff] = d.staffBreakdown[b.staff] || { count: 0, total: 0 };
      d.staffBreakdown[b.staff].count += 1;
      d.staffBreakdown[b.staff].total += c.grand;
      if (b.customer) d.customersServed.add(b.customer);
      (b.items || []).forEach((it) => {
        const key = `${it.name}${it.size ? " " + it.size : ""}`;
        d.stockMoved[key] = (d.stockMoved[key] || 0) + (Number(it.qty) || 0);
      });
    });
    expenses.forEach((e) => {
      const d = ensure(dateKey(e.time));
      d.expenses.push(e);
      d.expenseTotal += e.amount;
    });
    purchases.forEach((p) => {
      const d = ensure(dateKey(p.time));
      d.purchases.push(p);
      d.purchaseTotal += p.qty * p.rate;
    });
    drawings.forEach((dr) => {
      const d = ensure(dateKey(dr.time));
      d.drawings.push(dr);
    });
    return map;
  }, [billings, expenses, purchases, drawings]);
  const sortedDateKeys = useMemo(() => Object.keys(dailyIndex).sort(), [dailyIndex]);

  const customers = useMemo(() => {
    const map = new Map();
    billings.forEach((b) => {
      if (!b.customer) return;
      const c = computeBill(b);
      const prev = map.get(b.customer) || { name: b.customer, total: 0, orders: 0 };
      prev.total += c.grand;
      prev.orders += 1;
      map.set(b.customer, prev);
    });
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [billings]);

  const supplierLedger = useMemo(() => {
    const map = new Map();
    purchases.forEach((p) => {
      const prev = map.get(p.supplier) || { name: p.supplier, total: 0, pending: 0, orders: 0 };
      const amt = p.qty * p.rate;
      prev.total += amt;
      if (p.status === "Pending") prev.pending += amt;
      prev.orders += 1;
      map.set(p.supplier, prev);
    });
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [purchases]);

  const capitalBalance = useMemo(
    () => drawings.reduce((s, d) => s + (d.type === "Capital Added" || d.type === "Return" ? d.amount : -d.amount), 0),
    [drawings]
  );

  /* ---- overall P&L + partner split (all-time) ---- */
  const totalRevenueAll = useMemo(() => billings.reduce((s, b) => s + computeBill(b).grand, 0), [billings]);
  const totalPurchaseAll = useMemo(() => purchases.reduce((s, p) => s + p.qty * p.rate, 0), [purchases]);
  const totalExpenseAll = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const grossProfit = totalRevenueAll - totalPurchaseAll - totalExpenseAll;
  const ownerShare = grossProfit * (partnerSplit.ownerPercent / 100);
  const partnerShare = grossProfit * (partnerSplit.partnerPercent / 100);
  const ownerDrawn = drawings
    .filter((d) => d.person === "Owner")
    .reduce((s, d) => s + (d.type === "Drawing" ? d.amount : d.type === "Return" ? -d.amount : 0), 0);
  const partnerDrawn = drawings
    .filter((d) => d.person === "Partner")
    .reduce((s, d) => s + (d.type === "Drawing" ? d.amount : d.type === "Return" ? -d.amount : 0), 0);

  const businessSnapshot = useMemo(
    () => ({
      todayRevenue: Math.round(todayRevenue),
      todayGST: Math.round(todayGST),
      todayExpense: Math.round(todayExpense),
      stockValue: Math.round(stockValue),
      lowStockCount: lowStockItems.length,
      pendingBillings: pendingBillingCount,
      gstPayable: Math.round(Math.max(0, outputGST - inputGST)),
      capitalBalance: Math.round(capitalBalance),
      grossProfitAllTime: Math.round(grossProfit),
    }),
    [todayRevenue, todayGST, todayExpense, stockValue, lowStockItems, pendingBillingCount, outputGST, inputGST, capitalBalance, grossProfit]
  );

  const viewProps = {
    settings, setSettings,
    staff, addStaff, removeStaff, stock,
    billings, addBilling, updateBilling, removeBilling, toggleBillingStatus,
    purchases, addPurchase, updatePurchase, removePurchase, togglePurchaseStatus,
    addStock, adjustStock, removeStock, updateStockItem,
    expenses, addExpense, updateExpense, removeExpense,
    drawings, addDrawing, updateDrawing, removeDrawing, capitalBalance,
    customers, supplierLedger, suppliersDirectory, addSupplierContact, removeSupplierContact,
    timeline, todayRevenue, todayGST, todayExpense, todayBillings,
    lowStockItems, pendingBillingCount, outputGST, inputGST, stockValue, chartData,
    businessSnapshot, dailyIndex, sortedDateKeys,
    partnerSplit, setPartnerSplit, grossProfit, ownerShare, partnerShare, ownerDrawn, partnerDrawn,
  };

  return (
    <div className="min-h-screen w-full bg-black text-white flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      <aside className="hidden lg:flex w-[252px] shrink-0 border-r border-white/[0.08] bg-[#050506] flex-col">
        <NavContent
          active={active}
          onNavigate={navigate}
          lowStockCount={lowStockItems.length}
          pendingBillingCount={pendingBillingCount}
          businessName={settings.businessName}
          ownerName={settings.ownerName}
        />
      </aside>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/85" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] bg-[#050506] border-r border-white/[0.1] flex flex-col shadow-2xl slide-in">
            <button
              onClick={() => setMobileNavOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/[0.1] flex items-center justify-center text-white z-10"
            >
              <X size={16} />
            </button>
            <NavContent
              active={active}
              onNavigate={navigate}
              lowStockCount={lowStockItems.length}
              pendingBillingCount={pendingBillingCount}
              businessName={settings.businessName}
              ownerName={settings.ownerName}
            />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 shrink-0 border-b border-white/[0.08] flex items-center gap-4 px-4 lg:px-8 bg-black/90 backdrop-blur-xl sticky top-0 z-20">
          <button
            className="lg:hidden text-white w-9 h-9 rounded-lg bg-white/[0.1] flex items-center justify-center shrink-0"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu size={18} />
          </button>
          <div className="hidden sm:flex items-center gap-2 flex-1 max-w-sm rounded-xl bg-white/[0.06] border border-white/[0.08] px-3 py-2">
            <Search size={14} className="text-[#6B7079]" />
            <input placeholder="Search bills, stock, customers…" className="bg-transparent outline-none text-[13px] placeholder:text-[#6B7079] w-full text-white" />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-[12px] text-[#9AA0A8]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5FBE8A]" style={{ boxShadow: "0 0 6px #5FBE8A" }} />
              Live · Local + Supabase ready
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-grain">
          {active === "dashboard" && <DashboardView {...viewProps} />}
          {active === "analytics" && <AnalyticsView {...viewProps} />}
          {active === "billing" && <BillingView {...viewProps} />}
          {active === "purchase" && <PurchaseView {...viewProps} />}
          {active === "stock" && <StockView {...viewProps} />}
          {active === "gst" && <GSTReportView {...viewProps} />}
          {active === "expenses" && <ExpensesView {...viewProps} />}
          {active === "drawing" && <DrawingView {...viewProps} />}
          {active === "customers" && <CustomersView {...viewProps} />}
          {active === "suppliers" && <SuppliersView {...viewProps} />}
          {active === "staff" && <StaffView {...viewProps} />}
          {active === "timeline" && <TimelineView {...viewProps} />}
          {active === "ai" && <AIInsightsView {...viewProps} />}
          {active === "ownerpanel" && <OwnerPanelView {...viewProps} />}
          {active === "settings" && <SettingsView {...viewProps} />}
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] heat-in">
          <div className="flex items-center gap-2 rounded-xl bg-[#0B0B0D] border border-[#E28743]/30 px-4 py-3 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.7)]">
            <CheckCircle2 size={16} className="text-[#E28743]" />
            <span className="text-[13px] text-white">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
