import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, SectionHeader, Btn, inputCls, IconBtn } from "../components/primitives.jsx";
import { uid } from "../utils/format.js";
import { STAFF_ROLES } from "../utils/constants.js";

export default function StaffView({ staff, addStaff, removeStaff, billings }) {
  const [form, setForm] = useState({ name: "", role: "Counter Staff" });
  const submit = () => { if (!form.name) return; addStaff({ id: uid(), ...form }); setForm({ name: "", role: "Counter Staff" }); };
  const billsByStaff = (name) => billings.filter((b) => b.staff === name).length;
  return (
    <div className="max-w-[1200px] mx-auto heat-in">
      <SectionHeader eyebrow="Team" title="Staff" />
      <Card className="p-5 mb-5">
        <div className="text-[13px] font-medium text-[#D7DADF] mb-3 flex items-center gap-2"><Plus size={14} className="text-[#E28743]" />Add Team Member</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className={inputCls} placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className={inputCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>{STAFF_ROLES.map((r) => <option key={r}>{r}</option>)}</select>
          <Btn onClick={submit} className="justify-center"><Plus size={14} />Add</Btn>
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {staff.map((s) => (
          <Card key={s.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5FA8E2]/30 to-[#5FA8E2]/5 border border-[#5FA8E2]/20 flex items-center justify-center text-[13px] font-semibold text-[#5FA8E2] shrink-0">
                {s.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </div>
              <div className="min-w-0"><div className="text-[13.5px] font-medium truncate">{s.name}</div><div className="text-[11px] text-[#9AA0A8]">{s.role} · {billsByStaff(s.name)} bills raised</div></div>
            </div>
            <IconBtn icon={Trash2} tone="danger" onClick={() => removeStaff(s.id, s.name)} />
          </Card>
        ))}
      </div>
    </div>
  );
}
