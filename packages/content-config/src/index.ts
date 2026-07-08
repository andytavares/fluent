export const LANG_EXT: Record<string, string> = {
  go: "go",
  javascript: "js",
  typescript: "ts",
  c: "c",
  cpp: "cpp",
  java: "java",
  elixir: "ex",
  ruby: "rb",
  python: "py",
  shell: "sh",
  assembly: "asm",
  terraform: "tf",
  helm: "yaml",
  kotlin: "kt",
  rust: "rs",
};

// Java: match both SolutionTest.java (class-named) and _test.java (file-named) conventions
// Elixir: match both .exs and .ex test files
export const TEST_FILE_PATTERNS: Record<string, RegExp> = {
  go: /_test\.go$/,
  javascript: /_test\.js$/,
  typescript: /_test\.ts$/,
  c: /_test\.c$/,
  cpp: /_test\.cpp$/,
  java: /SolutionTest\.java$|_test\.java$/i,
  elixir: /_test\.exs?$/,
  ruby: /_test\.rb$/,
  python: /_test\.py$/,
  shell: /_test\.sh$/,
  assembly: /_test\.asm$/,
  terraform: /_test\.sh$/,
  helm: /_test\.sh$/,
  kotlin: /_test\.kt$/,
  rust: /_test\.rs$/,
};
