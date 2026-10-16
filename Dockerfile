# syntax=docker/dockerfile:1

# ---------- Stage 1: build frontend (React + Vite) and backend (Go) ----------
FROM golang:1.26-alpine AS build
RUN apk add --no-cache nodejs npm

# Frontend
WORKDIR /src/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
# Vite imports ../backend/data/profile.json as the offline fallback.
COPY backend/data/ /src/backend/data/
RUN npm run build

# Backend
WORKDIR /src/backend
COPY backend/go.mod ./
RUN go mod download
COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/server .

# ---------- Stage 2: minimal runtime ----------
FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /app
COPY --from=build /out/server /app/server
COPY --from=build /src/frontend/dist /app/public
COPY --chown=nonroot:nonroot backend/data/profile.json /app/data/profile.json

ENV PORT=8080 \
    DATA_FILE=/app/data/profile.json \
    STATIC_DIR=/app/public

EXPOSE 8080
USER nonroot:nonroot
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD ["/app/server", "healthcheck"]
ENTRYPOINT ["/app/server"]
