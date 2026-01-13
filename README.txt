GUANAQUEROSNET — SITIO HTML NAVEGABLE (HEADER/FOOTER UNIFICADOS)

✅ Estructura:
- index.html, guanaqueros.html, directorio.html, gastronomia.html, eventos.html,
  emergencias.html, mapa.html, comunidad.html, contacto.html, noticias.html, etc.
- shared/header.html y shared/footer.html: se comparten en todas las páginas
- shared/include.js: inyecta header/footer automáticamente
- shared/base.css: estilos base para consistencia

IMPORTANTE:
Para que el header/footer se cargue, debes abrir el sitio con un servidor local (http),
no con doble click (file://).

OPCIÓN RÁPIDA (Python):
1) Abre una terminal en esta carpeta
2) Ejecuta:  python -m http.server 8000
3) Abre:     http://localhost:8000/

DEPLOY:
Puedes subir esta carpeta a Netlify/Vercel (static) o cualquier hosting estático.


Estructura nueva:
- index.html (raíz)
- /pages (páginas internas)
- /shared (header/footer)
- /css, /js, /data, /assets

Para correr:
python -m http.server 8000
Luego abrir http://localhost:8000/
