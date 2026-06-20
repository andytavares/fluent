package main

import "fmt"

func Generate(nums ...int) <-chan int {
	ch := make(chan int)
	go func() {
		for _, n := range nums {
			ch <- n
		}
		close(ch)
	}()
	return ch
}

func main() {
	for v := range Generate(1, 2, 3, 4, 5) {
		fmt.Println(v)
	}
}
