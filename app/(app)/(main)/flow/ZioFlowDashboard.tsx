"use client";

import { useState } from "react";
import { Sparkles, Copy, Check, Send, Globe, Video } from "lucide-react";
import type { SocialConnectionSummary } from "@/services/social-connection.service";
import type { UgcItemSummary } from "@/services/grow.service";
import type { FlowPostSummary } from "@/services/zioflow.service";

interface CaptionProfile {
  niche?: string | null;
  audience?: string | null;
  brandTone?: string | null;
  usp?: string | null;
}

interface FlowStats {
  totalPublished: number;
  totalQueued: number;
  byPlatform: { platform: string; count: number }[];
}

interface Props {
  initialProfile: CaptionProfile | null;
  approvedUgc: UgcItemSummary[];
  connections: SocialConnectionSummary[];
  initialPosts: FlowPostSummary[];
  stats: FlowStats;
}

const TONES = [
  { value: "calm", label: "Calm" },
  { value: "funny", label: "Funny" },
  { value: "inspirational", label: "Inspirational" },
  { value: "strong", label: "Bold" },
];

const PLATFORMS = [
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
];

const PLATFORM_ICONS: Record<string, typeof Globe> = {
  instagram: Globe,
  facebook: Globe,
  tiktok: Video,
};

type Tab = "captions" | "publish";

