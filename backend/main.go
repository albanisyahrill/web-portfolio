package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"
)

func env(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}

// healthcheck lets minimal container images (no curl/wget) probe the server.
func healthcheck(port string) {
	client := &http.Client{Timeout: 3 * time.Second}
	res, err := client.Get("http://127.0.0.1:" + port + "/api/health")
	if err != nil || res.StatusCode != http.StatusOK {
		os.Exit(1)
	}
	os.Exit(0)
}

func main() {
	port := env("PORT", "8080")
	if len(os.Args) > 1 && os.Args[1] == "healthcheck" {
		healthcheck(port)
	}
	dataFile := env("DATA_FILE", filepath.Join("data", "profile.json"))
	staticDir := env("STATIC_DIR", filepath.Join("..", "frontend", "dist"))
	origins := strings.Split(env("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"), ",")

	store, err := NewStore(dataFile)
	if err != nil {
		log.Fatalf("store: %v", err)
	}

	api := &API{store: store}

	mux := http.NewServeMux()
	api.Register(mux)

	if info, err := os.Stat(filepath.Join(staticDir, "index.html")); err == nil && !info.IsDir() {
		mux.Handle("/", spa(staticDir))
		log.Printf("static: serving frontend from %s", staticDir)
	} else {
		mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
			writeJSON(w, http.StatusOK, map[string]string{
				"service": "NEURAL//OS portfolio API",
				"hint":    "Frontend has not been built yet. Run `npm run build` in the frontend folder or use the Vite dev server.",
			})
		})
	}

	var handler http.Handler = mux
	handler = cors(origins, handler)
	handler = securityHeaders(handler)
	handler = recoverer(handler)
	handler = logging(handler)

	srv := &http.Server{
		Addr:              ":" + port,
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	go func() {
		log.Printf("NEURAL//OS API online di http://localhost:%s", port)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("server: %v", err)
		}
	}()

	<-ctx.Done()
	log.Println("shutting down...")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("shutdown: %v", err)
	}
}
