// Shared header/footer loader for GuanaquerosNet (static site)
// Works when served over http(s) (not file://) because it uses fetch()
(function () {
  function computeBasePrefix() {
    // Example paths:
    // /index.html                  -> ""
    // /pages/directorio.html       -> "../"
    // /sub/site/pages/x.html       -> "../../"
    const path = window.location.pathname || "/";
    const clean = path.split("?")[0].split("#")[0];
    const parts = clean.split("/").filter(Boolean);

    // If last part looks like a file, drop it; otherwise it's a directory
    const hasFile = parts.length && parts[parts.length - 1].includes(".");
    const dirs = hasFile ? parts.slice(0, -1) : parts;

    if (!dirs.length) return "";
    return dirs.map(() => "..").join("/") + "/";
  }
  <script type="module">
  import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

  const SUPABASE_URL = "https://xaiootinejvdxmdmoxru.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_SeK_3zXpC00QciTtR0mLVQ_oSWGiHb_";

  window.sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
</script>

  const BASE = computeBasePrefix();
  window.__BASE_PATH__ = BASE;

  async function loadFragment(id, url) {
    const el = document.getElementById(id);
    if (!el) return;
    try {
      const res = await fetch(url, { cache: "no-store" });
      const html = await res.text();
      // Replace {{BASE}} tokens so links work from any depth
      el.innerHTML = html.replaceAll("{{BASE}}", BASE);
    } catch (e) {
      console.warn("No se pudo cargar:", url, e);
    }
  }

  // Header/Footer placeholders:
  // <div id="site-header"></div>
  // <div id="site-footer"></div>
  loadFragment("site-header", BASE + "shared/header.html");
  loadFragment("site-footer", BASE + "shared/footer.html");
})();
