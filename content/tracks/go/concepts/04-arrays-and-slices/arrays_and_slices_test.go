package main

import (
	"reflect"
	"testing"
)

func TestSum(t *testing.T) {
	tests := []struct {
		nums []int
		want int
	}{
		{[]int{1, 2, 3, 4, 5}, 15},
		{[]int{}, 0},
		{[]int{-1, -2, 3}, 0},
		{[]int{10}, 10},
	}
	for _, tt := range tests {
		if got := Sum(tt.nums); got != tt.want {
			t.Errorf("Sum(%v) = %d, want %d", tt.nums, got, tt.want)
		}
	}
}

func TestFilter(t *testing.T) {
	got := Filter([]int{1, 5, 3, 8, 2, 9}, 4)
	want := []int{5, 8, 9}
	if !reflect.DeepEqual(got, want) {
		t.Errorf("Filter([1,5,3,8,2,9], 4) = %v, want %v", got, want)
	}
}

func TestFilterEmpty(t *testing.T) {
	got := Filter([]int{1, 2, 3}, 10)
	if len(got) != 0 {
		t.Errorf("Filter with threshold above all values should return empty, got %v", got)
	}
}
