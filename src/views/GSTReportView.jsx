import React from "react";
import { Percent } from "lucide-react";
import { Card, SectionHeader, SubHeading, KPI, Row, EmptyState } from "../components/primitives.jsx";
import { fmtINR, computeBill } from "../utils/format.js";

export default function GSTReportView({ billings, purchases, outputGST, inputGST }) {
  const payable = Math.max(0, outputGST - inputGST);
  const gstBillings = billings.filter((b) => b.gstEnabled);

  return (
    <div className="max-w-[1100px] mx-auto heat-in">
      <SectionHeader eyebrow="Tax" title="GST Report" />
      <Card className="p-4 mb-5 flex items-start gap-3 border-[#B98CE2]/25">
        <Percent size={16} className="text-[#B98CE2] mt-0.5 shrink-0" />
        <p className="text-[13px] text-[#D7DADF] leading-relaxed">
          This report is generated automatically from GST entered directly on each bill in Billing — there's no separate manual GST entry, so the numbers here always match your invoices.
        </p>
      </Card>
      <div className="flex flex-wrap gap-4 mb-6">
        <KPI label="Output GST (collected)" value={fmtINR(outputGST)} icon={Percent} />
        <KPI label="Input GST (on purchases)" value={fmtINR(inputGST)} icon={Percent} />
        <KPI label="Net GST Payable" value={fmtINR(payable)} icon={Percent} glow />
      </div>

      <Card className="p-5 mb-5">
        <SubHeading>Bill-wise GST breakdown</SubHeading>
        <div className="space-y-1">
          <div className="grid grid-cols-5 text-[10.5px] uppercase tracking-wide text-[#9AA0A8] pb-2 border-b border-white/[0.08]">
            <span>Bill</span><span>Customer</span><span>Taxable</span><span>CGST + SGST</span><span className="text-right">Total</span>
          </div>
          {gstBillings.map((b) => {
            const c = computeBill(b);
            return (
              <div key={b.id} className="grid grid-cols-5 text-[12.5px] py-2 border-b border-white/[0.04] last:border-0">
                <span className="text-[#D7DADF]">{b.billNo}</span>
                <span className="text-[#9AA0A8] truncate">{b.customer}</span>
                <span className="tabular-nums text-[#9AA0A8]">{fmtINR(c.taxable)}</span>
                <span className="tabular-nums text-[#9AA0A8]">{fmtINR(c.gstAmt)}</span>
                <span className="tabular-nums text-right font-medium">{fmtINR(c.grand)}</span>
              </div>
            );
          })}
          {gstBillings.length === 0 && <EmptyState text="GST breakdown will appear once you save a GST-applicable bill." />}
        </div>
      </Card>

      <Card className="p-5">
        <SubHeading>Purchase-wise input GST</SubHeading>
        <div className="space-y-1.5">
          {purchases.map((p) => (
            <Row key={p.id} label={`${p.invoice} · ${p.product} — ${fmtINR(p.qty * p.rate)} @ ${p.gstPercent || 0}%`} value={fmtINR((p.qty * p.rate * (p.gstPercent || 0)) / 100)} />
          ))}
          {purchases.length === 0 && <div className="text-[12.5px] text-[#6B7079]">No purchases recorded yet.</div>}
        </div>
      </Card>
    </div>
  );
}
