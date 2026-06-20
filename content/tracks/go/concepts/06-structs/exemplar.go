package main

import "fmt"

type Rectangle struct {
	Width  float64
	Height float64
}

func (r Rectangle) Area() float64 {
	return r.Width * r.Height
}

func (r Rectangle) Perimeter() float64 {
	return 2 * (r.Width + r.Height)
}

func main() {
	r := Rectangle{Width: 4, Height: 3}
	fmt.Printf("Area: %.1f\n", r.Area())
	fmt.Printf("Perimeter: %.1f\n", r.Perimeter())
}
