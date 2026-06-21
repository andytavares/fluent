import Link from "next/link";

const LANGUAGES = [
  { name: "Go", slug: "go", color: "#00ACD7" },
  { name: "Rust", slug: "rust", color: "#CE422B" },
  { name: "TypeScript", slug: "typescript", color: "#3178C6" },
  { name: "Python", slug: "python", color: "#F7C948" },
  { name: "C", slug: "c", color: "#A8B9CC" },
  { name: "C++", slug: "cpp", color: "#659AD2" },
  { name: "Java", slug: "java", color: "#ED8B00" },
  { name: "Kotlin", slug: "kotlin", color: "#7F52FF" },
  { name: "Ruby", slug: "ruby", color: "#CC342D" },
  { name: "Elixir", slug: "elixir", color: "#9B59B6" },
  { name: "JavaScript", slug: "javascript", color: "#F7DF1E" },
  { name: "Shell", slug: "shell", color: "#4EAA25" },
  { name: "Terraform", slug: "terraform", color: "#844FBA" },
  { name: "Helm", slug: "helm", color: "#0F1689" },
  { name: "Assembly", slug: "assembly", color: "#6E4C13" },
];

const FEATURES = [
  {
    eyebrow: "Placement",
    title: "Skip what you know.",
    body: "Tell us your level. We test you on the concepts you claim to know — code runs against real tests. Pass and move on. Fail and learn.",
  },
  {
    eyebrow: "Execution",
    title: "Code runs in your browser.",
    body: "Every lesson has a live editor. Hit Ctrl+Enter. Output streams back in seconds from an isolated sandbox.",
  },
  {
    eyebrow: "Structure",
    title: "10 concepts per language.",
    body: "Each track teaches the 10 things you actually need to be productive: types, functions, error handling, concurrency, and the key idioms.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[var(--color-surface-base)]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[var(--color-border-subtle)]">
        <span className="text-base font-semibold tracking-tight text-[var(--color-text-primary)]">
          Fluent
        </span>
        <div className="flex items-center gap-2">
          <Link
            href="/auth/sign-in"
            className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors rounded-lg"
          >
            Sign in
          </Link>
          <Link
            href="/auth/sign-up"
            className="px-4 py-2 rounded-lg bg-[var(--color-interactive-primary)] text-sm font-semibold text-[var(--color-interactive-primary-text)] hover:bg-[var(--color-interactive-primary-hover)] transition-colors"
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-8 pt-24 pb-20 max-w-4xl mx-auto">
        <p className="mb-5 text-xs font-mono tracking-widest text-[var(--color-interactive-primary)] uppercase">
          For engineers who already know how to code
        </p>
        <h1 className="text-5xl font-bold tracking-tight leading-[1.1] text-[var(--color-text-primary)] max-w-2xl">
          Skip what you know.{" "}
          <span className="text-[var(--color-interactive-primary)]">
            Master what you don't.
          </span>
        </h1>
        <p className="mt-6 text-lg text-[var(--color-text-secondary)] max-w-xl leading-relaxed">
          Fluent tests what you already know and places you in the right lesson.
          Then you write real code in a live editor with real test suites.
          No setup. No fluff. No re-explaining what a for loop is.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/auth/sign-up"
            className="px-6 py-3 rounded-lg bg-[var(--color-interactive-primary)] text-base font-semibold text-[var(--color-interactive-primary-text)] hover:bg-[var(--color-interactive-primary-hover)] transition-colors"
          >
            Pick a language →
          </Link>
          <Link
            href="/auth/sign-in"
            className="px-6 py-3 rounded-lg border border-[var(--color-border-default)] text-base font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-raised)] transition-colors"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Language grid */}
      <section className="border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)]/40 px-8 py-14">
        <div className="max-w-4xl mx-auto">
          <p className="mb-8 text-xs font-mono tracking-widest text-[var(--color-text-tertiary)] uppercase">
            {LANGUAGES.length} languages
          </p>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <span
                key={lang.slug}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-secondary)]"
              >
                <span
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: lang.color }}
                />
                {lang.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-24 max-w-4xl mx-auto">
        <div className="grid gap-12 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.eyebrow}>
              <p className="mb-3 text-xs font-mono tracking-widest text-[var(--color-interactive-primary)] uppercase">
                {f.eyebrow}
              </p>
              <h3 className="mb-2 text-lg font-semibold text-[var(--color-text-primary)]">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-[var(--color-border-subtle)] px-8 py-20 text-center">
        <h2 className="mb-4 text-2xl font-bold text-[var(--color-text-primary)]">
          Ready to get fluent?
        </h2>
        <p className="mb-8 text-sm text-[var(--color-text-secondary)]">
          Free to start. No credit card required.
        </p>
        <Link
          href="/auth/sign-up"
          className="inline-flex px-6 py-3 rounded-lg bg-[var(--color-interactive-primary)] text-base font-semibold text-[var(--color-interactive-primary-text)] hover:bg-[var(--color-interactive-primary-hover)] transition-colors"
        >
          Start for free →
        </Link>
      </section>
    </main>
  );
}
