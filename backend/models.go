package main

import (
	"encoding/json"
	"fmt"
	"strings"
)

// Portfolio is the whole document stored in data/profile.json.
type Portfolio struct {
	Profile    Profile      `json:"profile"`
	Skills     []SkillGroup `json:"skills"`
	Experience []Experience `json:"experience"`
	Projects   []Project    `json:"projects"`
}

type Profile struct {
	Name        string   `json:"name"`
	Alias       string   `json:"alias"`
	Initials    string   `json:"initials"`
	Roles       []string `json:"roles"`
	Tagline     string   `json:"tagline"`
	Bio         []string `json:"bio"`
	Location    string   `json:"location"`
	Coordinates string   `json:"coordinates"`
	Timezone    string   `json:"timezone"`
	Email       string   `json:"email"`
	Languages   []string `json:"languages"`
	Available   bool     `json:"available"`
	Avatar      string   `json:"avatar"`
	ResumeURL   string   `json:"resumeUrl"`
	Socials     []Social `json:"socials"`
	Stats       []Stat   `json:"stats"`
}

type Social struct {
	Name   string `json:"name"`
	Handle string `json:"handle"`
	URL    string `json:"url"`
}

type Stat struct {
	Label  string `json:"label"`
	Value  int    `json:"value"`
	Suffix string `json:"suffix"`
}

type SkillGroup struct {
	Category string   `json:"category"`
	Items    []string `json:"items"`
}

type Experience struct {
	Period      string   `json:"period"`
	Role        string   `json:"role"`
	Company     string   `json:"company"`
	Location    string   `json:"location"`
	Type        string   `json:"type"`
	Description string   `json:"description"`
	Highlights  []string `json:"highlights"`
	Tags        []string `json:"tags"`
}

type Project struct {
	ID          string       `json:"id"`
	Title       string       `json:"title"`
	Category    Categories   `json:"category"` // "AI" or ["AI", "Web"]
	Type        string       `json:"type"`     // "personal" or "professional"
	Year        int          `json:"year"`
	Summary     string       `json:"summary"`
	Description string       `json:"description"`
	Role        string       `json:"role"`
	Tech        []string     `json:"tech"`
	Color       string       `json:"color"`
	Image       string       `json:"image"`
	Featured    bool         `json:"featured"`
	Links       ProjectLinks `json:"links"`
	Notice      string       `json:"notice,omitempty"` // shown when there are no public links
	Metrics     []Metric     `json:"metrics"`
}

type ProjectLinks struct {
	Demo string `json:"demo"`
	Repo string `json:"repo"`
}

type Metric struct {
	Label string `json:"label"`
	Value string `json:"value"`
}

// Categories accepts either a single string or an array of strings in JSON,
// so older profile.json files keep working. It always marshals as an array.
type Categories []string

func (c *Categories) UnmarshalJSON(b []byte) error {
	var one string
	if err := json.Unmarshal(b, &one); err == nil {
		*c = nil
		if s := strings.TrimSpace(one); s != "" {
			*c = Categories{s}
		}
		return nil
	}
	var many []string
	if err := json.Unmarshal(b, &many); err != nil {
		return fmt.Errorf("category must be a string or an array of strings")
	}
	out := make(Categories, 0, len(many))
	for _, s := range many {
		if s = strings.TrimSpace(s); s != "" {
			out = append(out, s)
		}
	}
	*c = out
	return nil
}

func (c Categories) MarshalJSON() ([]byte, error) {
	if c == nil {
		return []byte("[]"), nil
	}
	return json.Marshal([]string(c))
}

// Has reports whether name matches any category, case-insensitively.
func (c Categories) Has(name string) bool {
	for _, s := range c {
		if strings.EqualFold(s, name) {
			return true
		}
	}
	return false
}
