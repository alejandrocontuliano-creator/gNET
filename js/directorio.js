(async function () {
  const BASE = window.__BASE_PATH__ || "";
  const container = document.getElementById("places-list");
  const filterType = document.getElementById("filter-type");
  const filterSector = document.getElementById("filter-sector");
  const searchInput = document.getElementById("search");
  if (!container) return;

  const res = await fetch(BASE + "data/places.json", { cache: "no-store" });
  const places = await res.json();

  // Build sector options
  const sectors = Array.from(new Set(places.map(p => p.sector).filter(Boolean))).sort();
  sectors.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    filterSector.appendChild(opt);
  });

  function matches(p) {
    const t = (filterType?.value || "").trim();
    const s = (filterSector?.value || "").trim();
    const q = (searchInput?.value || "").trim().toLowerCase();

    if (t && p.type !== t) return false;
    if (s && p.sector !== s) return false;

    if (q) {
      const hay = [
        p.name,
        p.description_short,
        p.sector,
        (p.tags || []).join(" "),
        (p.amenities || []).join(" "),
      ].filter(Boolean).join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }

  function fmtCLP(n) {
    try { return n.toLocaleString("es-CL"); } catch { return String(n); }
  }

  function card(p) {
    const photo = (p.photos && p.photos[0]) ? (BASE + p.photos[0]) : "";
    const price =
      (typeof p.price_min === "number" && typeof p.price_max === "number")
        ? `$${fmtCLP(p.price_min)} – $${fmtCLP(p.price_max)}`
        : (typeof p.price_min === "number")
          ? `$${fmtCLP(p.price_min)}`
          : "Consultar";

    const tags = (p.tags || []).slice(0, 4).map(t =>
      `<span class="px-3 py-1 text-xs rounded-full bg-slate-100 text-slate-700">${t}</span>`
    ).join("");

    const href = BASE + "pages/ficha.html?slug=" + encodeURIComponent(p.slug);

    return `
      <article class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition">
        ${photo ? `<img src="${photo}" alt="${p.name || "Servicio"}" class="w-full h-44 object-cover">` : ""}
        <div class="p-4">
          <div class="flex items-start justify-between gap-3">
            <h3 class="text-lg font-semibold leading-tight">${p.name || ""}</h3>
            <span class="text-xs px-2 py-1 rounded-full bg-slate-900 text-white capitalize">${p.type || ""}</span>
          </div>
          <p class="text-sm text-slate-600 mt-2">${p.description_short || ""}</p>
          <div class="flex flex-wrap gap-2 mt-3">${tags}</div>
          <div class="flex items-center justify-between mt-4">
            <span class="text-sm text-slate-700">${p.sector ? "Sector: " + p.sector : ""}</span>
            <span class="text-sm font-medium">${price}</span>
          </div>
          <div class="mt-4">
            <a href="${href}" class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm w-full">
              Ver ficha
              <span class="material-symbols-outlined" style="font-size:18px">chevron_right</span>
            </a>
          </div>
        </div>
      </article>
    `;
  }
  async function loadPlaces() {
    const { data, error } = await window.sb
      .from("places")
      .select("*")
      .eq("status", "published")
      .order("is_featured", { ascending: false })
      .order("name", { ascending: true });
  
    if (error) {
      console.error(error);
      return [];
    }
    return data;
  }
  

  function render() {
    const items = places.filter(matches);
    container.innerHTML = items.length
      ? `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">${items.map(card).join("")}</div>`
      : `<div class="bg-white border border-slate-100 rounded-2xl p-6 text-slate-600">No hay resultados con esos filtros.</div>`;
  }

  [filterType, filterSector, searchInput].filter(Boolean).forEach(el => el.addEventListener("input", render));
  render();
})();