import Link from "next/link";
import { signIn } from "@/lib/auth";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-surface-base)]">
      <div className="w-full max-w-sm rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-raised)] p-8">
        <h1 className="mb-2 text-2xl font-semibold text-[var(--color-text-primary)]">
          Create your account
        </h1>
        <p className="mb-6 text-sm text-[var(--color-text-secondary)]">
          Start learning Go the right way.
        </p>

        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-lg bg-[var(--color-interactive-primary)] px-4 py-2.5 text-sm font-medium text-[var(--color-interactive-primary-text)] hover:bg-[var(--color-interactive-primary-hover)]"
          >
            Sign up with GitHub
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--color-border-subtle)]" />
          <span className="text-xs text-[var(--color-text-secondary)]">or</span>
          <div className="h-px flex-1 bg-[var(--color-border-subtle)]" />
        </div>

        <form
          action={async (formData: FormData) => {
            "use server";
            const email = formData.get("email") as string;
            await signIn("nodemailer", { email, redirectTo: "/dashboard" });
          }}
        >
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            required
            className="mb-3 w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-surface-base)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-border-focus)] focus:outline-none"
          />
          <button
            type="submit"
            className="w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-interactive-secondary)] px-4 py-2.5 text-sm font-medium text-[var(--color-interactive-secondary-text)] hover:bg-[var(--color-interactive-secondary-hover)]"
          >
            Sign up with email
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-[var(--color-text-secondary)]">
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="text-[var(--color-text-link)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
