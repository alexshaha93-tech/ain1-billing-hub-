import React, { useState } from "react";
import { Plus, Trash2, Pencil, Package, AlertTriangle } from "lucide-react";
import { Card, SectionHeader, Btn, Field, inputCls, ComboInput, IconBtn, EmptyState } from "../components/primitives.jsx";
import { fmtINR, uid } from "../utils/format.js";
import { UNIT_OPTIONS } from "../utils/constants.js";

const EMPTY = { name: "", size: "", qty: "", min: "", rate: "", unit: "kg", gstPercent: 18, category: "" };

export default function StockView({ stock, addStock, adjustStock, removeStock, updateStockItem }) {
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);

  const submit = () => {
    if (!form.name || !form.qty || !form.rate) return;
    addStock({ id: uid(), name: form.name, size: form.size, qty: parseFloat(form.qty), min: parseFloat(form.min) || 0, rate: parseFloat(form.rate), unit: form.unit, gstPercent: parseFloat(form.gstPercent) || 0, category: form.category });
    setForm(EMPTY);
  };

  return (
    <div className="max-w-[1200px] mx-auto heat-in">
      <SectionHeader eyebrow="Inventory" title="Live Stock" />
      <Card className="p-5 mb-5">
        <div className="text-[13px] font-medium text-[#D7DADF] mb-3 flex items-center gap-2"><Plus size={14} className="text-[#E2B34D]" />Add Product</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <input className={inputCls} placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className={inputCls} placeholder="Size (e.g. 2 inch)" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
          <input className={inputCls} placeholder="Category (optional)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <ComboInput value={form.unit} onChange={(v) => setForm({ ...form, unit: v })} options={UNIT_OPTIONS} placeholder="unit" listId="stock-unit-list" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <input type="number" className={inputCls} placeholder="Quantity" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
          <input type="number" className={inputCls} placeholder="Min alert level" value={form.min} onChange={(e) => setForm({ ...form, min: e.target.value })} />
          <input type="number" className={inputCls} placeholder="Rate/unit" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} />
          <input type="number" className={inputCls} placeholder="GST %" value={form.gstPercent} onChange={(e) => setForm({ ...form, gstPercent: e.target.value })} />
          <Btn onClick={submit} className="justify-center"><Plus size={14} />Add</Btn>
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {stock.map((it) => {
          const low = it.qty <= it.min;
          const isEditing = editingId === it.id;
          return (
            <Card key={it.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${low ? "bg-[#E2B34D]/10 border-[#E2B34D]/25" : "bg-[#5FBE8A]/10 border-[#5FBE8A]/25"}`}>
                    <Package size={16} className={low ? "text-[#E2B34D]" : "text-[#5FBE8A]"} />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    {isEditing ? (
                      <>
                        <input className={inputCls} defaultValue={it.name} onBlur={(e) => updateStockItem(it.id, { name: e.target.value })} placeholder="Name" />
                        <input className={inputCls} defaultValue={it.size} onBlur={(e) => updateStockItem(it.id, { size: e.target.value })} placeholder="Size" />
                        <div className="grid grid-cols-2 gap-2">
                          <input type="number" className={inputCls} defaultValue={it.rate} onBlur={(e) => updateStockItem(it.id, { rate: parseFloat(e.target.value) || it.rate })} placeholder="Rate" />
                          <input type="number" className={inputCls} defaultValue={it.gstPercent} onBlur={(e) => updateStockItem(it.id, { gstPercent: parseFloat(e.target.value) || 0 })} placeholder="GST %" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-[13.5px] font-medium truncate">{it.name}{it.size ? ` · ${it.size}` : ""}</div>
                        <div className="text-[11.5px] text-[#9AA0A8]">{fmtINR(it.rate)} / {it.unit} · GST {it.gstPercent || 0}%{it.category ? ` · ${it.category}` : ""}</div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <IconBtn icon={Pencil} onClick={() => setEditingId(isEditing ? null : it.id)} />
                  <IconBtn icon={Trash2} tone="danger" onClick={() => removeStock(it.id, it.name)} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[19px] font-semibold tabular-nums">{it.qty.toLocaleString("en-IN")} <span className="text-[12px] text-[#9AA0A8] font-normal">{it.unit}</span></div>
                  {low && <div className="text-[10.5px] text-[#E2B34D] flex items-center gap-1 mt-0.5"><AlertTriangle size={10} />below minimum ({it.min})</div>}
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => adjustStock(it.id, -50)} className="w-8 h-8 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] flex items-center justify-center text-white text-[15px]">−</button>
                  <button onClick={() => adjustStock(it.id, 50)} className="w-8 h-8 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] flex items-center justify-center text-white text-[15px]">+</button>
                </div>
              </div>
            </Card>
          );
        })}
        {stock.length === 0 && <EmptyState text="No products in stock yet — add one above." />}
      </div>
    </div>
  );
}
