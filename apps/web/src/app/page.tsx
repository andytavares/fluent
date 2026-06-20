import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[var(--color-surface-base)]">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[var(--color-border-subtle)]">
        <span className="text-lg font-semibold text-[var(--color-text-primary)]">Fluent</span>
        <div className="flex gap-3">
          <Link
            href="/auth/sign-in"
            className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            Sign in
          </Link>
          <Link
            href="/auth/sign-up"
            className="px-4 py-2 rounded-lg bg-[var(--color-interactive-primary)] text-sm font-medium text-[var(--color-interactive-primary-text)] hover:bg-[var(--color-interactive-primary-hover)]"
          >
            Get started
          </Link>
        </div>
      </nav>

      <section className="flex flex-1 flex-col items-center justify-center px-8 py-24 text-center">
        <h1 className="max-w-2xl text-5xl font-bold tracking-tight text-[var(--color-text-primary)]">
          Learn Go by building real things
        </h1>
        <p className="mt-6 max-w-xl text-lg text-[var(--color-text-secondary)]">
          Fluent teaches Go through structured lessons, instant sandbox execution, and a capstone
          project that uses a real database. Skip what you already know.
        </p>
        <div className="mt-10 flex gap-4">
          <Link
            href="/auth/sign-up"
            className="px-6 py-3 rounded-lg bg-[var(--color-interactive-primary)] text-base font-medium text-[var(--color-interactive-primary-text)] hover:bg-[var(--color-interactive-primary-hover)]"
          >
            Start for free
          </Link>
          <Link
            href="/tracks/go"
            className="px-6 py-3 rounded-lg border border-[var(--color-border-default)] text-base font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-raised)]"
          >
            Preview the Go track
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-6 px-8 pb-24">
        {[
          {
            title: "Adaptive placement",
            body: "Tell us your confidence level. We test you on concepts you claim to know and skip the rest.",
          },
          {
            title: "Run code instantly",
            body: "Every lesson has a live editor. Hit Ctrl+Enter to run your code. Results stream back in seconds.",
          },
          {
            title: "Capstone project",
            body: "Build a real Go CRUD API against a live ephemeral database. Verified step by step.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-raised)] p-6"
          >
            <h3 className="mb-2 text-base font-semibold text-[var(--color-text-primary)]">
              {card.title}
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)]">{card.body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
