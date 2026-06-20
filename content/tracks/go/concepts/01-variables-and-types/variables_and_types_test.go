package main

import "testing"

func TestDescribe(t *testing.T) {
	tests := []struct {
		name  string
		age   int
		score float64
		want  string
	}{
		{"Alice", 30, 95.5, "name=Alice age=30 score=95.50"},
		{"Bob", 25, 100.0, "name=Bob age=25 score=100.00"},
		{"Carol", 0, 0.0, "name=Carol age=0 score=0.00"},
	}
	for _, tt := range tests {
		got := Describe(tt.name, tt.age, tt.score)
		if got != tt.want {
			t.Errorf("Describe(%q, %d, %f) = %q, want %q", tt.name, tt.age, tt.score, got, tt.want)
		}
	}
}

func TestVersion(t *testing.T) {
	if Version == "" {
		t.Error("Version constant must not be empty")
	}
}
