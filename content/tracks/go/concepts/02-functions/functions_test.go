package main

import "testing"

func TestAdd(t *testing.T) {
	tests := []struct{ a, b, want int }{
		{2, 3, 5},
		{0, 0, 0},
		{-1, 1, 0},
		{100, 200, 300},
	}
	for _, tt := range tests {
		if got := Add(tt.a, tt.b); got != tt.want {
			t.Errorf("Add(%d, %d) = %d, want %d", tt.a, tt.b, got, tt.want)
		}
	}
}

func TestDivide(t *testing.T) {
	result, err := Divide(10, 2)
	if err != nil {
		t.Fatalf("Divide(10, 2) unexpected error: %v", err)
	}
	if result != 5.0 {
		t.Errorf("Divide(10, 2) = %f, want 5.0", result)
	}
}

func TestDivideByZero(t *testing.T) {
	_, err := Divide(10, 0)
	if err == nil {
		t.Error("Divide(10, 0) expected error, got nil")
	}
}