function CaptionSection({ profile }: { profile: CaptionProfile | null }) {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("calm");
  const [platform, setPlatform] = useState("instagram");
  const [price, setPrice] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [outputs, setOutputs] = useState<{ lang: string; type: string; text: string }[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), tone, platform, price: price || undefined }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Failed"); }
      const data = await res.json();
      const generated: { lang: string; type: string; text: string }[] = [];
      if (data.full) generated.push({ lang: `Full (${platform})`, type: "cairo", text: data.full });
      if (data.hook) generated.push({ lang: "Hook", type: "cairo", text: data.hook });
      if (data.body) generated.push({ lang: "Body", type: "inter", text: data.body });
      if (data.cta) generated.push({ lang: "CTA", type: "inter", text: data.cta });
      if (data.hashtags?.length) generated.push({ lang: "Hashtags", type: "inter", text: data.hashtags.join(" ") });
      if (data.captions?.length) {
        data.captions.forEach((c: { hook: string; body: string; cta: string; hashtags: string[] }, i: number) => {
          generated.push({ lang: `Variant ${i + 1}`, type: "cairo", text: [c.hook, c.body, c.cta].filter(Boolean).join("\n") });
        });
      }
      if (generated.length === 0) throw new Error("No captions generated");
      setOutputs(generated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-4">
        <div>
          <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 font-space">Product/Topic</label>
          <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. premium abaya, skincare serum..." className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-xl h-11 px-3 text-xs text-[var(--text-primary)] font-inter placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 font-space">Tone</label>
            <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-xl h-11 px-3 text-xs text-[var(--text-primary)] font-inter outline-none focus:border-[var(--accent)] appearance-none">
              {TONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 font-space">Platform</label>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-xl h-11 px-3 text-xs text-[var(--text-primary)] font-inter outline-none focus:border-[var(--accent)] appearance-none">
              {PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 font-space">Price (optional)</label>
          <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 49 TND" className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-xl h-11 px-3 text-xs text-[var(--text-primary)] font-inter placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors" />
        </div>
        <button onClick={handleGenerate} disabled={isGenerating || !topic.trim()} className="w-full h-12 bg-[var(--accent)] text-[var(--bg-base)] font-space font-bold rounded-xl text-xs flex items-center justify-center gap-2 active:scale-[0.97] transition-transform disabled:opacity-50">
          <Sparkles className="h-4 w-4" />
          {isGenerating ? "GENERATING..." : "ENGAGE CAPTION ENGINE"}
        </button>
      </div>

      {error && <div className="rounded-xl border border-[var(--status-danger)]/20 bg-[var(--status-danger-bg)] p-3"><p className="text-xs text-[var(--status-danger)] font-inter">{error}</p></div>}

      {outputs.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider font-space">Generated Assets</h3>
          {outputs.map((item, index) => (
            <div key={index} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold bg-[var(--bg-surface)] text-[var(--accent)] px-2 py-0.5 rounded font-space uppercase">{item.lang}</span>
                <button onClick={() => handleCopy(item.text, index)} className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-end">
                  {copiedIndex === index ? <Check className="h-3.5 w-3.5 text-[var(--status-success)]" /> : <Copy className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />}
                </button>
              </div>
              <p className={`text-xs text-[var(--text-primary)] leading-relaxed ${item.type === "cairo" ? "font-cairo" : "font-inter"}`}>{item.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PublishSection({
  approvedUgc,
  connections,
  initialPosts,
  stats,
}: {
  approvedUgc: UgcItemSummary[];
  connections: SocialConnectionSummary[];
  initialPosts: FlowPostSummary[];
  stats: FlowStats;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<Record<string, string>>({});

  const handlePublish = async (ugcItemId: string) => {
    const platform = selectedPlatform[ugcItemId] || connections[0]?.platform;
    if (!platform) return;
    setPublishing(ugcItemId);
    try {
      const res = await fetch("/api/v1/zioflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ugcItemId, platform }),
      });
      if (res.ok) {
        const data = await res.json();
        const fetchRes = await fetch("/api/v1/zioflow");
        if (fetchRes.ok) {
          const newData = await fetchRes.json();
          setPosts(newData.posts);
        }
      }
    } finally {
      setPublishing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3">
          <p className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest font-space">Published</p>
          <p className="text-lg font-bold font-space text-[var(--status-success)] mt-1">{stats.totalPublished}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3">
          <p className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest font-space">Queued</p>
          <p className="text-lg font-bold font-space text-[var(--warning-amber)] mt-1">{stats.totalQueued}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3">
          <p className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest font-space">Channels</p>
          <p className="text-lg font-bold font-space text-[var(--text-primary)] mt-1">{connections.length}</p>
        </div>
      </div>

      {connections.length === 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 text-center">
          <p className="text-xs text-[var(--text-muted)] font-inter">
            Connect your social accounts in Settings &gt; Branding to publish UGC directly.
          </p>
        </div>
      )}

      {approvedUgc.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider font-space">
            Ready to Publish ({approvedUgc.length})
          </h3>
          {approvedUgc.slice(0, 10).map((item) => (
            <div key={item.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-[var(--bg-surface)] overflow-hidden shrink-0">
                {item.mediaType === "image" ? (
                  <img src={item.mediaUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="h-5 w-5 text-[var(--text-muted)]" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[var(--text-primary)] font-space truncate">{item.buyerName}</p>
                <p className="text-[10px] text-[var(--text-tertiary)] font-inter">{item.product || "Product"}</p>
              </div>
              <select
                value={selectedPlatform[item.id] || connections[0]?.platform || "instagram"}
                onChange={(e) => setSelectedPlatform((p) => ({ ...p, [item.id]: e.target.value }))}
                className="bg-[var(--bg-base)] border border-[var(--border)] rounded-lg h-9 px-2 text-[10px] text-[var(--text-primary)] font-inter outline-none"
              >
                {connections.length > 0 ? connections.map((c) => (
                  <option key={c.platform} value={c.platform}>{c.platform}</option>
                )) : PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              <button
                onClick={() => handlePublish(item.id)}
                disabled={publishing === item.id}
                className="h-9 px-4 bg-[var(--accent)] text-[var(--bg-base)] rounded-lg text-[10px] font-bold font-space flex items-center gap-1.5 active:scale-[0.97] transition-transform disabled:opacity-50"
              >
                <Send className="h-3 w-3" />
                {publishing === item.id ? "..." : "PUBLISH"}
              </button>
            </div>
          ))}
        </div>
      )}

      {approvedUgc.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Send className="h-8 w-8 text-[var(--text-muted)] mb-2" />
          <p className="text-xs text-[var(--text-muted)] font-inter">No approved UGC ready to publish. Approve content in Capture first.</p>
        </div>
      )}

      {posts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider font-space">Publishing History</h3>
          <div className="space-y-2">
            {posts.map((post) => {
              const Icon = PLATFORM_ICONS[post.platform] || Globe;
              return (
                <div key={post.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full ${post.status === "published" ? "bg-[var(--status-success-bg)]" : "bg-[var(--warning-amber-bg)]"} flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 ${post.status === "published" ? "text-[var(--status-success)]" : "text-[var(--warning-amber)]"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[var(--text-primary)] font-space truncate">{post.buyerName} · {post.product}</p>
                    <p className="text-[10px] text-[var(--text-tertiary)] font-inter">{post.platform} · {post.status}</p>
                  </div>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full font-space ${post.status === "published" ? "bg-[var(--status-success-bg)] text-[var(--status-success)]" : "bg-[var(--warning-amber-bg)] text-[var(--warning-amber)]"}`}>
                    {post.status.toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ZioFlowDashboard(props: Props) {
  const [tab, setTab] = useState<Tab>("publish");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2">
        <button
          onClick={() => setTab("publish")}
          className={`px-4 py-2 rounded-lg text-xs font-bold font-space transition-all ${
            tab === "publish" ? "bg-[var(--accent)] text-[var(--bg-base)]" : "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)]"
          }`}
        >
          <Send className="h-3 w-3 inline mr-1" />
          PUBLISH
        </button>
        <button
          onClick={() => setTab("captions")}
          className={`px-4 py-2 rounded-lg text-xs font-bold font-space transition-all ${
            tab === "captions" ? "bg-[var(--accent)] text-[var(--bg-base)]" : "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)]"
          }`}
        >
          <Sparkles className="h-3 w-3 inline mr-1" />
          CAPTIONS
        </button>
      </div>

      {tab === "captions" ? (
        <CaptionSection profile={props.initialProfile} />
      ) : (
        <PublishSection
          approvedUgc={props.approvedUgc}
          connections={props.connections}
          initialPosts={props.initialPosts}
          stats={props.stats}
        />
      )}
    </div>
  );
}
