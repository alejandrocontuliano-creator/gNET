const eventsCarousel = document.getElementById("events-carousel");
const featuredGastronomy = document.getElementById("featured-gastronomy");
const featuredLodging = document.getElementById("featured-lodging");

const supabase = window.sb;

const DEFAULT_POSTER =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80";

const CATEGORY_LABELS = {
  gastronomia: "Gastronomía",
  alojamiento: "Alojamiento",
  servicio: "Servicio",
};

const STATUS_COPY = {
  emptyEvents: "No hay eventos publicados todavía.",
  emptyGastronomy: "No hay gastronomía destacada por ahora.",
  emptyLodging: "No hay alojamientos destacados por ahora.",
  error: "No pudimos cargar los datos en este momento.",
};

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
  });
}

function formatPriceRange(min, max) {
  if (!min && !max) return "Consultar tarifas";
  if (min && max) return `$${min.toLocaleString("es-CL")} - $${max.toLocaleString("es-CL")}`;
  if (min) return `Desde $${min.toLocaleString("es-CL")}`;
  return `Hasta $${max.toLocaleString("es-CL")}`;
}

function buildEventCard(event) {
  const tag = (event.tags && event.tags[0]) || "Evento";
  const dateLabel = formatDate(event.start_datetime);
  const poster = event.poster_url || DEFAULT_POSTER;
  const description = event.description || "Detalle disponible próximamente.";

  return `
    <div class="min-w-[300px] bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 transition-transform hover:-translate-y-1">
      <div class="h-40 bg-cover bg-center" role="img" aria-label="${event.title}" style="background-image: url('${poster}');"></div>
      <div class="p-4 space-y-2">
        <div class="flex items-center gap-2 text-xs font-bold text-primary uppercase">
          <span class="bg-primary/10 px-2 py-1 rounded">${tag}</span>
          ${dateLabel ? `<span class="text-slate-500">• ${dateLabel}</span>` : ""}
        </div>
        <h3 class="font-bold text-slate-900 dark:text-white text-lg">${event.title}</h3>
        <p class="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">${description}</p>
      </div>
    </div>
  `;
}

function buildPlaceCard(place) {
  const badge = CATEGORY_LABELS[place.type] || "Destino";
  const description = place.description_short || "Más información disponible.";
  const price = formatPriceRange(place.price_min, place.price_max);

  return `
    <div class="flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
      <div class="w-24 h-24 rounded-lg bg-cover bg-center shrink-0" role="img" aria-label="${place.name}" style="background-image: url('${DEFAULT_POSTER}');"></div>
      <div class="flex-1 space-y-1">
        <div class="flex justify-between items-center">
          <h4 class="font-bold dark:text-white">${place.name}</h4>
          <span class="text-xs font-semibold text-primary uppercase">${badge}</span>
        </div>
        <p class="text-sm text-slate-500">${description}</p>
        <span class="inline-block text-xs font-medium text-slate-400">${price}</span>
      </div>
    </div>
  `;
}

function renderList(container, items, emptyMessage, builder) {
  if (!container) return;
  if (!items.length) {
    container.innerHTML = `
      <div class="min-w-[260px] bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 p-4 text-sm text-slate-500 dark:text-slate-300">
        ${emptyMessage}
      </div>
    `;
    return;
  }
  container.innerHTML = items.map(builder).join("");
}

async function loadHomeContent() {
  if (!supabase || !eventsCarousel || !featuredGastronomy || !featuredLodging) {
    return;
  }

  const [eventsResult, placesResult] = await Promise.all([
    supabase
      .from("events")
      .select("title,slug,description,start_datetime,poster_url,tags")
      .eq("status", "published")
      .order("start_datetime", { ascending: true })
      .limit(4),
    supabase
      .from("places")
      .select("name,slug,type,description_short,price_min,price_max,is_featured,status")
      .eq("status", "published")
      .eq("is_featured", true)
      .in("type", ["gastronomia", "alojamiento"])
      .limit(6),
  ]);

  if (eventsResult.error) {
    renderList(eventsCarousel, [], STATUS_COPY.error, buildEventCard);
  } else {
    renderList(eventsCarousel, eventsResult.data ?? [], STATUS_COPY.emptyEvents, buildEventCard);
  }

  if (placesResult.error) {
    renderList(featuredGastronomy, [], STATUS_COPY.error, buildPlaceCard);
    renderList(featuredLodging, [], STATUS_COPY.error, buildPlaceCard);
    return;
  }

  const places = placesResult.data ?? [];
  const gastronomy = places.filter((place) => place.type === "gastronomia").slice(0, 2);
  const lodging = places.filter((place) => place.type === "alojamiento").slice(0, 2);

  renderList(featuredGastronomy, gastronomy, STATUS_COPY.emptyGastronomy, buildPlaceCard);
  renderList(featuredLodging, lodging, STATUS_COPY.emptyLodging, buildPlaceCard);
}

loadHomeContent();
