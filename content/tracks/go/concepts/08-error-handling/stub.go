package main

import (
	"fmt"
	"strconv"
)

// ParseAge parses a string as an age (0-150).
func ParseAge(s string) (int, error) {
	// TODO: use strconv.Atoi(s) to parse, then validate range
	_ = strconv.Atoi
	return 0, nil
}

func main() {
	ages := []string{"25", "-1", "200", "abc", "0", "150"}
	for _, s := range ages {
		age, err := ParseAge(s)
		if err != nil {
			fmt.Printf("ParseAge(%q): error: %v\n", s, err)
		} else {
			fmt.Printf("ParseAge(%q): %d\n", s, age)
		}
	}
}
