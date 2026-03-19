# ¡Aprende Palabras! PWA 🎒

Flashcards interactivas con Coco el cocodrilo y Bú el búho.  
Funciona **offline**, instalable como app nativa.

---

## 📁 Estructura

```
/
├── index.html              ← App principal
├── sw.js                   ← Service Worker
├── manifest.json           ← Web App Manifest
├── favicon.ico
├── 404.html                ← Redirige a / (GitHub Pages / Netlify)
├── robots.txt
├── _headers                ← Headers HTTP (Netlify)
├── _redirects              ← SPA fallback (Netlify)
├── vercel.json             ← Config Vercel
└── icons/
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    ├── icon-512x512.png
    ├── icon-512x512-maskable.png
    └── apple-touch-icon.png
```

---

## 🚀 Opciones de despliegue

> ⚠️ El Service Worker **solo funciona con HTTPS** (o `localhost`).  
> Elige cualquiera de estas plataformas — todas dan HTTPS gratis.

---

### Opción 1 — Netlify (recomendado, más simple)

1. Entra a [netlify.com](https://netlify.com) y crea cuenta gratis
2. Arrastra la carpeta completa al área de drop de Netlify
3. ¡Listo! Tu URL es algo como `https://nombre-aleatorio.netlify.app`

**O con Git:**
```bash
# Instalar CLI
npm install -g netlify-cli

# Desde la carpeta del proyecto
netlify deploy --prod --dir .
```

---

### Opción 2 — Vercel

1. Instala [Vercel CLI](https://vercel.com/cli):
```bash
npm install -g vercel
```

2. Despliega:
```bash
cd aprende-palabras-pwa
vercel --prod
```

3. Vercel detecta el `vercel.json` automáticamente.

---

### Opción 3 — GitHub Pages

1. Crea un repositorio en GitHub
2. Sube todos los archivos:
```bash
git init
git add .
git commit -m "¡Aprende Palabras! PWA v1.0"
git remote add origin https://github.com/TU_USUARIO/aprende-palabras.git
git push -u origin main
```

3. En GitHub → Settings → Pages → Source: `main` branch → `/ (root)`
4. Tu URL: `https://TU_USUARIO.github.io/aprende-palabras`

> **Nota GitHub Pages**: el Service Worker funciona pero el scope puede necesitar ajuste si el repo no está en la raíz. El `sw.js` ya está configurado con `scope: '/'`.

---

### Opción 4 — Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Public dir: . (raíz)
# Single page app: Yes
firebase deploy
```

---

## 📱 Instalar como app

Una vez desplegado con HTTPS:

- **Android (Chrome)**: aparece el banner "Añadir a pantalla de inicio" automáticamente
- **iOS (Safari)**: Compartir → "Añadir a pantalla de inicio"
- **Desktop (Chrome/Edge)**: ícono de instalación en la barra de dirección

---

## 🔧 Actualizar la app

Cuando hagas cambios:
1. Incrementa `CACHE_VERSION` en `sw.js` (ej: `v1.0.0` → `v1.0.1`)
2. Vuelve a subir los archivos
3. El Service Worker detectará la nueva versión y actualizará el caché automáticamente

---

## 📶 Funcionamiento offline

| Recurso | Sin conexión |
|---------|-------------|
| App completa | ✅ Funciona |
| Imágenes Wikipedia | ✅ Si ya se cachearon |
| Imágenes nuevas | ❌ Muestra emoji fallback |
| Voz (TTS) | ✅ Usa voces del sistema |
| Sílabas y texto | ✅ Siempre disponible |

---

## 🛠️ Desarrollo local

```bash
# Servidor simple con Python
python3 -m http.server 8080
# Abrir: http://localhost:8080

# O con Node
npx serve .
# Abrir: http://localhost:3000
```

> El SW funciona en `localhost` sin HTTPS.

---

## 📊 Lighthouse score esperado

- Performance: 90+
- Accessibility: 95+
- Best Practices: 100
- SEO: 90+
- PWA: ✅ Installable

---

Hecho con ❤️ para niños que aprenden palabras.
