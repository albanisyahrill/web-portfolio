package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"
)

type API struct {
	store *Store
}

func (a *API) Register(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/health", a.health)
	mux.HandleFunc("GET /api/portfolio", a.portfolio)
	mux.HandleFunc("GET /api/profile", a.profile)
	mux.HandleFunc("GET /api/skills", a.skills)
	mux.HandleFunc("GET /api/experience", a.experience)
	mux.HandleFunc("GET /api/projects", a.projects)
	mux.HandleFunc("GET /api/projects/{id}", a.project)
	mux.HandleFunc("/api/", func(w http.ResponseWriter, r *http.Request) {
		writeError(w, http.StatusNotFound, "Endpoint not found.")
	})
}

func (a *API) health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{"status": "online", "time": time.Now().UTC()})
}

func (a *API) load(w http.ResponseWriter) (*Portfolio, bool) {
	p, err := a.store.Get()
	if err != nil {
		log.Printf("store: %v", err)
		writeError(w, http.StatusInternalServerError, "Failed to load portfolio data.")
		return nil, false
	}
	return p, true
}

func (a *API) portfolio(w http.ResponseWriter, r *http.Request) {
	if p, ok := a.load(w); ok {
		writeJSON(w, http.StatusOK, p)
	}
}

func (a *API) profile(w http.ResponseWriter, r *http.Request) {
	if p, ok := a.load(w); ok {
		writeJSON(w, http.StatusOK, p.Profile)
	}
}

func (a *API) skills(w http.ResponseWriter, r *http.Request) {
	if p, ok := a.load(w); ok {
		writeJSON(w, http.StatusOK, p.Skills)
	}
}

func (a *API) experience(w http.ResponseWriter, r *http.Request) {
	if p, ok := a.load(w); ok {
		writeJSON(w, http.StatusOK, p.Experience)
	}
}

// projects supports ?category=Web, ?type=personal and ?featured=true filters.
func (a *API) projects(w http.ResponseWriter, r *http.Request) {
	p, ok := a.load(w)
	if !ok {
		return
	}
	category := r.URL.Query().Get("category")
	kind := r.URL.Query().Get("type")
	featuredOnly := r.URL.Query().Get("featured") == "true"

	out := make([]Project, 0, len(p.Projects))
	for _, pr := range p.Projects {
		if category != "" && !pr.Category.Has(category) {
			continue
		}
		if kind != "" && !strings.EqualFold(pr.Type, kind) {
			continue
		}
		if featuredOnly && !pr.Featured {
			continue
		}
		out = append(out, pr)
	}
	writeJSON(w, http.StatusOK, out)
}

func (a *API) project(w http.ResponseWriter, r *http.Request) {
	p, ok := a.load(w)
	if !ok {
		return
	}
	id := r.PathValue("id")
	for _, pr := range p.Projects {
		if pr.ID == id {
			writeJSON(w, http.StatusOK, pr)
			return
		}
	}
	writeError(w, http.StatusNotFound, "Project not found.")
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		log.Printf("encode response: %v", err)
	}
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}
