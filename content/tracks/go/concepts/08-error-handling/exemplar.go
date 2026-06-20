package main

import (
	"fmt"
	"strconv"
)

func ParseAge(s string) (int, error) {
	age, err := strconv.Atoi(s)
	if err != nil {
		return 0, fmt.Errorf("invalid age %q: %w", s, err)
	}
	if age < 0 {
		return 0, fmt.Errorf("age cannot be negative")
	}
	if age > 150 {
		return 0, fmt.Errorf("age too large: max is 150")
	}
	return age, nil
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
