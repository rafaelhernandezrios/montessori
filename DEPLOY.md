# Despliegue en Vercel (frontend + API)

Todo el proyecto se despliega en **un solo proyecto de Vercel**: React estático + API Express serverless.

## Arquitectura

```
Vercel
├── client/dist     → sitio React (landing + dashboards)
└── api/index.js    → Express API (/api/*) + MongoDB Atlas
```

No necesitas Railway ni Render.

---

## 1. MongoDB Atlas

1. Crea cluster gratis en [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Database Access → usuario + contraseña
3. Network Access → `0.0.0.0/0` (permite conexiones desde Vercel)
4. Connection string:
   ```
   mongodb+srv://usuario:password@cluster.mongodb.net/montessori?retryWrites=true&w=majority
   ```

---

## 2. Sembrar admin (una vez, desde tu Mac)

Con la URI de Atlas en `.env`:

```bash
npm run seed
```

Crea el usuario admin y la disponibilidad inicial.

---

## 3. Proyecto en Vercel

1. [vercel.com](https://vercel.com) → **Add New Project** → importa `rafaelhernandezrios/montessori`
2. **Root Directory:** `.` (raíz del repo, no `client`)
3. Vercel detectará `vercel.json` automáticamente
4. **Environment Variables** (Production + Preview):

| Variable | Valor |
|----------|-------|
| `MONGO_URI` | URI de MongoDB Atlas |
| `JWT_SECRET` | string largo aleatorio |
| `ADMIN_EMAIL` | email del admin |
| `ADMIN_PASSWORD` | contraseña segura |
| `ADMIN_NAME` | Adriana Villalobos |
| `FRONTEND_URL` | `https://tu-dominio.vercel.app` (opcional; Vercel usa `VERCEL_URL` automáticamente) |
| `CORS_ORIGINS` | `https://tu-dominio.vercel.app` (opcional si usas dominio propio) |

> **No necesitas `VITE_API_URL`** en Vercel: frontend y API comparten el mismo dominio (`/api`).

5. **Deploy**

---

## 4. Verificación

- `https://tu-app.vercel.app/api/health` → `{"ok":true,"db":"connected","env":"vercel"}`
- Registro y login en la web
- Admin: `ADMIN_EMAIL` / `ADMIN_PASSWORD`

---

## 5. Desarrollo local

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173 (proxy `/api` → :5001)
- API: http://localhost:5001/api/health

---

## Notas

- **Dominio propio:** agrégalo en Vercel → Settings → Domains; actualiza `FRONTEND_URL` y `CORS_ORIGINS`.
- **Stripe (fase 2):** webhook URL = `https://tu-dominio.vercel.app/api/stripe/webhook`
- **Límites serverless:** funciones hasta 30s (`maxDuration` en `vercel.json`). Plan Hobby = 10s en algunas regiones; si hay timeouts con MongoDB frío, considera plan Pro o mantener conexión Atlas en región cercana.
