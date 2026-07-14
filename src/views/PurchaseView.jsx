import React, { useMemo, useState } from "react";
import { Plus, Trash2, X, Pencil, ShoppingCart, ChevronDown, ChevronUp } from "lucide-react";
import { Card, SectionHeader, SubHeading, Btn, Field, inputCls, ComboInput, Row, Badge, IconBtn, EmptyState } from "../components/primitives.jsx";
import { fmtINR, uid } from "../utils/format.js";
import { UNIT_OPTIONS } from "../utils/constants.js";

const EMPTY_PURCHASE = { supplier: "", gstin: "", product: "", size: "", qty: "", unit: "kg", rate: "", gstPercent: 18, status: "Pending" };

export default function PurchaseView({ purchases, addPurchase, updatePurchase, removePurchase, togglePurchaseStatus, stock, supplierLedger }) {
  const [form, setForm] = useState(EMPTY_PURCHASE);
  const [editingId, setEditingId] = useState(null);
  const stockNames = useMemo(() => [...new Set(stock.map((s) => s.name))], [stock]);
  const supplierNames = useMemo(() => supplierLedger.map((s) => s.name), [supplierLedger]);

  const startEdit = (p) => { setEditingId(p.id); setForm({ supplier: p.supplier, gstin: p.gstin || "", product: p.product, size: p.size || "", qty: p.qty, unit: p.unit || "kg", rate: p.rate, gstPercent: p.gstPercent ?? 18, status: p.status }); };
  const cancelEdit = () => { setEditingId(null); setForm(EMPTY_PURCHASE); };

  const taxable = (Number(form.qty) || 0) * (Number(form.rate) || 0);
  const gstAmt = (taxable * (Number(form.gstPercent) || 0)) / 100;

  const submit = () => {
    if (!form.supplier || !form.product || !form.qty || !form.rate) return;
    const payload = { ...form, qty: parseFloat(form.qty), rate: parseFloat(form.rate), gstPercent: parseFloat(form.gstPercent) || 0 };
    if (editingId) { updatePurchase(editingId, payload); cancelEdit(); }
    else { addPurchase({ id: uid(), invoice: `PUR-${300 + purchases.length}`, ...payload, time: Date.now() }); setForm(EMPTY_PURCHASE); }
  };

  return (
    <div className="max-w-[1200px] mx-auto heat-in">
      <SectionHeader eyebrow="Purchase Module" title="Supplier Purchases" />
      <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-5">
        <Card className="p-5 h-fit">
          <div className="text-[13px] font-medium text-[#D7DADF] mb-4 flex items-center gap-2">{editingId ? <Pencil size={14} className="text-[#8CA3B8]" /> : <Plus size={14} className="text-[#8CA3B8]" />}{editingId ? "Edit Purchase" : "New Purchase"}</div>
          <SubHeading>Supplier</SubHeading>
          <div className="space-y-3 mb-4">
            <Field label="Supplier name"><ComboInput value={form.supplier} onChange={(v) => setForm({ ...form, supplier: v })} options={supplierNames} placeholder="Type supplier name" listId="pur-supplier-list" /></Field>
            <Field label="GSTIN (optional)"><input className={inputCls} value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} /></Field>
          </div>
          <SubHeading>Goods purchased</SubHeading>
          <div className="space-y-3 mb-4">
            <Field label="Product name"><ComboInput value={form.product} onChange={(v) => setForm({ ...form, product: v })} options={stockNames} placeholder="e.g. SS Pipe" listId="pur-product-list" /></Field>
            <Field label="Size"><input className={inputCls} value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} placeholder='e.g. 2 inch, 40x40x5' /></Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Qty"><input type="number" className={inputCls} value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} /></Field>
              <Field label="Unit"><ComboInput value={form.unit} onChange={(v) => setForm({ ...form, unit: v })} options={UNIT_OPTIONS} listId="pur-unit-list" /></Field>
              <Field label="Rate/unit"><input type="number" className={inputCls} value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} /></Field>
            </div>
          </div>
          <SubHeading>GST & payment</SubHeading>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Field label="GST % (input credit)"><input type="number" className={inputCls} value={form.gstPercent} onChange={(e) => setForm({ ...form, gstPercent: e.target.value })} /></Field>
            <Field label="Status"><select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{["Pending", "Paid"].map((s) => <option key={s}>{s}</option>)}</select></Field>
          </div>
          <div className="rounded-xl bg-black border border-white/[0.1] p-3.5 space-y-1.5 mb-3">
            <Row label="Taxable value" value={fmtINR(taxable)} />
            <Row label={`GST (${form.gstPercent || 0}%)`} value={fmtINR(gstAmt)} />
            <div className="h-px bg-white/[0.08] my-1" />
            <Row label="Total payable" value={fmtINR(taxable + gstAmt)} strong />
          </div>
          <div className="flex gap-2"><Btn className="flex-1 justify-center" onClick={submit}>{editingId ? <Pencil size={14} /> : <Plus size={14} />}{editingId ? "Update" : "Record Purchase"}</Btn>{editingId && <Btn variant="ghost" onClick={cancelEdit}><X size={14} /></Btn>}</div>
        </Card>
        <div className="space-y-3">
          {purchases.map((p) => <PurchaseCard key={p.id} p={p} onEdit={() => startEdit(p)} onRemove={() => removePurchase(p.id, p.invoice)} onToggle={() => togglePurchaseStatus(p.id)} />)}
          {purchases.length === 0 && <EmptyState text="No purchases recorded yet." />}
        </div>
      </div>
    </div>
  );
}

function PurchaseCard({ p, onEdit, onRemove, onToggle }) {
  const [open, setOpen] = useState(false);
  const taxable = p.qty * p.rate;
  const gstAmt = (taxable * (Number(p.gstPercent) || 0)) / 100;
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#8CA3B8]/10 border border-[#8CA3B8]/20 flex items-center justify-center shrink-0"><ShoppingCart size={16} className="text-[#8CA3B8]" /></div>
          <div className="min-w-0">
            <div className="text-[13.5px] font-medium truncate">{p.invoice} · {p.supplier}</div>
            <div className="text-[11.5px] text-[#9AA0A8] truncate">{p.product}{p.size ? ` · ${p.size}` : ""} · {p.qty}{p.unit} @ {fmtINR(p.rate)}/{p.unit}</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 ml-auto">
          <button onClick={onToggle}><Badge tone={p.status === "Paid" ? "good" : "warn"}>{p.status}</Badge></button>
          <div className="text-[14.5px] font-semibold tabular-nums">{fmtINR(taxable + gstAmt)}</div>
          <IconBtn icon={open ? ChevronUp : ChevronDown} onClick={() => setOpen((o) => !o)} />
          <IconBtn icon={Pencil} onClick={onEdit} />
          <IconBtn icon={Trash2} tone="danger" onClick={onRemove} />
        </div>
      </div>
      {open && (
        <div className="mt-3 pt-3 border-t border-white/[0.08] rounded-lg bg-black/40 p-3 space-y-1.5">
          <Row label="Taxable value" value={fmtINR(taxable)} />
          <Row label={`GST (${p.gstPercent || 0}%)`} value={fmtINR(gstAmt)} />
          <div className="h-px bg-white/[0.08] my-1" />
          <Row label="Total payable" value={fmtINR(taxable + gstAmt)} strong />
        </div>
      )}
    </Card>
  );
}
