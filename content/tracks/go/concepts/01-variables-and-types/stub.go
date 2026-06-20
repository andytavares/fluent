package main

import "fmt"

// Version is the application version.
const Version = ""

// Describe returns a formatted description of a person's stats.
func Describe(name string, age int, score float64) string {
	// TODO: return fmt.Sprintf("name=%s age=%d score=%.2f", ...)
	return ""
}

func main() {
	fmt.Println(Describe("Alice", 30, 95.5))
	fmt.Println("Version:", Version)
}
