package main

import (
	"reflect"
	"testing"
	"time"
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

func TestGenerateChannelCloses(t *testing.T) {
	ch := Generate(1, 2)
	<-ch
	<-ch
	_, ok := <-ch
	if ok {
		t.Error("Generate channel should be closed after all values are drained")
	}
}

func TestGenerateDoesNotBlockCaller(t *testing.T) {
	done := make(chan struct{})
	go func() {
		Generate(1, 2, 3)
		close(done)
	}()
	select {
	case <-done:
	case <-time.After(time.Second):
		t.Error("Generate blocked the calling goroutine instead of returning immediately")
	}
}
