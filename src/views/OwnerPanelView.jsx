import React, { useRef, useState } from "react";
import { Crown, Image as ImageIcon, Video, Music, Upload, Play, Pause, Volume2, VolumeX, X } from "lucide-react";
import { Card, SectionHeader, SubHeading, Btn, Field, inputCls, KPI } from "../components/primitives.jsx";
import { fmtINR } from "../utils/format.js";

const TYPES = [
  { id: "none", label: "None", icon: X },
  { id: "image", label: "Photo", icon: ImageIcon },
  { id: "video", label: "Video", icon: Video },
  { id: "audio", label: "Music", icon: Music },
];

export default function OwnerPanelView({ settings, businessSnapshot }) {
  const [bgType, setBgType] = useState("none");
  const [bgUrl, setBgUrl] = useState("");
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setBgUrl(url);
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); } else { audioRef.current.play().catch(() => {}); }
    setPlaying((p) => !p);
  };
  const toggleMute = () => {
    setMuted((m) => !m);
    if (videoRef.current) videoRef.current.muted = !muted;
  };

  return (
    <div className="max-w-[1100px] mx-auto heat-in">
      <SectionHeader eyebrow="Owner Only" title="Owner Panel" />

      <div className="relative rounded-2xl overflow-hidden border border-[#E28743]/20 mb-6 min-h-[280px] flex items-end">
        {bgType === "image" && bgUrl && <img src={bgUrl} alt="ambience" className="absolute inset-0 w-full h-full object-cover" />}
        {bgType === "video" && bgUrl && (
          <video ref={videoRef} src={bgUrl} autoPlay loop muted={muted} playsInline className="absolute inset-0 w-full h-full object-cover" />
        )}
        {bgType === "audio" && bgUrl && (
          <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-gradient-to-br from-[#1A0F06] to-black">
            {Array.from({ length: 24 }).map((_, i) => (
              <span key={i} className="audio-bar w-1.5 rounded-full bg-[#E28743]/70" style={{ height: `${18 + (i % 6) * 10}px`, animationDelay: `${i * 0.06}s`, animationPlayState: playing ? "running" : "paused" }} />
            ))}
            <audio ref={audioRef} src={bgUrl} loop />
          </div>
        )}
        {(bgType === "none" || !bgUrl) && <div className="absolute inset-0 bg-gradient-to-br from-[#1A0F06] via-black to-black bg-grain" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <div className="relative z-10 w-full p-6 flex items-end justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#EA9757] to-[#B45E23] flex items-center justify-center shadow-[0_0_24px_rgba(226,135,67,0.5)]"><Crown size={20} className="text-black" /></div>
            <div>
              <div className="text-[19px] font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{settings.ownerName}</div>
              <div className="text-[12px] text-[#D7DADF]">{settings.businessName} · {settings.tagline}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {bgType === "audio" && bgUrl && (
              <button onClick={toggleAudio} className="w-10 h-10 rounded-xl bg-white/[0.15] backdrop-blur border border-white/20 flex items-center justify-center text-white hover:bg-white/25">
                {playing ? <Pause size={16} /> : <Play size={16} />}
              </button>
            )}
            {bgType === "video" && bgUrl && (
              <button onClick={toggleMute} className="w-10 h-10 rounded-xl bg-white/[0.15] backdrop-blur border border-white/20 flex items-center justify-center text-white hover:bg-white/25">
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            )}
          </div>
        </div>
      </div>

      <Card className="p-5 mb-6">
        <SubHeading>Ambience — set a background photo, video, or song for this panel</SubHeading>
        <div className="flex flex-wrap gap-2 mb-4">
          {TYPES.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => { setBgType(t.id); setPlaying(false); }} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-medium border transition-all ${bgType === t.id ? "bg-[#E28743]/15 border-[#E28743]/40 text-[#E28743]" : "bg-white/[0.06] border-white/[0.1] text-[#D7DADF] hover:text-white"}`}>
                <Icon size={14} />{t.label}
              </button>
            );
          })}
        </div>
        {bgType !== "none" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label={`${bgType === "image" ? "Image" : bgType === "video" ? "Video" : "Audio"} URL`}>
              <input className={inputCls} value={bgUrl.startsWith("blob:") ? "" : bgUrl} onChange={(e) => setBgUrl(e.target.value)} placeholder="https://…" />
            </Field>
            <Field label="Or upload from this device">
              <input ref={fileInputRef} type="file" accept={bgType === "image" ? "image/*" : bgType === "video" ? "video/*" : "audio/*"} onChange={onFile} className="w-full text-[12px] text-[#9AA0A8] file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-white/[0.1] file:text-white file:text-[12px] file:cursor-pointer" />
            </Field>
          </div>
        )}
        <p className="text-[11px] text-[#6B7079] mt-3">Uploaded files stay in this browser tab only (not uploaded anywhere) — pick again after a refresh, or use a URL instead for something permanent.</p>
      </Card>

      <SubHeading>Owner snapshot</SubHeading>
      <div className="flex flex-wrap gap-4">
        <KPI label="Today's Revenue" value={fmtINR(businessSnapshot.todayRevenue)} glow />
        <KPI label="All-time Gross Profit" value={fmtINR(businessSnapshot.grossProfitAllTime)} />
        <KPI label="Capital Balance" value={fmtINR(businessSnapshot.capitalBalance)} />
        <KPI label="Stock Value" value={fmtINR(businessSnapshot.stockValue)} />
        <KPI label="GST Payable" value={fmtINR(businessSnapshot.gstPayable)} />
      </div>
    </div>
  );
}
