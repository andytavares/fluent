package main

import (
	"fmt"
	"strings"
)

func WordCount(s string) map[string]int {
	counts := make(map[string]int)
	for _, word := range strings.Split(s, " ") {
		if word != "" {
			counts[word]++
		}
	}
	return counts
}

func main() {
	counts := WordCount("the cat sat on the mat")
	fmt.Println(counts)
}
