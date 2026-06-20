package main

import (
	"reflect"
	"testing"
)

func TestGenerate(t *testing.T) {
	var got []int
	for v := range Generate(1, 2, 3, 4, 5) {
		got = append(got, v)
	}
	want := []int{1, 2, 3, 4, 5}
	if !reflect.DeepEqual(got, want) {
		t.Errorf("Generate(1..5) = %v, want %v", got, want)
	}
}

func TestGenerateEmpty(t *testing.T) {
	var got []int
	for v := range Generate() {
		got = append(got, v)
	}
	if len(got) != 0 {
		t.Errorf("Generate() should produce no values, got %v", got)
	}
}

func TestGenerateSingle(t *testing.T) {
	var got []int
	for v := range Generate(42) {
		got = append(got, v)
	}
	if !reflect.DeepEqual(got, []int{42}) {
		t.Errorf("Generate(42) = %v, want [42]", got)
	}
}
