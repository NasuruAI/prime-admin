"use client";

import { useState } from "react";

import { SOCIAL_ICON_KEYS, SocialIcon } from "@/components/social-icons";
import { Input } from "@/components/ui/input";

type Link = { name: string; url: string; icon: string };

/** Add/remove rows of {name, url, icon} with an icon-picker popup per row. */
export function SocialLinksEditor({
  value,
  onChange,
}: {
  value: Link[];
  onChange: (links: Link[]) => void;
}) {
  const links = Array.isArray(value) ? value : [];
  const [pickerRow, setPickerRow] = useState<number | null>(null);

  const update = (i: number, patch: Partial<Link>) =>
    onChange(links.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  const add = () =>
    onChange([...links, { name: "", url: "https://", icon: "instagram" }]);
  const remove = (i: number) =>
    onChange(links.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col gap-2">
      {links.length === 0 && (
        <p className="text-xs text-ink/45">
          No social links yet — add one below.
        </p>
      )}

      {links.map((l, i) => (
        <div key={i} className="flex items-center gap-2">
          {/* Icon picker */}
          <div className="relative">
            <button
              type="button"
              aria-label="Choose icon"
              onClick={() => setPickerRow(pickerRow === i ? null : i)}
              className="flex h-10 w-10 items-center justify-center rounded-md border border-ink/15 bg-white text-ink transition hover:border-primary"
            >
              <SocialIcon icon={l.icon} />
            </button>
            {pickerRow === i && (
              <>
                <button
                  type="button"
                  aria-hidden
                  tabIndex={-1}
                  className="fixed inset-0 z-20 cursor-default"
                  onClick={() => setPickerRow(null)}
                />
                <div className="absolute left-0 top-12 z-30 grid w-56 grid-cols-5 gap-1 rounded-xl border border-ink/10 bg-white p-2 shadow-card">
                  {SOCIAL_ICON_KEYS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      title={key}
                      onClick={() => {
                        update(i, { icon: key });
                        setPickerRow(null);
                      }}
                      className={`flex h-9 w-9 items-center justify-center rounded-md transition ${
                        l.icon === key
                          ? "bg-primary/10 text-primary"
                          : "text-ink/70 hover:bg-ink/5"
                      }`}
                    >
                      <SocialIcon icon={key} size={16} />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <Input
            value={l.name}
            onChange={(e) => update(i, { name: e.target.value })}
            placeholder="Name (e.g. Instagram)"
            className="w-44"
          />
          <Input
            value={l.url}
            onChange={(e) => update(i, { url: e.target.value })}
            placeholder="https://…"
            className="flex-1"
          />
          <button
            type="button"
            aria-label="Remove link"
            onClick={() => remove(i)}
            className="flex h-9 w-9 shrink-0 items-center justify-center text-ink/40 transition hover:text-accent"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="self-start text-xs font-semibold text-primary transition hover:text-accent"
      >
        + Add social link
      </button>
    </div>
  );
}
