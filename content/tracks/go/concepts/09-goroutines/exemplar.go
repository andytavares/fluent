package main

import (
	"fmt"
	"sync"
)

func ConcurrentDouble(nums []int) []int {
	result := make([]int, len(nums))
	var wg sync.WaitGroup
	for i := range nums {
		wg.Add(1)
		go func(idx int) {
			defer wg.Done()
			result[idx] = nums[idx] * 2
		}(i)
	}
	wg.Wait()
	return result
}

func main() {
	nums := []int{1, 2, 3, 4, 5}
	fmt.Println(ConcurrentDouble(nums))
}
