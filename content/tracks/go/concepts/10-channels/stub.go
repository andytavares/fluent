package main

import "fmt"

// Generate sends each number into a channel and returns it.
func Generate(nums ...int) <-chan int {
	ch := make(chan int)
	// TODO: launch a goroutine that sends each num into ch, then closes ch
	return ch
}

func main() {
	for v := range Generate(1, 2, 3, 4, 5) {
		fmt.Println(v)
	}
}
