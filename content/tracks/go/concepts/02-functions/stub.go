package main

import (
	"fmt"
)

// Add returns the sum of a and b.
func Add(a, b int) int {
	// TODO: implement
	return 0
}

// Divide returns a/b, or an error if b is zero.
func Divide(a, b float64) (float64, error) {
	// TODO: implement
	return 0, nil
}

func main() {
	fmt.Println(Add(3, 4))

	result, err := Divide(10, 3)
	if err != nil {
		fmt.Println("Error:", err)
	} else {
		fmt.Printf("%.4f\n", result)
	}
}
