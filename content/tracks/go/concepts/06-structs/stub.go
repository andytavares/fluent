package main

import "fmt"

// Rectangle represents a rectangle with Width and Height.
type Rectangle struct {
	// TODO: add Width and Height fields (float64)
}

// Area returns the area of the rectangle.
func (r Rectangle) Area() float64 {
	// TODO: implement
	return 0
}

// Perimeter returns the perimeter of the rectangle.
func (r Rectangle) Perimeter() float64 {
	// TODO: implement
	return 0
}

func main() {
	r := Rectangle{Width: 4, Height: 3}
	fmt.Printf("Area: %.1f\n", r.Area())
	fmt.Printf("Perimeter: %.1f\n", r.Perimeter())
}
