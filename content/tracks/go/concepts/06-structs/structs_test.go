package main

import "testing"

func TestRectangleArea(t *testing.T) {
	tests := []struct {
		r    Rectangle
		want float64
	}{
		{Rectangle{Width: 4, Height: 3}, 12},
		{Rectangle{Width: 5, Height: 5}, 25},
		{Rectangle{Width: 0, Height: 10}, 0},
		{Rectangle{Width: 2.5, Height: 4}, 10},
	}
	for _, tt := range tests {
		if got := tt.r.Area(); got != tt.want {
			t.Errorf("Rectangle{%v,%v}.Area() = %v, want %v", tt.r.Width, tt.r.Height, got, tt.want)
		}
	}
}

func TestRectanglePerimeter(t *testing.T) {
	tests := []struct {
		r    Rectangle
		want float64
	}{
		{Rectangle{Width: 4, Height: 3}, 14},
		{Rectangle{Width: 5, Height: 5}, 20},
		{Rectangle{Width: 1, Height: 1}, 4},
	}
	for _, tt := range tests {
		if got := tt.r.Perimeter(); got != tt.want {
			t.Errorf("Rectangle{%v,%v}.Perimeter() = %v, want %v", tt.r.Width, tt.r.Height, got, tt.want)
		}
	}
}
