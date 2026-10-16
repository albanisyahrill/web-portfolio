# NEURAL//OS — Personal Portfolio

A futuristic portfolio website themed as a "sci-fi operating system". Frontend in **React (Vite)**, backend in **Go** (standard library, no dependencies).

## Features

- **Boot sequence**: terminal-style intro on first visit (a faster version on later visits, skippable).
- **Rotating hologram core** in the hero, glitch-effect name, and typed rotating roles.
- **Neural network background** on a canvas that reacts to the cursor.
- **Orbit-shaped skill matrix**: one ring per category, one node per skill.
- **Holographic project cards**: 3D tilt effect and a unique generative visual per project (generated automatically from its `id`).
- **Interactive terminal**: type `help`, `whoami`, `skills`, `projects`, `open 1`, `goto skills`, and more.
- Responsive and respects `prefers-reduced-motion`.

## Structure

```
personal-web/
├── backend/                 # Go API
│   ├── data/profile.json    # ← ALL PROFILE DATA LIVES HERE
│   ├── main.go              # server, routing, env configuration
│   ├── handlers.go          # API endpoints
│   ├── store.go             # data loader (hot-reload)
│   ├── middleware.go        # CORS, logging, security headers, SPA
│   └── models.go
└── frontend/                # React + Vite
    └── src/
        ├── App.jsx
        ├── api.js           # API fetch, falls back to profile.json when the API is down
        ├── components/      # Hero, About, Skills, Projects, Terminal, ...
        └── styles/global.css  # color tokens & base styles
```

## Editing the data

Edit **`backend/data/profile.json`**. This is the only file you need to change. The frontend uses the same file as its fallback, so the data always stays in sync. While the backend is running, changes are picked up immediately without a restart (hot-reload).

- `profile.avatar`: a photo URL/path (e.g. put `avatar.jpg` in `frontend/public/` and set `"/avatar.jpg"`). If empty, the initials are shown instead.
- `projects[].image`: set it to use a real screenshot. If empty, a generative visual is used.
- `projects[].color`: accent color of the project card.
- `projects[].category`: a single category (`"AI"`) or several (`["AI", "Web"]`). The project appears under each of its category filters.
- `projects[].type`: `"professional"` (work/client project) or `"personal"` (personal project). Shown as a badge on the card & detail view, plus a type filter above the project list.
- `projects[].links.demo` / `links.repo`: the **Live Demo** / **Source Code** buttons only appear when the link is filled in. Leave it empty (`""`) if there is none; if both are empty, the button area is hidden.
- `projects[].notice` (optional): a message shown when the project has no demo/repo link. If empty, `professional` projects without links automatically show a default notice explaining that the source code & system are confidential property of the company/client. The default text can be changed in `frontend/src/utils/project.js`.
- `skills[]`: each category holds a list of names, e.g. `{ "category": "Backend", "items": ["Golang", "Redis"] }`. One category = one orbit ring (looks best with 3–4 categories of 3–6 items each).
- `experience[].type`: `"work"` or `"education"`.
- If you add a new field to the JSON, add it to `backend/models.go` as well.

## Running (development)

Requires Node 18+ and Go 1.22+.

```bash
# Terminal 1: backend
cd backend
go run .

# Terminal 2: frontend
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. Vite proxies `/api` to `http://localhost:8080`.

## Production (single server)

```bash
cd frontend && npm run build
cd ../backend && go build -o portfolio && ./portfolio
```

The Go server serves both the API and the built frontend at http://localhost:8080.

### Backend environment variables

| Variable          | Default                                         | Description                                    |
| ----------------- | ----------------------------------------------- | ---------------------------------------------- |
| `PORT`            | `8080`                                          | Server port                                    |
| `DATA_FILE`       | `data/profile.json`                             | Location of the portfolio data                 |
| `STATIC_DIR`      | `../frontend/dist`                              | Frontend build folder                          |
| `ALLOWED_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173`   | CORS origins (comma-separated, `*` for all)    |

If the frontend is deployed separately (e.g. Vercel), set `VITE_API_URL=https://your-api.com` at build time and add the frontend domain to `ALLOWED_ORIGINS`.

## Docker

Multi-stage image: build frontend (Node) → build backend (Go) → distroless runtime (~15 MB, non-root).

```bash
# Using Docker Compose (recommended)
docker compose up -d --build
# open http://localhost:8080

docker compose logs -f      # view logs
docker compose down         # stop

# Or without Compose
docker build -t personal-portfolio .
docker run -d -p 8080:8080 --name portfolio personal-portfolio
```

- `profile.json` is baked into the image. After changing it, run `docker compose up -d --build` again. Or enable the `./backend/data:/app/data:ro` bind mount in `docker-compose.yml` so changes are picked up immediately.

## API

| Method | Endpoint                 | Description                                |
| ------ | ------------------------ | ------------------------------------------ |
| GET    | `/api/health`            | Server status                              |
| GET    | `/api/portfolio`         | All data                                   |
| GET    | `/api/profile`           | Profile                                    |
| GET    | `/api/skills`            | Skills                                     |
| GET    | `/api/experience`        | Experience                                 |
| GET    | `/api/projects`          | Projects (`?category=Web`, `?type=personal`, `?featured=true`) |
| GET    | `/api/projects/{id}`     | Project details                            |
