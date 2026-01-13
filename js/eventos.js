(async function () {
  const BASE = window.__BASE_PATH__ || "";
  const list = document.getElementById("events-list");
  if (!list) return;

  const res = await fetch(BASE + "data/events.json", { cache: "no-store" });
  const events = await res.json();

  function fmt(dt) {
    try {
      const d = new Date(dt);
      return d.toLocaleString("es-CL", { weekday:"short", day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" });
    } catch { return dt; }
  }

  list.innerHTML = events.map(ev => {
    const img = ev.poster_image
      ? `<img src="${BASE + ev.poster_image}" alt="${ev.title}" class="w-full h-40 object-cover">`
      : "";

    const tags = (ev.tags || []).slice(0,3).map(t => `<span class="px-3 py-1 text-xs rounded-full bg-slate-100 text-slate-700">${t}</span>`).join("");
    const href = `evento.html?slug=${encodeURIComponent(ev.slug)}`;

    return `
      <article class="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition">
        <a href="${href}" class="block">${img}</a>
        <div class="p-4">
          <div class="flex items-start justify-between gap-3">
            <h3 class="text-lg font-semibold leading-tight"><a href="${href}" class="hover:underline">${ev.title}</a></h3>
          </div>
          <p class="text-sm text-slate-600 mt-2">${fmt(ev.start_datetime)} • ${ev.location_text || "Guanaqueros"}</p>
          <div class="flex flex-wrap gap-2 mt-3">${tags}</div>
          <div class="mt-4">
            <a href="${href}" class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm w-full">
              Ver detalle
              <span class="material-symbols-outlined" style="font-size:18px">chevron_right</span>
            </a>
          </div>
        </div>
      </article>
    `;
  }).join("");
})();