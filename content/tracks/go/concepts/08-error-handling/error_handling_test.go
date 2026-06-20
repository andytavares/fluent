package main

import "testing"

func TestParseAgeValid(t *testing.T) {
	tests := []struct {
		s    string
		want int
	}{
		{"0", 0},
		{"25", 25},
		{"150", 150},
	}
	for _, tt := range tests {
		got, err := ParseAge(tt.s)
		if err != nil {
			t.Errorf("ParseAge(%q) unexpected error: %v", tt.s, err)
		}
		if got != tt.want {
			t.Errorf("ParseAge(%q) = %d, want %d", tt.s, got, tt.want)
		}
	}
}

func TestParseAgeNegative(t *testing.T) {
	_, err := ParseAge("-1")
	if err == nil {
		t.Error("ParseAge(\"-1\") expected error, got nil")
	}
}

func TestParseAgeTooLarge(t *testing.T) {
	_, err := ParseAge("151")
	if err == nil {
		t.Error("ParseAge(\"151\") expected error, got nil")
	}
}

func TestParseAgeInvalidString(t *testing.T) {
	_, err := ParseAge("abc")
	if err == nil {
		t.Error("ParseAge(\"abc\") expected error, got nil")
	}
}
