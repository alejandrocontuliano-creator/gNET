(async function () {
  const BASE = window.__BASE_PATH__ || "";
  const root = document.getElementById("ficha");
  const rel = document.getElementById("relacionados");
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  const res = await fetch(BASE + "data/places.json", { cache: "no-store" });
  const places = await res.json();

  const place = places.find(p => p.slug === slug) || null;

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[c]));
  }

  function fmtCLP(n) {
    try { return n.toLocaleString("es-CL"); } catch { return String(n); }
  }

  function mapsLinks(p) {
    const hasGeo = p.geo && typeof p.geo.lat === "number" && typeof p.geo.lng === "number";
    const q = hasGeo ? `${p.geo.lat},${p.geo.lng}` : encodeURIComponent((p.address_text || p.address || `${p.name} Guanaqueros Chile`).trim());
    const gmaps = hasGeo
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
      : `https://www.google.com/maps/search/?api=1&query=${q}`;
    const waze = hasGeo
      ? `https://waze.com/ul?ll=${encodeURIComponent(q)}&navigate=yes`
      : `https://waze.com/ul?q=${q}&navigate=yes`;
    return { gmaps, waze };
  }

  function whatsappLink(num, text) {
    const clean = String(num || "").replace(/[^\d+]/g, "");
    if (!clean) return "";
    const msg = encodeURIComponent(text || "Hola, vengo desde GuanaquerosNet. ¿Me das más información?");
    return `https://wa.me/${clean.replace("+","")}?text=${msg}`;
  }

  if (!place) {
    root.innerHTML = `
      <div class="bg-white border border-slate-100 rounded-2xl p-6">
        <h1 class="text-xl font-semibold">Ficha no encontrada</h1>
        <p class="text-slate-600 mt-2">No pudimos encontrar el servicio solicitado. Vuelve al directorio y prueba nuevamente.</p>
        <a href="directorio.html" class="inline-flex mt-4 items-center justify-center px-4 py-2 rounded-xl bg-slate-900 text-white text-sm">Ir al directorio</a>
      </div>
    `;
    return;
  }

  const photo = (place.photos && place.photos[0]) ? (BASE + place.photos[0]) : "";
  const price =
    (typeof place.price_min === "number" && typeof place.price_max === "number")
      ? `$${fmtCLP(place.price_min)} – $${fmtCLP(place.price_max)}`
      : (typeof place.price_min === "number")
        ? `$${fmtCLP(place.price_min)}`
        : "Consultar";

  const tags = (place.tags || []).map(t => `<span class="px-3 py-1 text-xs rounded-full bg-slate-100 text-slate-700">${esc(t)}</span>`).join("");
  const ams = (place.amenities || []).map(a => `<li class="text-sm text-slate-700">${esc(a)}</li>`).join("");

  const { gmaps, waze } = mapsLinks(place);
  const wa = whatsappLink(place.contact_whatsapp, `Hola, soy ${""}. Vengo desde GuanaquerosNet y quisiera información sobre: ${place.name}`);

  const webBtn = place.website ? `<a href="${esc(place.website)}" target="_blank" rel="noopener" class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm hover:bg-slate-50">
      <span class="material-symbols-outlined" style="font-size:18px">public</span>
      Sitio web
    </a>` : "";

  const igBtn = place.instagram ? `<a href="${esc(place.instagram)}" target="_blank" rel="noopener" class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm hover:bg-slate-50">
      <span class="material-symbols-outlined" style="font-size:18px">photo_camera</span>
      Instagram
    </a>` : "";

  const waBtn = wa ? `<a href="${wa}" target="_blank" rel="noopener" class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm hover:opacity-90">
      <span class="material-symbols-outlined" style="font-size:18px">chat</span>
      WhatsApp
    </a>` : "";

  root.innerHTML = `
    <article class="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
      ${photo ? `<img src="${photo}" alt="${esc(place.name)}" class="w-full h-64 object-cover">` : ""}
      <div class="p-6">
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h1 class="text-2xl md:text-3xl font-extrabold leading-tight">${esc(place.name)}</h1>
              <span class="text-xs px-2 py-1 rounded-full bg-slate-900 text-white capitalize">${esc(place.type)}</span>
            </div>
            <p class="text-slate-600 mt-2">${esc(place.description_long || place.description_short || "")}</p>
            <div class="flex flex-wrap gap-2 mt-4">${tags}</div>
          </div>

          <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100 min-w-[220px]">
            <div class="text-sm text-slate-600">Precio</div>
            <div class="text-lg font-semibold mt-1">${esc(price)}</div>
            <div class="text-sm text-slate-600 mt-3">${place.sector ? "Sector: " + esc(place.sector) : ""}</div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div class="bg-white rounded-2xl border border-slate-100 p-4">
            <h2 class="text-base font-semibold">Contacto</h2>
            <div class="mt-3 flex flex-wrap gap-2">
              ${waBtn}
              ${webBtn}
              ${igBtn}
            </div>
            <div class="mt-4 text-sm text-slate-600">
              ${place.phone ? `<div>Tel: ${esc(place.phone)}</div>` : ""}
              ${place.email ? `<div>Email: ${esc(place.email)}</div>` : ""}
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-slate-100 p-4">
            <h2 class="text-base font-semibold">Cómo llegar</h2>
            <p class="text-sm text-slate-600 mt-2">${esc(place.address_text || place.address || "Ubicación referencial en Guanaqueros. Si tienes la dirección exacta, puedes agregarla en el JSON.")}</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <a href="${gmaps}" target="_blank" rel="noopener" class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm hover:bg-slate-50">
                <span class="material-symbols-outlined" style="font-size:18px">map</span>
                Google Maps
              </a>
              <a href="${waze}" target="_blank" rel="noopener" class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm hover:bg-slate-50">
                <span class="material-symbols-outlined" style="font-size:18px">near_me</span>
                Waze
              </a>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-slate-100 p-4 md:col-span-2">
            <h2 class="text-base font-semibold">Servicios / Amenities</h2>
            ${ams ? `<ul class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">${ams}</ul>` : `<p class="text-sm text-slate-600 mt-2">Aún no hay amenities cargados.</p>`}
          </div>
        </div>
      </div>
    </article>
  `;

  // Related: same type
  const related = places.filter(p => p.type === place.type && p.slug !== place.slug).slice(0, 3);
  if (rel) {
    if (!related.length) {
      rel.innerHTML = "";
      return;
    }
    rel.innerHTML = `
      <h2 class="text-lg font-semibold">También te puede interesar</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        ${related.map(p => {
          const ph = (p.photos && p.photos[0]) ? (BASE + p.photos[0]) : "";
          return `
            <a href="ficha.html?slug=${encodeURIComponent(p.slug)}" class="block bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition">
              ${ph ? `<img src="${ph}" alt="${esc(p.name)}" class="w-full h-40 object-cover">` : ""}
              <div class="p-4">
                <div class="font-semibold">${esc(p.name)}</div>
                <div class="text-sm text-slate-600 mt-1">${esc(p.description_short || "")}</div>
              </div>
            </a>
          `;
        }).join("")}
      </div>
    `;
  }
})();