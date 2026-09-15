# LumiFrames Studios

**Anime advertisement & portfolio platform**

LumiFrames Studios lets anime studios and creators build projects, upload trailers, music, voice recordings and images, then publish them to a global public feed. Each studio is private — only the owner can edit their projects — while published posts are visible to everyone.

Powered by **Vercel Blob** for global media storage and a lightweight serverless API.

---

## Website description

LumiFrames is a single-page application for:

- **Studios** – Create and manage multiple anime projects under one account
- **Media** – Upload or record voice, music, pictures and video (stored on Vercel Blob)
- **Character pairs** – Link anime characters with real-life references
- **Release schedule** – Set announcement and release dates
- **Public feed** – Discover published work from studios worldwide
- **Library** – Browse all your uploaded media
- **Sessions** – Email + password or Google (demo) login with 7-day sessions
- **Cache** – IndexedDB keeps anime data and last activity so the app resumes where you left off
- **Notifications** – In-app alerts for publishes, reports and feedback

Hierarchy: **Studio → Anime → Media**

---

## Project structure

```
lumiframes-vercel/
├── api/
│   ├── anime.js      GET/POST  /api/anime
│   ├── upload.js     POST      /api/upload
│   ├── delete.js     DELETE    /api/delete?id=
│   └── files.js      GET       /api/files
├── public/
│   ├── index.html    Frontend SPA
│   ├── sitemap.xml
│   └── robots.txt
├── package.json
├── vercel.json
└── README.md
```

---

## Quick deploy

```bash
npm i -g vercel
cd lumiframes-vercel
vercel
```

1. In the Vercel dashboard → **Storage** → create a **Blob** store and connect it.
2. `BLOB_READ_WRITE_TOKEN` is injected automatically.
3. Deploy: `vercel --prod`

---

## Features in this build

| Feature | Details |
|---------|---------|
| **IndexedDB cache** | Anime list + last activity stored offline |
| **Resume** | On return, app opens the last section you used |
| **Notifications** | Bell icon for updates, reports & feedback |
| **Sitemap** | `/sitemap.xml` + `/robots.txt` |
| **Auth** | Email/password + Google mock + session tokens |
| **Privacy** | Only the logged-in user edits their studio; posts are public |

Frontend talks to backend via `API_BASE = '/api'` (same origin on Vercel).

---

## Local development

```bash
npm install
vercel env pull   # pulls BLOB_READ_WRITE_TOKEN
vercel dev
```

Open http://localhost:3000

---

## License

Demo / educational use.
