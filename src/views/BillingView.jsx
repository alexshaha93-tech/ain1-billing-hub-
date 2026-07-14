import React, { useMemo, useState } from "react";
import { Plus, Trash2, X, Pencil, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { Card, SectionHeader, SubHeading, Btn, Field, inputCls, ComboInput, Row, Badge, IconBtn, EmptyState } from "../components/primitives.jsx";
import { fmtINR, uid, computeBill } from "../utils/format.js";
import { PAYMENT_MODES, UNIT_OPTIONS } from "../utils/constants.js";

function blankItem() {
  return { id: uid(), name: "", size: "", qty: "", unit: "kg", rate: "", amount: 0 };
}

function emptyForm(staffDefault, gstDefault) {
  return {
    customer: "",
    staff: staffDefault || "",
    mode: "Cash",
    status: "Paid",
    note: "",
    items: [blankItem()],
    discount: 0,
    gstEnabled: true,
    gstPercent: gstDefault || 18,
    cgstPercent: (gstDefault || 18) / 2,
    sgstPercent: (gstDefault || 18) / 2,
  };
}

export default function BillingView({ billings, addBilling, updateBilling, removeBilling, toggleBillingStatus, staff, stock, customers, settings }) {
  const [form, setForm] = useState(() => emptyForm(staff[0]?.name, settings.defaultGstPercent));
  const [editingId, setEditingId] = useState(null);

  const stockNames = useMemo(() => [...new Set(stock.map((s) => s.name))], [stock]);
  const staffNames = useMemo(() => staff.map((s) => s.name), [staff]);
  const customerNames = useMemo(() => customers.map((c) => c.name), [customers]);

  const updateItem = (id, patch) => {
    setForm((f) => ({
      ...f,
      items: f.items.map((it) => {
        if (it.id !== id) return it;
        const next = { ...it, ...patch };
        // auto-fill rate from matching stock product when a name is chosen and rate is still empty
        if (patch.name) {
          const match = stock.find((s) => s.name.toLowerCase() === patch.name.toLowerCase());
          if (match && !next.rate) { next.rate = match.rate; next.unit = next.unit || match.unit; if (!next.size) next.size = match.size || ""; }
        }
        const qty = Number(next.qty) || 0;
        const rate = Number(next.rate) || 0;
        next.amount = qty * rate;
        return next;
      }),
    }));
  };
  const addItemRow = () => setForm((f) => ({ ...f, items: [...f.items, blankItem()] }));
  const removeItemRow = (id) => setForm((f) => ({ ...f, items: f.items.length > 1 ? f.items.filter((it) => it.id !== id) : f.items }));

  const setGstPercent = (v) => setForm((f) => ({ ...f, gstPercent: v, cgstPercent: v === "" ? "" : Number(v) / 2, sgstPercent: v === "" ? "" : Number(v) / 2 }));

  const preview = useMemo(() => computeBill(form), [form]);

  const startEdit = (b) => {
    setEditingId(b.id);
    setForm({
      customer: b.customer, staff: b.staff, mode: b.mode, status: b.status, note: b.note || "",
      items: b.items.map((it) => ({ ...it })), discount: b.discount || 0,
      gstEnabled: b.gstEnabled, gstPercent: b.gstPercent, cgstPercent: b.cgstPercent, sgstPercent: b.sgstPercent,
    });
  };
  const cancelEdit = () => { setEditingId(null); setForm(emptyForm(staff[0]?.name, settings.defaultGstPercent)); };

  const validItems = form.items.filter((it) => it.name && Number(it.qty) > 0);

  const submit = () => {
    if (validItems.length === 0 || !form.staff) return;
    const payload = { ...form, items: validItems, customer: form.customer || "Walk-in Customer" };
    if (editingId) {
      updateBilling(editingId, payload);
      cancelEdit();
    } else {
      addBilling({ id: uid(), billNo: `${settings.invoicePrefix || "BILL-"}${5000 + billings.length}`, time: Date.now(), ...payload });
      setForm(emptyForm(form.staff, settings.defaultGstPercent));
    }
  };

  const totalToday = billings.filter((b) => Date.now() - b.time < 86400000).reduce((s, b) => s + computeBill(b).grand, 0);

  return (
    <div className="max-w-[1300px] mx-auto heat-in">
      <SectionHeader
        eyebrow="Counter"
        title="Billing"
        action={<div className="text-[13px] text-[#9AA0A8]">Today: <span className="text-white font-semibold">{fmtINR(totalToday)}</span></div>}
      />
      <div className="grid grid-cols-1 xl:grid-cols-[440px_1fr] gap-5">
        <Card className="p-5 h-fit">
          <div className="text-[13px] font-medium text-[#D7DADF] mb-4 flex items-center gap-2">
            {editingId ? <Pencil size={14} className="text-[#5FA8E2]" /> : <Plus size={14} className="text-[#5FA8E2]" />}
            {editingId ? "Edit Bill" : "New Bill"}
          </div>

          <SubHeading>Customer & staff</SubHeading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <Field label="Customer name"><ComboInput value={form.customer} onChange={(v) => setForm({ ...form, customer: v })} options={customerNames} placeholder="Walk-in Customer" listId="customer-list" /></Field>
            <Field label="Staff / billed by">{staff.length === 0 ? <div className="text-[12px] text-[#E2B34D] py-2">Add staff first (Staff section).</div> : <ComboInput value={form.staff} onChange={(v) => setForm({ ...form, staff: v })} options={staffNames} placeholder="Type staff name" listId="staff-list" />}</Field>
          </div>

          <SubHeading>Products in this bill — add as many categories as needed</SubHeading>
          <div className="space-y-3 mb-3">
            {form.items.map((it, idx) => (
              <div key={it.id} className="rounded-xl border border-white/[0.1] bg-black/40 p-3 space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] uppercase tracking-wide text-[#6B7079] font-semibold">Item {idx + 1}</span>
                  {form.items.length > 1 && <IconBtn icon={Trash2} tone="danger" onClick={() => removeItemRow(it.id)} />}
                </div>
                <ComboInput value={it.name} onChange={(v) => updateItem(it.id, { name: v })} options={stockNames} placeholder="Product name (type freely)" listId={`prod-list-${it.id}`} />
                <div className="grid grid-cols-2 gap-2">
                  <input className={inputCls} placeholder="Size (e.g. 2 inch, 40x40x5)" value={it.size} onChange={(e) => updateItem(it.id, { size: e.target.value })} />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" className={inputCls} placeholder="Qty" value={it.qty} onChange={(e) => updateItem(it.id, { qty: e.target.value })} />
                    <ComboInput value={it.unit} onChange={(v) => updateItem(it.id, { unit: v })} options={UNIT_OPTIONS} placeholder="unit" listId={`unit-list-${it.id}`} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 items-end">
                  <Field label="Rate per unit"><input type="number" className={inputCls} value={it.rate} onChange={(e) => updateItem(it.id, { rate: e.target.value })} placeholder="0" /></Field>
                  <div className="rounded-lg bg-white/[0.05] border border-white/[0.08] px-3 py-2.5"><div className="text-[10px] uppercase text-[#6B7079]">Amount</div><div className="text-[14px] font-semibold tabular-nums">{fmtINR(it.amount)}</div></div>
                </div>
              </div>
            ))}
          </div>
          <Btn variant="ghost" onClick={addItemRow} className="w-full justify-center mb-4"><Plus size={14} />Add another product / category</Btn>

          <SubHeading>GST — enter once, CGST + SGST auto-split</SubHeading>
          <div className="flex items-center gap-2 mb-3">
            <input type="checkbox" id="gst-toggle" checked={form.gstEnabled} onChange={(e) => setForm({ ...form, gstEnabled: e.target.checked })} className="w-4 h-4 accent-[#E28743]" />
            <label htmlFor="gst-toggle" className="text-[12.5px] text-[#D7DADF]">Apply GST to this bill</label>
          </div>
          {form.gstEnabled && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              <Field label="GST % (auto-split)"><input type="number" className={inputCls} value={form.gstPercent} onChange={(e) => setGstPercent(e.target.value)} placeholder="18" /></Field>
              <Field label="CGST %"><input type="number" className={inputCls} value={form.cgstPercent} onChange={(e) => setForm({ ...form, cgstPercent: e.target.value })} /></Field>
              <Field label="SGST %"><input type="number" className={inputCls} value={form.sgstPercent} onChange={(e) => setForm({ ...form, sgstPercent: e.target.value })} /></Field>
            </div>
          )}

          <SubHeading>Discount, payment & note</SubHeading>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Field label="Discount (₹)"><input type="number" className={inputCls} value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} placeholder="0" /></Field>
            <Field label="Payment mode"><select className={inputCls} value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>{PAYMENT_MODES.map((m) => <option key={m}>{m}</option>)}</select></Field>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Field label="Status"><select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{["Paid", "Pending"].map((m) => <option key={m}>{m}</option>)}</select></Field>
            <Field label="Note (optional)"><input className={inputCls} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="e.g. urgent delivery" /></Field>
          </div>

          <SubHeading>Full calculation</SubHeading>
          <div className="rounded-xl bg-black border border-white/[0.1] p-3.5 space-y-1.5 mb-4">
            {validItems.map((it) => (
              <Row key={it.id} label={`${it.name}${it.size ? " · " + it.size : ""} — ${it.qty || 0} ${it.unit} × ${fmtINR(it.rate)}`} value={fmtINR(it.amount)} />
            ))}
            <div className="h-px bg-white/[0.08] my-1.5" />
            <Row label="Items subtotal" value={fmtINR(preview.itemsTotal)} />
            <Row label="Discount" value={"− " + fmtINR(preview.discount)} />
            <Row label="Taxable value" value={fmtINR(preview.taxable)} />
            {form.gstEnabled && <Row label={`CGST (${form.cgstPercent || 0}%)`} value={fmtINR(preview.cgstAmt)} />}
            {form.gstEnabled && <Row label={`SGST (${form.sgstPercent || 0}%)`} value={fmtINR(preview.sgstAmt)} />}
            <div className="h-px bg-white/[0.08] my-1.5" />
            <Row label="Grand Total" value={fmtINR(preview.grand)} strong />
          </div>

          <div className="flex gap-2">
            <Btn className="flex-1 justify-center" onClick={submit} disabled={staff.length === 0}>
              {editingId ? <Pencil size={14} /> : <Plus size={14} />}
              {editingId ? "Update Bill" : "Save Bill"}
            </Btn>
            {editingId && <Btn variant="ghost" onClick={cancelEdit}><X size={14} />Cancel</Btn>}
          </div>
        </Card>

        <div className="space-y-3">
          {billings.map((b) => (
            <BillCard key={b.id} b={b} onEdit={() => startEdit(b)} onRemove={() => removeBilling(b.id, b.billNo)} onToggle={() => toggleBillingStatus(b.id)} />
          ))}
          {billings.length === 0 && <EmptyState text="No bills yet — create the first counter bill on the left." />}
        </div>
      </div>
    </div>
  );
}

