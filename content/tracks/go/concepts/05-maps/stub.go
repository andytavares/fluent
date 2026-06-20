package main

import (
	"fmt"
	"strings"
)

// WordCount returns a map of word frequencies in s.
func WordCount(s string) map[string]int {
	// TODO: split s by spaces and count each word
	_ = strings.Split // hint: use strings.Split(s, " ")
	return nil
}

func main() {
	counts := WordCount("the cat sat on the mat")
	fmt.Println(counts)
}
