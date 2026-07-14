import React, { useState } from "react";
import { Plus, Trash2, Pencil, X, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { Card, SectionHeader, SubHeading, Btn, inputCls, IconBtn, EmptyState } from "../components/primitives.jsx";
import { fmtINR, uid } from "../utils/format.js";
import { DRAWING_TYPES } from "../utils/constants.js";

const EMPTY_DRAWING = { type: "Drawing", person: "Owner", amount: "", note: "" };

export default function DrawingView({ drawings, addDrawing, updateDrawing, removeDrawing, capitalBalance, partnerSplit, grossProfit, ownerShare, partnerShare, ownerDrawn, partnerDrawn }) {
  const [form, setForm] = useState(EMPTY_DRAWING);
  const [editingId, setEditingId] = useState(null);
  const startEdit = (d) => { setEditingId(d.id); setForm({ type: d.type, person: d.person, amount: d.amount, note: d.note || "" }); };
  const cancelEdit = () => { setEditingId(null); setForm(EMPTY_DRAWING); };
  const submit = () => {
    if (!form.amount) return;
    const payload = { type: form.type, person: form.person, amount: parseFloat(form.amount), note: form.note };
    if (editingId) { updateDrawing(editingId, payload); cancelEdit(); }
    else { addDrawing({ id: uid(), ...payload, time: Date.now() }); setForm(EMPTY_DRAWING); }
  };

  return (
    <div className="max-w-[1200px] mx-auto heat-in">
      <SectionHeader eyebrow="Capital" title="Owner & Partner" action={<div className="text-[13px] text-[#9AA0A8]">Business capital: <span className={`font-semibold ${capitalBalance >= 0 ? "text-[#5FBE8A]" : "text-[#E2604D]"}`}>{fmtINR(capitalBalance)}</span></div>} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <Card className="p-5">
          <SubHeading>Owner — {partnerSplit.ownerPercent}% share</SubHeading>
          <div className="flex items-baseline justify-between mb-1"><span className="text-[12px] text-[#9AA0A8]">Profit entitlement</span><span className="text-[16px] font-semibold tabular-nums">{fmtINR(ownerShare)}</span></div>
          <div className="flex items-baseline justify-between mb-1"><span className="text-[12px] text-[#9AA0A8]">Drawn out (net)</span><span className="text-[13px] tabular-nums text-[#E28CC0]">{fmtINR(ownerDrawn)}</span></div>
          <div className="h-px bg-white/[0.08] my-2" />
          <div className="flex items-baseline justify-between"><span className="text-[12px] font-medium text-white">Balance owed to owner</span><span className={`text-[17px] font-semibold tabular-nums ${(ownerShare - ownerDrawn) >= 0 ? "text-[#5FBE8A]" : "text-[#E2604D]"}`}>{fmtINR(ownerShare - ownerDrawn)}</span></div>
        </Card>
        <Card className="p-5">
          <SubHeading>Partner — {partnerSplit.partnerPercent}% share</SubHeading>
          <div className="flex items-baseline justify-between mb-1"><span className="text-[12px] text-[#9AA0A8]">Profit entitlement</span><span className="text-[16px] font-semibold tabular-nums">{fmtINR(partnerShare)}</span></div>
          <div className="flex items-baseline justify-between mb-1"><span className="text-[12px] text-[#9AA0A8]">Drawn out (net)</span><span className="text-[13px] tabular-nums text-[#E28CC0]">{fmtINR(partnerDrawn)}</span></div>
          <div className="h-px bg-white/[0.08] my-2" />
          <div className="flex items-baseline justify-between"><span className="text-[12px] font-medium text-white">Balance owed to partner</span><span className={`text-[17px] font-semibold tabular-nums ${(partnerShare - partnerDrawn) >= 0 ? "text-[#5FBE8A]" : "text-[#E2604D]"}`}>{fmtINR(partnerShare - partnerDrawn)}</span></div>
        </Card>
      </div>
      <div className="text-[11px] text-[#9AA0A8] mb-5">All-time gross profit used for this split: <span className="text-[#D7DADF] font-medium">{fmtINR(grossProfit)}</span> (revenue − purchases − expenses). Change the split ratio in Settings.</div>

      <Card className="p-5 mb-5">
        <div className="text-[13px] font-medium text-[#D7DADF] mb-3 flex items-center gap-2">{editingId ? <Pencil size={14} className="text-[#E28CC0]" /> : <Plus size={14} className="text-[#E28CC0]" />}{editingId ? "Edit Entry" : "New Entry"}</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <select className={inputCls} value={form.person} onChange={(e) => setForm({ ...form, person: e.target.value })}>{["Owner", "Partner"].map((pn) => <option key={pn}>{pn}</option>)}</select>
          <select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{DRAWING_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
          <input type="number" className={inputCls} placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <input className={inputCls} placeholder="Note — what for" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          <div className="flex gap-2"><Btn onClick={submit} className="justify-center flex-1">{editingId ? <Pencil size={14} /> : <Plus size={14} />}{editingId ? "Update" : "Add"}</Btn>{editingId && <Btn variant="ghost" onClick={cancelEdit}><X size={14} /></Btn>}</div>
        </div>
      </Card>

      <div className="space-y-2.5">
        {drawings.map((d) => {
          const isIn = d.type === "Capital Added" || d.type === "Return";
          return (
            <Card key={d.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${isIn ? "bg-[#5FBE8A]/10 border-[#5FBE8A]/20" : "bg-[#E28CC0]/10 border-[#E28CC0]/20"}`}>{isIn ? <ArrowDownToLine size={14} className="text-[#5FBE8A]" /> : <ArrowUpFromLine size={14} className="text-[#E28CC0]" />}</div>
                <div><div className="text-[13px] font-medium">{d.person} · {d.type}</div><div className="text-[11px] text-[#9AA0A8]">{d.note || "—"}</div></div>
              </div>
              <div className="flex items-center gap-2.5"><span className={`text-[14px] font-semibold tabular-nums ${isIn ? "text-[#5FBE8A]" : "text-[#E28CC0]"}`}>{isIn ? "+" : "−"}{fmtINR(d.amount)}</span><IconBtn icon={Pencil} onClick={() => startEdit(d)} /><IconBtn icon={Trash2} tone="danger" onClick={() => removeDrawing(d.id, d.type)} /></div>
            </Card>
          );
        })}
        {drawings.length === 0 && <EmptyState text="No capital or drawing entries yet." />}
      </div>
    </div>
  );
}
