# Pozzo landing page

Landing de Pozzo, la app para administrar juntas (ROSCA) sin manejar el dinero del grupo. Proyecto del equipo Kerolabs para el curso Aplicaciones para Dispositivos Móviles (UPC).

## Qué incluye

- Sitio estático en HTML, CSS y JavaScript, sin build ni dependencias.
- Dos idiomas, inglés y español, con los textos en `i18n/EN.json` e `i18n/ES.json`.
- Tema del sistema, claro u oscuro, con un botón en la barra superior.
- Páginas legales: `terms.html` y `privacy.html`.
- Tipografía Plus Jakarta Sans incluida en `assets/fonts/` (licencia OFL).

## Estructura

```
index.html          página principal
terms.html          términos y condiciones
privacy.html        política de privacidad
assets/             css, fuentes e imágenes
i18n/               textos EN y ES
js/app.js           idioma, tema, menú y formulario
```

## Cómo verlo en local

Los textos se cargan con `fetch`, así que no funciona abriendo el archivo con doble clic. Usa un servidor local:

```
python -m http.server 8000
```

Luego abre http://localhost:8000. En VS Code también sirve la extensión Live Server.

## Editar textos

Todo el contenido está en `i18n/`. Si agregas o cambias una clave, hazlo en `EN.json` y en `ES.json`.

## Publicar

GitHub Pages: en Settings, Pages, elige Deploy from a branch, rama `main` y carpeta `/ (root)`.
