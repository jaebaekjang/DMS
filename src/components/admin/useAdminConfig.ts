"use client";

import { useEffect, useState } from "react";
import type { SiteConfig } from "@/lib/site/config";

export function useAdminConfig() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/config", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (alive) setConfig(d); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  async function save(patch: Partial<SiteConfig>) {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setConfig(data.config);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  }

  return { config, setConfig, loading, saving, saved, save };
}
