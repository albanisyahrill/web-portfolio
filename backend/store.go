package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"sync"
	"time"
)

// Store serves the portfolio document and hot-reloads it whenever the
// file on disk changes, so edits to profile.json need no restart.
type Store struct {
	path    string
	mu      sync.RWMutex
	data    *Portfolio
	modTime time.Time
}

func NewStore(path string) (*Store, error) {
	s := &Store{path: path}
	if _, err := s.Get(); err != nil {
		return nil, err
	}
	return s, nil
}

func (s *Store) Get() (*Portfolio, error) {
	info, err := os.Stat(s.path)
	if err != nil {
		s.mu.RLock()
		defer s.mu.RUnlock()
		if s.data != nil {
			return s.data, nil
		}
		return nil, fmt.Errorf("stat %s: %w", s.path, err)
	}

	s.mu.RLock()
	if s.data != nil && info.ModTime().Equal(s.modTime) {
		d := s.data
		s.mu.RUnlock()
		return d, nil
	}
	s.mu.RUnlock()

	s.mu.Lock()
	defer s.mu.Unlock()
	if s.data != nil && info.ModTime().Equal(s.modTime) {
		return s.data, nil
	}

	raw, err := os.ReadFile(s.path)
	if err != nil {
		if s.data != nil {
			return s.data, nil
		}
		return nil, fmt.Errorf("read %s: %w", s.path, err)
	}

	var p Portfolio
	if err := json.Unmarshal(raw, &p); err != nil {
		if s.data != nil {
			// Keep serving the last good version while the file is being edited.
			log.Printf("store: invalid JSON in %s, keeping previous data: %v", s.path, err)
			s.modTime = info.ModTime()
			return s.data, nil
		}
		return nil, fmt.Errorf("parse %s: %w", s.path, err)
	}

	s.data = &p
	s.modTime = info.ModTime()
	log.Printf("store: loaded %s (%d projects)", s.path, len(p.Projects))
	return s.data, nil
}
