(async function () {
  const BASE = window.__BASE_PATH__ || "";
  const root = document.getElementById("evento");
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  const res = await fetch(BASE + "data/events.json", { cache: "no-store" });
  const events = await res.json();
  const ev = events.find(e => e.slug === slug) || null;

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[c]));
  }

  function fmt(dt) {
    try {
      const d = new Date(dt);
      return d.toLocaleString("es-CL", { weekday:"long", day:"2-digit", month:"long", year:"numeric", hour:"2-digit", minute:"2-digit" });
    } catch { return dt; }
  }

  function mapsLinks(e) {
    const q = encodeURIComponent((e.location_text || `${e.title} Guanaqueros Chile`).trim());
    const gmaps = `https://www.google.com/maps/search/?api=1&query=${q}`;
    const waze = `https://waze.com/ul?q=${q}&navigate=yes`;
    return { gmaps, waze };
  }
  async function loadEvents() {
    const { data, error } = await window.sb
      .from("events")
      .select("*")
      .eq("status", "published")
      .order("start_datetime", { ascending: true });
  
    if (error) {
      console.error(error);
      return [];
    }
    return data;
  }
  

  function icsDownload(e) {
    // Create a minimal ICS file client-side
    const dtStart = new Date(e.start_datetime);
    const dtEnd = new Date(e.end_datetime || e.start_datetime);
    const pad = (n) => String(n).padStart(2, "0");
    const fmtICS = (d) => (
      d.getUTCFullYear() +
      pad(d.getUTCMonth()+1) +
      pad(d.getUTCDate()) + "T" +
      pad(d.getUTCHours()) +
      pad(d.getUTCMinutes()) +
      pad(d.getUTCSeconds()) + "Z"
    );

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//GuanaquerosNet//ES",
      "BEGIN:VEVENT",
      `UID:${esc(e.id || e.slug)}@guanaquerosnet`,
      `DTSTAMP:${fmtICS(new Date())}`,
      `DTSTART:${fmtICS(dtStart)}`,
      `DTEND:${fmtICS(dtEnd)}`,
      `SUMMARY:${esc(e.title)}`,
      `LOCATION:${esc(e.location_text || "Guanaqueros")}`,
      `DESCRIPTION:${esc(e.description || "")}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([lines], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (e.slug || "evento") + ".ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  if (!ev) {
    root.innerHTML = `
      <div class="bg-white border border-slate-100 rounded-2xl p-6">
        <h1 class="text-xl font-semibold">Evento no encontrado</h1>
        <p class="text-slate-600 mt-2">Vuelve al listado de eventos y selecciona otro.</p>
        <a href="eventos.html" class="inline-flex mt-4 items-center justify-center px-4 py-2 rounded-xl bg-slate-900 text-white text-sm">Ir a eventos</a>
      </div>
    `;
    return;
  }

  const img = ev.poster_image ? (BASE + ev.poster_image) : "";
  const tags = (ev.tags || []).map(t => `<span class="px-3 py-1 text-xs rounded-full bg-slate-100 text-slate-700">${esc(t)}</span>`).join("");
  const { gmaps, waze } = mapsLinks(ev);

  root.innerHTML = `
    <article class="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
      ${img ? `<img src="${img}" alt="${esc(ev.title)}" class="w-full h-72 object-cover">` : ""}
      <div class="p-6">
        <h1 class="text-2xl md:text-3xl font-extrabold">${esc(ev.title)}</h1>
        <div class="flex flex-wrap gap-2 mt-3">${tags}</div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div class="text-sm text-slate-600">Inicio</div>
            <div class="font-semibold mt-1">${esc(fmt(ev.start_datetime))}</div>
            ${ev.end_datetime ? `<div class="text-sm text-slate-600 mt-3">Término</div><div class="font-semibold mt-1">${esc(fmt(ev.end_datetime))}</div>` : ""}
          </div>

          <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div class="text-sm text-slate-600">Lugar</div>
            <div class="font-semibold mt-1">${esc(ev.location_text || "Guanaqueros")}</div>
            <div class="flex flex-wrap gap-2 mt-3">
              <a href="${gmaps}" target="_blank" rel="noopener" class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm hover:bg-slate-50">
                <span class="material-symbols-outlined" style="font-size:18px">map</span>
                Google Maps
              </a>
              <a href="${waze}" target="_blank" rel="noopener" class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm hover:bg-slate-50">
                <span class="material-symbols-outlined" style="font-size:18px">near_me</span>
                Waze
              </a>
              <button id="btn-ics" class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm hover:opacity-90">
                <span class="material-symbols-outlined" style="font-size:18px">event</span>
                Agregar al calendario
              </button>
            </div>
          </div>
        </div>

        <div class="mt-6">
          <h2 class="text-base font-semibold">Descripción</h2>
          <p class="text-slate-600 mt-2">${esc(ev.description || "")}</p>
          ${ev.organizer_name ? `<div class="text-sm text-slate-600 mt-4">Organiza: <span class="font-medium text-slate-800">${esc(ev.organizer_name)}</span></div>` : ""}
        </div>
      </div>
    </article>
  `;

  const btn = document.getElementById("btn-ics");
  if (btn) btn.addEventListener("click", () => icsDownload(ev));
})();