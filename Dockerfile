# syntax=docker/dockerfile:1

# ---------- Stage 1: build frontend (React + Vite) ----------
FROM node:24-alpine AS frontend
WORKDIR /src/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
# Vite imports ../backend/data/profile.json as the offline fallback.
COPY backend/data/ /src/backend/data/
RUN npm run build

# ---------- Stage 2: build backend (Go) ----------
FROM golang:1.26-alpine AS backend
WORKDIR /src
COPY backend/go.mod ./
RUN go mod download
COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/server .

# ---------- Stage 3: minimal runtime ----------
FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /app
COPY --from=backend /out/server /app/server
COPY --from=frontend /src/frontend/dist /app/public
COPY --chown=nonroot:nonroot backend/data/profile.json /app/data/profile.json

ENV PORT=8080 \
    DATA_FILE=/app/data/profile.json \
    STATIC_DIR=/app/public

EXPOSE 8080
USER nonroot:nonroot
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD ["/app/server", "healthcheck"]
ENTRYPOINT ["/app/server"]
