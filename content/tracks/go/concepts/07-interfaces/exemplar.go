package main

import (
	"fmt"
	"math"
)

type Shape interface {
	Area() float64
	Perimeter() float64
}

type Circle struct {
	Radius float64
}

func (c Circle) Area() float64 {
	return math.Pi * c.Radius * c.Radius
}

func (c Circle) Perimeter() float64 {
	return 2 * math.Pi * c.Radius
}

func printShape(s Shape) {
	fmt.Printf("area=%.4f perimeter=%.4f\n", s.Area(), s.Perimeter())
}

func main() {
	c := Circle{Radius: 5}
	printShape(c)
}
