// Shared header/footer loader for Stitch static pages
(async function () {
  const headerHost = document.getElementById('site-header');
  const footerHost = document.getElementById('site-footer');
  if (!headerHost && !footerHost) return;

  async function loadInto(host, url) {
    if (!host) return;
    const res = await fetch(url, { cache: 'no-store' });
    const html = await res.text();
    host.innerHTML = html;
  }

  try {
    await loadInto(headerHost, 'shared/header.html');
    await loadInto(footerHost, 'shared/footer.html');
  } catch (e) {
    // If opened via file://, fetch may fail. Fallback: show nothing.
    console.warn('No se pudo cargar header/footer compartido. Sirve con servidor local (http).', e);
  }
})();