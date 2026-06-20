package main

import (
	"fmt"
	"sync"
)

// ConcurrentDouble returns a new slice with each element doubled,
// computed concurrently using one goroutine per element.
func ConcurrentDouble(nums []int) []int {
	result := make([]int, len(nums))
	var wg sync.WaitGroup
	// TODO: for each index i, launch a goroutine that sets result[i] = nums[i] * 2
	// Use wg.Add(1) before launching, defer wg.Done() inside the goroutine
	_ = wg
	return result
}

func main() {
	nums := []int{1, 2, 3, 4, 5}
	fmt.Println(ConcurrentDouble(nums))
}
