import { useEffect } from "react";
import { useStore } from "@/lib/store";

export function IntegrationsScripts() {
  const integrations = useStore((s) => s.settings.integrations);
  useEffect(() => {
    if (typeof document === "undefined") return;
    // Inject GA4
    if (integrations.ga4 && !document.getElementById("ga4-script")) {
      const s = document.createElement("script");
      s.id = "ga4-script"; s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${integrations.ga4}`;
      document.head.appendChild(s);
      const inline = document.createElement("script");
      inline.id = "ga4-inline";
      inline.innerHTML = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${integrations.ga4}');`;
      document.head.appendChild(inline);
    }
    // Custom header / footer scripts (text only, sandboxed best-effort)
    if (integrations.headerScript && !document.getElementById("custom-header")) {
      const s = document.createElement("script");
      s.id = "custom-header"; s.innerHTML = integrations.headerScript; document.head.appendChild(s);
    }
    if (integrations.footerScript && !document.getElementById("custom-footer")) {
      const s = document.createElement("script");
      s.id = "custom-footer"; s.innerHTML = integrations.footerScript; document.body.appendChild(s);
    }
  }, [integrations]);
  return null;
}
