import React, { useState } from "react";
import { Save, Database, Trash2 } from "lucide-react";
import { Card, SectionHeader, SubHeading, Btn, Field, inputCls } from "../components/primitives.jsx";
import { clearAllLocalData } from "../utils/persist.js";
import { isSupabaseConfigured } from "../lib/supabaseClient.js";

export default function SettingsView({ settings, setSettings, partnerSplit, setPartnerSplit }) {
  const [local, setLocal] = useState(settings);
  const [split, setSplit] = useState(partnerSplit);
  const save = () => { setSettings(local); setPartnerSplit({ ownerPercent: Number(split.ownerPercent), partnerPercent: 100 - Number(split.ownerPercent) }); };

  return (
    <div className="max-w-[800px] mx-auto heat-in">
      <SectionHeader eyebrow="Configuration" title="Settings" />

      <Card className="p-5 mb-5">
        <SubHeading>Business identity — shown everywhere, fully editable</SubHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <Field label="Business name"><input className={inputCls} value={local.businessName} onChange={(e) => setLocal({ ...local, businessName: e.target.value })} /></Field>
          <Field label="Owner name"><input className={inputCls} value={local.ownerName} onChange={(e) => setLocal({ ...local, ownerName: e.target.value })} /></Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <Field label="GSTIN"><input className={inputCls} value={local.gstin} onChange={(e) => setLocal({ ...local, gstin: e.target.value })} /></Field>
          <Field label="Tagline"><input className={inputCls} value={local.tagline} onChange={(e) => setLocal({ ...local, tagline: e.target.value })} /></Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Invoice number prefix"><input className={inputCls} value={local.invoicePrefix} onChange={(e) => setLocal({ ...local, invoicePrefix: e.target.value })} /></Field>
          <Field label="Default GST % for new bills"><input type="number" className={inputCls} value={local.defaultGstPercent} onChange={(e) => setLocal({ ...local, defaultGstPercent: e.target.value })} /></Field>
        </div>
      </Card>

      <Card className="p-5 mb-5">
        <SubHeading>Profit split — Owner vs Partner</SubHeading>
        <input type="range" min="0" max="100" value={split.ownerPercent} onChange={(e) => setSplit({ ownerPercent: e.target.value })} className="w-full accent-[#E28743] mb-2" />
        <div className="flex items-center justify-between text-[12.5px] text-[#D7DADF]"><span>Owner: {split.ownerPercent}%</span><span>Partner: {100 - split.ownerPercent}%</span></div>
      </Card>

      <div className="flex justify-end mb-6">
        <Btn onClick={save}><Save size={14} />Save Settings</Btn>
      </div>

      <Card className="p-5 mb-5">
        <SubHeading>Database connection</SubHeading>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full" style={{ background: isSupabaseConfigured ? "#5FBE8A" : "#E2B34D", boxShadow: `0 0 6px ${isSupabaseConfigured ? "#5FBE8A" : "#E2B34D"}` }} />
          <span className="text-[13px] text-[#D7DADF]">{isSupabaseConfigured ? "Supabase connected" : "Running on local storage — Supabase not connected yet"}</span>
        </div>
        <p className="text-[12px] text-[#9AA0A8] leading-relaxed">
          Right now every entry is saved to your browser's local storage, so nothing is lost on refresh. To sync across devices, copy <code className="text-[#E28743]">.env.example</code> to <code className="text-[#E28743]">.env</code>, add your Supabase project URL + anon key, and run the SQL in <code className="text-[#E28743]">supabase/schema.sql</code>.
        </p>
      </Card>

      <Card className="p-5 border-[#E2604D]/25">
        <SubHeading>Danger zone</SubHeading>
        <p className="text-[12px] text-[#9AA0A8] mb-3">Wipes every bill, purchase, stock item, and setting stored in this browser. This cannot be undone.</p>
        <Btn variant="danger" onClick={() => { if (confirm("This will permanently delete all local data. Continue?")) { clearAllLocalData(); window.location.reload(); } }}>
          <Trash2 size={14} />Reset all local data
        </Btn>
      </Card>
    </div>
  );
}
