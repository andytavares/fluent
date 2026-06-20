package main

import "fmt"

func Sum(nums []int) int {
	total := 0
	for _, n := range nums {
		total += n
	}
	return total
}

func Filter(nums []int, threshold int) []int {
	result := []int{}
	for _, n := range nums {
		if n > threshold {
			result = append(result, n)
		}
	}
	return result
}

func main() {
	nums := []int{1, 5, 3, 8, 2, 9}
	fmt.Println("Sum:", Sum(nums))
	fmt.Println("Filter > 4:", Filter(nums, 4))
}