function BillCard({ b, onEdit, onRemove, onToggle }) {
  const [open, setOpen] = useState(false);
  const c = computeBill(b);
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#5FA8E2]/10 border border-[#5FA8E2]/20 flex items-center justify-center shrink-0"><Zap size={16} className="text-[#5FA8E2]" /></div>
          <div className="min-w-0">
            <div className="text-[13.5px] font-medium truncate">{b.billNo} · {b.customer}</div>
            <div className="text-[11.5px] text-[#9AA0A8] truncate">
              {b.items.length} item{b.items.length > 1 ? "s" : ""} · Billed by {b.staff} · {b.mode} · {new Date(b.time).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 ml-auto">
          <button onClick={onToggle}><Badge tone={b.status === "Paid" ? "good" : "warn"}>{b.status}</Badge></button>
          <div className="text-[14.5px] font-semibold tabular-nums">{fmtINR(c.grand)}</div>
          <IconBtn icon={open ? ChevronUp : ChevronDown} onClick={() => setOpen((o) => !o)} title="View full calculation" />
          <IconBtn icon={Pencil} onClick={onEdit} />
          <IconBtn icon={Trash2} tone="danger" onClick={onRemove} />
        </div>
      </div>
      {open && (
        <div className="mt-3 pt-3 border-t border-white/[0.08] rounded-lg bg-black/40 p-3 space-y-1.5">
          {b.items.map((it) => (
            <Row key={it.id} label={`${it.name}${it.size ? " · " + it.size : ""} — ${it.qty} ${it.unit} × ${fmtINR(it.rate)}`} value={fmtINR(it.amount)} />
          ))}
          <div className="h-px bg-white/[0.08] my-1.5" />
          <Row label="Items subtotal" value={fmtINR(c.itemsTotal)} />
          <Row label="Discount" value={"− " + fmtINR(c.discount)} />
          <Row label="Taxable value" value={fmtINR(c.taxable)} />
          {b.gstEnabled && <Row label={`CGST (${b.cgstPercent}%)`} value={fmtINR(c.cgstAmt)} />}
          {b.gstEnabled && <Row label={`SGST (${b.sgstPercent}%)`} value={fmtINR(c.sgstAmt)} />}
          {b.note && <Row label="Note" value={b.note} />}
          <div className="h-px bg-white/[0.08] my-1.5" />
          <Row label="Grand Total" value={fmtINR(c.grand)} strong />
        </div>
      )}
    </Card>
  );
}
