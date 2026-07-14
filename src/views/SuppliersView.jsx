import React, { useState } from "react";
import { Plus, Trash2, Truck } from "lucide-react";
import { Card, SectionHeader, Btn, inputCls, IconBtn, Badge, EmptyState } from "../components/primitives.jsx";
import { fmtINR, uid } from "../utils/format.js";

export default function SuppliersView({ supplierLedger, suppliersDirectory, addSupplierContact, removeSupplierContact }) {
  const [form, setForm] = useState({ name: "", phone: "", notes: "" });
  const submit = () => { if (!form.name) return; addSupplierContact({ id: uid(), ...form }); setForm({ name: "", phone: "", notes: "" }); };
  return (
    <div className="max-w-[1200px] mx-auto heat-in space-y-6">
      <div>
        <SectionHeader eyebrow="Purchase Ledger" title="Supplier Balances" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {supplierLedger.map((s) => (
            <Card key={s.name} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#8CA3B8]/10 border border-[#8CA3B8]/20 flex items-center justify-center shrink-0"><Truck size={16} className="text-[#8CA3B8]" /></div>
                <div className="min-w-0"><div className="text-[13.5px] font-medium truncate">{s.name}</div><div className="text-[11px] text-[#9AA0A8]">{s.orders} purchase{s.orders > 1 ? "s" : ""}</div></div>
              </div>
              <div className="text-right shrink-0"><div className="text-[14px] font-semibold tabular-nums">{fmtINR(s.total)}</div>{s.pending > 0 ? <Badge tone="warn">{fmtINR(s.pending)} due</Badge> : <Badge tone="good">Settled</Badge>}</div>
            </Card>
          ))}
          {supplierLedger.length === 0 && <EmptyState text="Supplier totals appear automatically from purchases." />}
        </div>
      </div>
      <div>
        <SectionHeader eyebrow="Directory" title="Supplier Contacts" />
        <Card className="p-5 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input className={inputCls} placeholder="Supplier name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className={inputCls} placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className={inputCls} placeholder="Notes — credit terms etc." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <Btn onClick={submit} className="justify-center"><Plus size={14} />Add Contact</Btn>
          </div>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {suppliersDirectory.map((s) => (
            <Card key={s.id} className="p-4 flex items-center justify-between">
              <div className="min-w-0"><div className="text-[13px] font-medium truncate">{s.name}</div><div className="text-[11px] text-[#9AA0A8] truncate">{s.phone} {s.notes && `· ${s.notes}`}</div></div>
              <IconBtn icon={Trash2} tone="danger" onClick={() => removeSupplierContact(s.id)} />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
