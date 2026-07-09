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

func TestDivideNegative(t *testing.T) {
	result, err := Divide(-9, 3)
	if err != nil {
		t.Fatalf("Divide(-9, 3) unexpected error: %v", err)
	}
	if result != -3.0 {
		t.Errorf("Divide(-9, 3) = %f, want -3.0", result)
	}
}

func TestDivideByZero(t *testing.T) {
	result, err := Divide(10, 0)
	if err == nil {
		t.Error("Divide(10, 0) expected error, got nil")
	}
	if result != 0 {
		t.Errorf("Divide(10, 0) result = %f, want 0", result)
	}
	if err != nil && err.Error() != "cannot divide by zero" {
		t.Errorf("Divide(10, 0) error message = %q, want %q", err.Error(), "cannot divide by zero")
	}
}
