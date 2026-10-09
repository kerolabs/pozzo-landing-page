# Pozzo landing page

Landing page de Pozzo, la aplicación móvil para administrar juntas de ahorro (ROSCAs) de forma transparente sin custodiar ni intermediar el dinero de los participantes. Proyecto desarrollado por el equipo **Kerolabs** para el curso de Aplicaciones para Dispositivos Móviles en la Universidad Peruana de Ciencias Aplicadas (UPC).

---

## Qué incluye

- **Sitio web estático**: Construido con HTML5 semántico, CSS3 modular y JavaScript moderno (ES6+), sin dependencias ni paso de compilación (*build step*).
- **Internacionalización (i18n)**: Soporte bilingüe en tiempo real (inglés y español) mediante diccionarios JSON en `i18n/EN.json` e `i18n/ES.json`.
- **Tema claro y oscuro**: Detección automática de la preferencia del sistema (`prefers-color-scheme`) y selector manual persistente en `localStorage`.
- **Páginas legales**: `terms.html` (Términos y Condiciones) y `privacy.html` (Política de Privacidad conforme a la Ley N.º 29733 de Perú).
- **Tipografía autoalojada**: *Plus Jakarta Sans* incluida en formatos WOFF2 en `assets/fonts/` (licencia SIL Open Font License).
- **Accesibilidad y rendimiento**: Atributos ARIA, contraste optimizado, soporte para reducción de movimiento (`prefers-reduced-motion`) e imágenes en formatos WebP y PNG con tamaños adaptativos.

---

## Estructura del proyecto

```
pozzo-landing-page/
├── .github/
│   └── workflows/
│       └── commit-policy.yml   # Verificación de Conventional Commits en CI
├── assets/
│   ├── css/
│   │   └── app.css             # Estilos globales, variables CSS, layout y temas
│   ├── fonts/                  # Fuentes Plus Jakarta Sans (WOOF2) y licencia OFL
│   └── img/                    # Logotipos, capturas de la app, fotos del equipo y favicon
├── i18n/
│   ├── EN.json                 # Diccionario de textos en inglés
│   └── ES.json                 # Diccionario de textos en español
├── js/
│   └── app.js                  # Lógica de i18n, tema, menú móvil, scroll y formulario
├── CONTRIBUTING.md              # Guía de contribución, Conventional Commits y PR workflow
├── index.html                  # Página principal de aterrizaje
├── privacy.html                # Política de Privacidad
├── README.md                   # Documentación general del repositorio
└── terms.html                  # Términos y Condiciones
```

---

## Instrucciones para previsualización local

Debido a que el motor de internacionalización (`js/app.js`) carga los diccionarios de traducción mediante la API `fetch()`, el protocolo `file://` del navegador bloqueará las solicitudes por políticas de seguridad (CORS). **Es indispensable ejecutar el proyecto sobre un servidor HTTP local.**

### Opción 1: Python 3 (Recomendado)
Ejecuta el servidor integrado en la raíz del repositorio:
```bash
python -m http.server 8000
```
O si tu sistema utiliza `python3`:
```bash
python3 -m http.server 8000
```
Luego abre tu navegador en [http://localhost:8000](http://localhost:8000).

### Opción 2: Node.js (`npx`)
Si tienes Node.js instalado, puedes usar herramientas como `serve` o `http-server` sin instalación previa:
```bash
npx serve .
# o
npx http-server -p 8000 .
```

### Opción 3: Extensión Live Server de VS Code
1. Instala la extensión **Live Server** (de Ritwick Dey) en Visual Studio Code.
2. Haz clic derecho sobre `index.html` en el explorador de archivos.
3. Selecciona **"Open with Live Server"**.

### Opción 4: Servidor integrado de PHP
```bash
php -S localhost:8000
```

---

## Guía de traducción y localización (i18n)

El contenido textual de la landing page se gestiona íntegramente de manera desacoplada en la carpeta `i18n/`.

### 1. Diccionarios de idioma
- `i18n/EN.json`: Textos para la versión en inglés (`en-US`).
- `i18n/ES.json`: Textos para la versión en español (`es-419`).

### 2. Regla de sincronización obligatoria
Cada clave (*key*) que se agregue, modifique o elimine en `EN.json` **debe actualizarse de forma idéntica en `ES.json`**, manteniendo la misma estructura jerárquica.

### 3. Convención de nombrado de claves
Las claves utilizan notación de punto (*dot notation*) organizada por sección y componente:
```json
{
  "hero.title": "Your junta, without the notebook or the screenshots",
  "hero.problem": "Keeping count of who paid...",
  "features.receipts.title": "Receipts checked for you",
  "join.error.name.required": "Enter your name."
}
```

### 4. Atributos HTML de localización
El script `js/app.js` escanea el DOM y actualiza los elementos según sus atributos de datos:
- `data-i18n="clave"`: Reemplaza el `textContent` del elemento con el valor traducido.
- `data-i18n-aria-label="clave"`: Actualiza el atributo `aria-label` para accesibilidad.
- `data-i18n-alt="clave"`: Actualiza el atributo `alt` en imágenes.
- `data-i18n-template="clave"`: Permite interpolación dinámica de valores pasados mediante `data-date-en`, `data-date-es`, `data-email` o `data-name`.

### 5. Interpolación de variables
Para textos que contienen variables dinámicas, usa la sintaxis `{variable}` en el JSON:
```json
"join.success.text": "Thanks, {name}. We will send you a notice when Pozzo is available."
```
En el código JavaScript, la función `interpolate(texto, { name: "Ana" })` sustituye automáticamente los tokens.

### 6. Contenido con enlaces enriquecidos
En cadenas complejas como el consentimiento legal (`join.consent`), el renderizado se realiza mediante `renderConsent()` en `js/app.js`, permitiendo incrustar hipervínculos a `terms.html` y `privacy.html` de forma segura sin inyectar HTML arbitrario.

### 7. Cómo agregar un nuevo idioma
1. Crea el nuevo archivo de traducción en `i18n/<CODIGO>.json` (ejemplo: `i18n/PT.json`).
2. Registra el idioma en el objeto `languages` dentro de `js/app.js`:
   ```javascript
   pt: {
     file: "./i18n/PT.json",
     htmlLang: "pt-BR"
   }
   ```
3. Agrega el botón selector en los componentes `.lang-switch` de `index.html`, `terms.html` y `privacy.html`:
   ```html
   <a href="#" data-lang="pt" lang="pt-BR">PT</a>
   ```

---

## Flujo de desarrollo y contribución

Para colaborar en este proyecto:
1. Revisa [CONTRIBUTING.md](CONTRIBUTING.md) para conocer las pautas de Pull Request hacia la rama `develop`.
2. Emplea la especificación **Conventional Commits** (ejemplo: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`).
   El hook `.githooks/commit-msg` rechaza el mensaje antes de crear el commit si no la cumple. Como el sitio no tiene paso de compilación, actívalo una vez después de clonar:
   ```bash
   git config core.hooksPath .githooks
   ```
3. Asegúrate de verificar localmente tanto el modo claro como el modo oscuro y ambos idiomas antes de enviar cambios.

---

## Publicación / Despliegue

El sitio se publica de manera continua en **GitHub Pages**:
- Fuente de despliegue: Rama `main`.
- Carpeta: `/ (root)`.
