package main

import (
	"fmt"
	"sync"
)

func ConcurrentDouble(nums []int) []int {
	result := make([]int, len(nums))
	var wg sync.WaitGroup
	_ = wg
	return result
}

func main() {
	nums := []int{1, 2, 3, 4, 5}
	fmt.Println(ConcurrentDouble(nums))
}
