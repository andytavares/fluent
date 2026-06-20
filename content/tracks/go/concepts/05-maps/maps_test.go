package main

import "testing"

func TestWordCount(t *testing.T) {
	got := WordCount("the cat sat on the mat")
	tests := map[string]int{
		"the": 2,
		"cat": 1,
		"sat": 1,
		"on":  1,
		"mat": 1,
	}
	for word, want := range tests {
		if got[word] != want {
			t.Errorf("WordCount: %q count = %d, want %d", word, got[word], want)
		}
	}
	if len(got) != len(tests) {
		t.Errorf("WordCount returned %d unique words, want %d", len(got), len(tests))
	}
}

func TestWordCountEmpty(t *testing.T) {
	got := WordCount("")
	if len(got) != 0 {
		t.Errorf("WordCount(\"\") should return empty map, got %v", got)
	}
}

func TestWordCountSingle(t *testing.T) {
	got := WordCount("hello")
	if got["hello"] != 1 {
		t.Errorf("WordCount(\"hello\")[\"hello\"] = %d, want 1", got["hello"])
	}
}
