(async function () {
  const BASE = window.__BASE_PATH__ || "";

  const placesRes = await fetch(BASE + "data/places.json", { cache: "no-store" });
  const eventsRes = await fetch(BASE + "data/events.json", { cache: "no-store" });

  let places = await placesRes.json();
  let events = await eventsRes.json();

  const placesPreview = document.getElementById("places-preview");
  const eventsPreview = document.getElementById("events-preview");

  function slugify(str) {
    return String(str || "")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function refresh() {
    if (placesPreview) placesPreview.textContent = JSON.stringify(places, null, 2);
    if (eventsPreview) eventsPreview.textContent = JSON.stringify(events, null, 2);
  }

  function downloadJSON(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  // Place form
  const pf = document.getElementById("place-form");
  if (pf) {
    pf.addEventListener("submit", (e) => {
      e.preventDefault();
      const type = document.getElementById("p-type")?.value || "servicio";
      const sector = document.getElementById("p-sector")?.value?.trim() || "";
      const name = document.getElementById("p-name")?.value?.trim() || "";
      const desc = document.getElementById("p-desc")?.value?.trim() || "";
      const min = Number(document.getElementById("p-min")?.value);
      const max = Number(document.getElementById("p-max")?.value);
      const wa = document.getElementById("p-wa")?.value?.trim() || "";
      const addr = document.getElementById("p-addr")?.value?.trim() || "";
      const lat = Number(document.getElementById("p-lat")?.value);
      const lng = Number(document.getElementById("p-lng")?.value);
      const tags = (document.getElementById("p-tags")?.value || "")
        .split(",").map(s => s.trim()).filter(Boolean);

      const slug = slugify(name);
      const id = `${type}-${slug}`;

      const obj = {
        id,
        type,
        name,
        slug,
        sector,
        description_short: desc,
        price_min: Number.isFinite(min) ? min : undefined,
        price_max: Number.isFinite(max) ? max : undefined,
        tags,
        amenities: [],
        photos: [],
        contact_whatsapp: wa,
        address_text: addr || undefined,
        geo: (Number.isFinite(lat) && Number.isFinite(lng)) ? { lat, lng } : undefined,
        website: "",
        instagram: ""
      };

      // remove undefined fields
      Object.keys(obj).forEach(k => obj[k] === undefined && delete obj[k]);

      places = [obj, ...places.filter(p => p.slug !== slug)];
      refresh();
      pf.reset();
    });
  }

  // Event form
  const ef = document.getElementById("event-form");
  if (ef) {
    ef.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("e-title")?.value?.trim() || "";
      const start = document.getElementById("e-start")?.value?.trim() || "";
      const end = document.getElementById("e-end")?.value?.trim() || "";
      const loc = document.getElementById("e-loc")?.value?.trim() || "";
      const org = document.getElementById("e-org")?.value?.trim() || "";
      const desc = document.getElementById("e-desc")?.value?.trim() || "";
      const tags = (document.getElementById("e-tags")?.value || "")
        .split(",").map(s => s.trim()).filter(Boolean);

      const slug = slugify(title);
      const id = `evento-${slug}`;

      const obj = {
        id,
        title,
        slug,
        start_datetime: start,
        end_datetime: end || undefined,
        location_text: loc,
        organizer_name: org || undefined,
        poster_image: "",
        description: desc,
        tags,
        links: []
      };
      Object.keys(obj).forEach(k => obj[k] === undefined && delete obj[k]);

      events = [obj, ...events.filter(e2 => e2.slug !== slug)];
      refresh();
      ef.reset();
    });
  }

  // Download buttons
  document.getElementById("download-places")?.addEventListener("click", () => downloadJSON("places.json", places));
  document.getElementById("download-events")?.addEventListener("click", () => downloadJSON("events.json", events));

  refresh();
})();