import React, { useState } from "react";
import { Plus, Trash2, Pencil, X, Wallet } from "lucide-react";
import { Card, SectionHeader, SubHeading, Btn, Field, inputCls, IconBtn, EmptyState } from "../components/primitives.jsx";
import { fmtINR, uid } from "../utils/format.js";
import { EXPENSE_CATEGORIES } from "../utils/constants.js";

const EMPTY_EXPENSE = { category: "Rent", itemName: "", qty: "", unitPrice: "", amount: "", note: "" };

export default function ExpensesView({ expenses, addExpense, updateExpense, removeExpense }) {
  const [form, setForm] = useState(EMPTY_EXPENSE);
  const [editingId, setEditingId] = useState(null);

  const onQtyPrice = (patch) => {
    const next = { ...form, ...patch };
    if (next.qty && next.unitPrice) next.amount = String(Number(next.qty) * Number(next.unitPrice));
    setForm(next);
  };
  const startEdit = (e) => { setEditingId(e.id); setForm({ category: e.category, itemName: e.itemName || "", qty: e.qty || "", unitPrice: e.unitPrice || "", amount: e.amount, note: e.note || "" }); };
  const cancelEdit = () => { setEditingId(null); setForm(EMPTY_EXPENSE); };
  const submit = () => {
    if (!form.amount) return;
    const payload = { category: form.category, itemName: form.itemName, qty: form.qty ? parseFloat(form.qty) : "", unitPrice: form.unitPrice ? parseFloat(form.unitPrice) : "", amount: parseFloat(form.amount), note: form.note };
    if (editingId) { updateExpense(editingId, payload); cancelEdit(); }
    else { addExpense({ id: uid(), ...payload, time: Date.now() }); setForm(EMPTY_EXPENSE); }
  };
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="max-w-[1200px] mx-auto heat-in">
      <SectionHeader eyebrow="Cash Out" title="Expenses" action={<div className="text-[13px] text-[#9AA0A8]">Total: <span className="text-white font-semibold">{fmtINR(total)}</span></div>} />
      <Card className="p-5 mb-5">
        <div className="text-[13px] font-medium text-[#D7DADF] mb-3 flex items-center gap-2">{editingId ? <Pencil size={14} className="text-[#E2604D]" /> : <Plus size={14} className="text-[#E2604D]" />}{editingId ? "Edit Expense" : "Add Expense"}</div>
        <SubHeading>What was it for</SubHeading>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          <input className={inputCls} placeholder="Item name (e.g. Bulb)" value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} />
          <input type="number" className={inputCls} placeholder="Qty" value={form.qty} onChange={(e) => onQtyPrice({ qty: e.target.value })} />
          <input type="number" className={inputCls} placeholder="Unit price" value={form.unitPrice} onChange={(e) => onQtyPrice({ unitPrice: e.target.value })} />
        </div>
        <SubHeading>Total & note</SubHeading>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <input type="number" className={inputCls} placeholder="Amount (auto-fills from qty × price)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <input className={inputCls} placeholder="Note (optional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          <div className="flex gap-2"><Btn onClick={submit} className="justify-center flex-1">{editingId ? <Pencil size={14} /> : <Plus size={14} />}{editingId ? "Update" : "Add"}</Btn>{editingId && <Btn variant="ghost" onClick={cancelEdit}><X size={14} /></Btn>}</div>
        </div>
      </Card>
      <div className="space-y-2.5">
        {expenses.map((e) => (
          <Card key={e.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#E2604D]/10 border border-[#E2604D]/20 flex items-center justify-center"><Wallet size={14} className="text-[#E2604D]" /></div>
              <div><div className="text-[13px] font-medium">{e.category}{e.itemName ? ` · ${e.itemName}${e.qty ? ` × ${e.qty}` : ""}` : ""}</div><div className="text-[11px] text-[#9AA0A8]">{e.note || new Date(e.time).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</div></div>
            </div>
            <div className="flex items-center gap-2.5"><span className="text-[14px] font-semibold tabular-nums text-[#E2604D]">−{fmtINR(e.amount)}</span><IconBtn icon={Pencil} onClick={() => startEdit(e)} /><IconBtn icon={Trash2} tone="danger" onClick={() => removeExpense(e.id, e.category)} /></div>
          </Card>
        ))}
        {expenses.length === 0 && <EmptyState text="No expenses logged yet." />}
      </div>
    </div>
  );
}
