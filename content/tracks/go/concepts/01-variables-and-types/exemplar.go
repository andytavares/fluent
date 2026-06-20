package main

import "fmt"

const Version = "1.0.0"

func Describe(name string, age int, score float64) string {
	return fmt.Sprintf("name=%s age=%d score=%.2f", name, age, score)
}

func main() {
	fmt.Println(Describe("Alice", 30, 95.5))
	fmt.Println("Version:", Version)
}
