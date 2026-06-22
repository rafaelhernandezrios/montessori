# Despliegue — Vercel (frontend) + Railway/Render (API)

## Arquitectura

| Componente | Dónde | Qué hace |
|------------|-------|----------|
| `client/` | **Vercel** | React (landing + dashboards) |
| `server/` | **Railway** o **Render** | Express API + MongoDB Atlas |

MongoDB Atlas es obligatorio en producción (no uses `localhost`).

---

## 1. Subir a GitHub

```bash
cd "/Users/rafael/Adriana Villalobos"
git init
git add .
git commit -m "Plataforma Montessori en Casa — MVP"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

> `.env` no se sube (está en `.gitignore`). Configura variables en cada plataforma.

---

## 2. MongoDB Atlas (producción)

1. Crea cluster gratis en [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Database Access → usuario + contraseña
3. Network Access → `0.0.0.0/0` (o IP de Railway)
4. Copia connection string:
   ```
   mongodb+srv://usuario:password@cluster.mongodb.net/montessori?retryWrites=true&w=majority
   ```

---

## 3. API en Railway (recomendado)

1. [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Selecciona el repo
3. **Root Directory:** `server` (o usa monorepo con start command abajo)
4. **Variables de entorno:**

| Variable | Valor |
|----------|-------|
| `MONGO_URI` | tu URI de Atlas |
| `JWT_SECRET` | string largo aleatorio |
| `PORT` | `5001` (Railway asigna puerto automático — usa `PORT` del env de Railway) |
| `CORS_ORIGINS` | `https://tu-app.vercel.app` |
| `FRONTEND_URL` | `https://tu-app.vercel.app` |
| `ADMIN_EMAIL` | email admin |
| `ADMIN_PASSWORD` | contraseña segura |
| `ADMIN_NAME` | Adriana Villalobos |

5. **Start command** (si root es monorepo):
   ```
   npm install && npm run start -w server
   ```
6. Tras deploy, corre seed una vez (Railway shell o local con MONGO_URI de prod):
   ```bash
   npm run seed -w server
   ```
7. Copia la URL pública del API, ej: `https://montessori-api.up.railway.app`

---

## 4. Frontend en Vercel

1. [vercel.com](https://vercel.com) → Add New Project → importa el repo de GitHub
2. Configuración:

| Campo | Valor |
|-------|-------|
| **Root Directory** | `client` |
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `cd .. && npm install` |

3. **Environment Variables:**

| Variable | Valor |
|----------|-------|
| `VITE_API_URL` | `https://montessori-api.up.railway.app` (sin `/api` al final) |

4. Deploy → tu sitio estará en `https://tu-app.vercel.app`

5. Actualiza `CORS_ORIGINS` en Railway con la URL real de Vercel.

---

## 5. Verificación post-deploy

- `https://tu-api.../api/health` → `{"ok":true,"db":"connected"}`
- Abre la web → registro / login funcionan
- Admin: credenciales de `ADMIN_EMAIL` / `ADMIN_PASSWORD`

---

## Alternativa: Render para API

1. [render.com](https://render.com) → Web Service → conecta GitHub
2. Root: `server`, Build: `npm install`, Start: `node index.js`
3. Mismas variables de entorno que Railway

---

## Notas

- **Stripe (fase 2):** agrega `STRIPE_*` en Railway y webhook URL apuntando al API.
- **Dominio propio:** en Vercel añade dominio; actualiza `CORS_ORIGINS` y `FRONTEND_URL`.
- El archivo `client/vercel.json` ya incluye rewrites para React Router (SPA).
