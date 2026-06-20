package main

import (
	"fmt"
	"math"
)

// Shape describes any 2D shape.
type Shape interface {
	Area() float64
	Perimeter() float64
}

// Circle represents a circle with a given radius.
type Circle struct {
	// TODO: add Radius field (float64)
}

// Area returns the area of the circle (π * r²).
func (c Circle) Area() float64 {
	// TODO: implement using math.Pi
	_ = math.Pi
	return 0
}

// Perimeter returns the circumference of the circle (2 * π * r).
func (c Circle) Perimeter() float64 {
	// TODO: implement
	return 0
}

func printShape(s Shape) {
	fmt.Printf("area=%.4f perimeter=%.4f\n", s.Area(), s.Perimeter())
}

func main() {
	c := Circle{Radius: 5}
	printShape(c)
}
