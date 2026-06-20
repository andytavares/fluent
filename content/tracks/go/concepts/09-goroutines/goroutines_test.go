package main

import (
	"reflect"
	"testing"
)

func TestConcurrentDouble(t *testing.T) {
	tests := []struct {
		nums []int
		want []int
	}{
		{[]int{1, 2, 3, 4, 5}, []int{2, 4, 6, 8, 10}},
		{[]int{0}, []int{0}},
		{[]int{}, []int{}},
		{[]int{-1, 0, 1}, []int{-2, 0, 2}},
	}
	for _, tt := range tests {
		got := ConcurrentDouble(tt.nums)
		if !reflect.DeepEqual(got, tt.want) {
			t.Errorf("ConcurrentDouble(%v) = %v, want %v", tt.nums, got, tt.want)
		}
	}
}
