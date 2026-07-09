package main

import (
	"math"
	"testing"
)

const testoutEpsilon = 1e-9

func TestOutCircleArea(t *testing.T) {
	tests := []struct {
		radius float64
		want   float64
	}{
		{1, math.Pi},
		{5, math.Pi * 25},
		{0, 0},
		{2, math.Pi * 4},
		{10, math.Pi * 100},
	}
	for _, tt := range tests {
		c := Circle{Radius: tt.radius}
		got := c.Area()
		if math.Abs(got-tt.want) > testoutEpsilon {
			t.Errorf("Circle{%v}.Area() = %v, want %v", tt.radius, got, tt.want)
		}
	}
}

func TestOutCirclePerimeter(t *testing.T) {
	tests := []struct {
		radius float64
		want   float64
	}{
		{3, 2 * math.Pi * 3},
		{0, 0},
		{1, 2 * math.Pi},
	}
	for _, tt := range tests {
		c := Circle{Radius: tt.radius}
		got := c.Perimeter()
		if math.Abs(got-tt.want) > testoutEpsilon {
			t.Errorf("Circle{%v}.Perimeter() = %v, want %v", tt.radius, got, tt.want)
		}
	}
}

func TestOutCircleImplementsShape(t *testing.T) {
	var _ Shape = Circle{Radius: 1}
}

func TestOutPrintShapeAcceptsCircle(t *testing.T) {
	// printShape takes a Shape; passing a Circle must compile and not panic.
	printShape(Circle{Radius: 4})
}
