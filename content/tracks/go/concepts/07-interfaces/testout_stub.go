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
}

func (c Circle) Area() float64 {
	_ = math.Pi
	return 0
}

func (c Circle) Perimeter() float64 {
	return 0
}

func printShape(s Shape) {
	fmt.Printf("area=%.4f perimeter=%.4f\n", s.Area(), s.Perimeter())
}

func main() {
	c := Circle{Radius: 5}
	printShape(c)
}
