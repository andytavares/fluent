package main

import (
	"math"
	"testing"
)

const epsilon = 1e-9

func TestCircleArea(t *testing.T) {
	tests := []struct {
		radius float64
		want   float64
	}{
		{1, math.Pi},
		{5, math.Pi * 25},
		{0, 0},
		{2, math.Pi * 4},
	}
	for _, tt := range tests {
		c := Circle{Radius: tt.radius}
		got := c.Area()
		if math.Abs(got-tt.want) > epsilon {
			t.Errorf("Circle{%v}.Area() = %v, want %v", tt.radius, got, tt.want)
		}
	}
}

func TestCirclePerimeter(t *testing.T) {
	c := Circle{Radius: 3}
	want := 2 * math.Pi * 3
	got := c.Perimeter()
	if math.Abs(got-want) > epsilon {
		t.Errorf("Circle{3}.Perimeter() = %v, want %v", got, want)
	}
}

func TestCircleImplementsShape(t *testing.T) {
	var _ Shape = Circle{Radius: 1}
}

func TestCirclePerimeterZero(t *testing.T) {
	c := Circle{Radius: 0}
	if c.Perimeter() != 0 {
		t.Errorf("Circle{0}.Perimeter() = %v, want 0", c.Perimeter())
	}
}
