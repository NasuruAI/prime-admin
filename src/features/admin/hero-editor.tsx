"use client";

import { useEffect, useState } from "react";

import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminCall } from "@/lib/admin-client";

import { CloudinaryUpload } from "./cloudinary-upload";

type Setting = { key: string; value: unknown };
const labelCls = "mb-1 block text-xs font-medium text-ink/60";

type Hero = {
  badge: string;
  headline: string;
  subtext: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  backgroundUrl: string;
  overlayOpacity: number;
  sideImages: string[];
};

const EMPTY: Hero = {
  badge: "",
  headline: "",
  subtext: "",
  ctaPrimaryLabel: "",
  ctaPrimaryHref: "",
  ctaSecondaryLabel: "",
  ctaSecondaryHref: "",
  backgroundUrl: "",
  overlayOpacity: 60,
  sideImages: [],
};

export function HeroEditor() {
  const [hero, setHero] = useState<Hero>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    adminCall<{ settings: Setting[] }>("/storeconfig/settings/")
      .then(({ settings }) => {
        const m = new Map(settings.map((s) => [s.key, s.value]));
        const str = (k: string) => (typeof m.get(k) === "string" ? (m.get(k) as string) : "");
        const imgs = m.get("hero.side_images");
        const overlay = m.get("hero.overlay_opacity");
        setHero({
          badge: str("hero.badge"),
          headline: str("hero.headline"),
          subtext: str("hero.subtext"),
          ctaPrimaryLabel: str("hero.cta_primary_label"),
          ctaPrimaryHref: str("hero.cta_primary_href"),
          ctaSecondaryLabel: str("hero.cta_secondary_label"),
          ctaSecondaryHref: str("hero.cta_secondary_href"),
          backgroundUrl: str("hero.background_url"),
          overlayOpacity: typeof overlay === "number" ? (overlay as number) : 60,
          sideImages: Array.isArray(imgs) ? (imgs as string[]) : [],
        });
        setLoaded(true);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  function set<K extends keyof Hero>(key: K, val: Hero[K]) {
    setHero((h) => ({ ...h, [key]: val }));
  }

  function setSide(i: number, url: string) {
    setHero((h) => {
      const slots = [
        h.sideImages[0] ?? "",
        h.sideImages[1] ?? "",
        h.sideImages[2] ?? "",
      ];
      slots[i] = url;
      return { ...h, sideImages: slots };
    });
  }

  async function save() {
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      await adminCall("/storeconfig/settings/", {
        method: "PATCH",
        body: JSON.stringify({
          values: {
            "hero.badge": hero.badge,
            "hero.headline": hero.headline,
            "hero.subtext": hero.subtext,
            "hero.cta_primary_label": hero.ctaPrimaryLabel,
            "hero.cta_primary_href": hero.ctaPrimaryHref,
            "hero.cta_secondary_label": hero.ctaSecondaryLabel,
            "hero.cta_secondary_href": hero.ctaSecondaryHref,
            "hero.background_url": hero.backgroundUrl,
            "hero.overlay_opacity": hero.overlayOpacity,
            "hero.side_images": hero.sideImages.filter(Boolean),
          },
        }),
      });
      setStatus("Hero saved — refresh the storefront to see it.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!loaded && !error)
    return <p className="text-sm text-ink/55">Loading…</p>;

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      {status && <Banner tone="success">{status}</Banner>}
      {error && <Banner tone="error">{error}</Banner>}

      {/* Writeups */}
      <section className="admin-card p-6">
        <h2 className="mb-4 font-display text-base font-bold text-ink">
          Text
        </h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelCls}>Badge</label>
            <Input value={hero.badge} onChange={(e) => set("badge", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Headline</label>
            <Input value={hero.headline} onChange={(e) => set("headline", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Subtext</label>
            <textarea
              value={hero.subtext}
              rows={3}
              onChange={(e) => set("subtext", e.target.value)}
              className="w-full border border-ink/15 bg-white p-3 text-sm text-ink focus:border-primary focus:outline-none"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Primary button label</label>
              <Input value={hero.ctaPrimaryLabel} onChange={(e) => set("ctaPrimaryLabel", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Primary button link</label>
              <Input value={hero.ctaPrimaryHref} onChange={(e) => set("ctaPrimaryHref", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Secondary button label</label>
              <Input value={hero.ctaSecondaryLabel} onChange={(e) => set("ctaSecondaryLabel", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Secondary button link</label>
              <Input value={hero.ctaSecondaryHref} onChange={(e) => set("ctaSecondaryHref", e.target.value)} />
            </div>
          </div>
        </div>
      </section>

      {/* Background */}
      <section className="admin-card p-6">
        <h2 className="mb-1 font-display text-base font-bold text-ink">
          Background
        </h2>
        <p className="mb-4 text-xs text-ink/50">
          Image or video (.mp4) — videos autoplay muted and loop.
        </p>
        <div className="max-w-md">
          <CloudinaryUpload
            value={hero.backgroundUrl}
            onChange={(url) => set("backgroundUrl", url)}
            accept="image/*,video/mp4,video/webm"
            aspect="wide"
          />
        </div>

        <div className="mt-6 max-w-md">
          <div className="mb-1 flex items-center justify-between">
            <label className={labelCls}>Overlay opacity</label>
            <span className="text-xs font-medium text-ink/70">
              {hero.overlayOpacity}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={hero.overlayOpacity}
            onChange={(e) => set("overlayOpacity", Number(e.target.value))}
            className="w-full accent-primary"
          />
          <p className="mt-1 text-xs text-ink/45">
            Brand tint over the background. Higher = darker overlay / more
            readable text; lower = background shows through.
          </p>
        </div>
      </section>

      {/* Side images */}
      <section className="admin-card p-6">
        <h2 className="mb-1 font-display text-base font-bold text-ink">
          Side images
        </h2>
        <p className="mb-4 text-xs text-ink/50">
          Up to 3 images shown in the hero&apos;s side stack.
        </p>
        <div className="grid gap-5 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <CloudinaryUpload
              key={i}
              label={`Image ${i + 1}`}
              value={hero.sideImages[i] ?? ""}
              onChange={(url) => setSide(i, url)}
            />
          ))}
        </div>
      </section>

      <div>
        <Button type="button" onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save hero"}
        </Button>
      </div>
    </div>
  );
}
