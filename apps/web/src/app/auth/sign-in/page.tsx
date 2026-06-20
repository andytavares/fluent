import { signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { randomBytes } from "node:crypto";

async function devLogin(formData: FormData) {
  "use server";
  if (process.env["NODE_ENV"] !== "development") return;

  const email = formData.get("email") as string;
  const callbackUrl = (formData.get("callbackUrl") as string | null) ?? "/dashboard";

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error(`No user found with email: ${email}. Run pnpm --filter @fluent/api db:seed`);

  const sessionToken = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: { sessionToken, userId: user.id, expires },
  });

  cookies().set("authjs.session-token", sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    expires,
    path: "/",
  });

  redirect(callbackUrl);
}

export default function SignInPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  const callbackUrl = searchParams.callbackUrl ?? "/dashboard";
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-surface-base)]">
      <div className="w-full max-w-sm rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-raised)] p-8">
        <h1 className="mb-6 text-2xl font-semibold text-[var(--color-text-primary)]">
          Sign in to Fluent
        </h1>

        <form
          action={async () => {
            "use server";
            await signIn("github");
          }}
        >
          <button
            type="submit"
            className="w-full rounded-lg bg-[var(--color-interactive-primary)] px-4 py-2.5 text-sm font-medium text-[var(--color-interactive-primary-text)] hover:bg-[var(--color-interactive-primary-hover)]"
          >
            Continue with GitHub
          </button>
        </form>

        {process.env["NODE_ENV"] === "development" && (
          <>
            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-[var(--color-border-subtle)]" />
              <span className="text-xs text-[var(--color-text-secondary)]">dev only</span>
              <div className="h-px flex-1 bg-[var(--color-border-subtle)]" />
            </div>

            <form action={devLogin}>
              <input type="hidden" name="callbackUrl" value={callbackUrl} />
              <input
                type="email"
                name="email"
                defaultValue="dev@fluent.local"
                required
                className="mb-3 w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-surface-base)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-border-focus)] focus:outline-none"
              />
              <button
                type="submit"
                className="w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-interactive-secondary)] px-4 py-2.5 text-sm font-medium text-[var(--color-interactive-secondary-text)] hover:bg-[var(--color-interactive-secondary-hover)]"
              >
                Sign in as dev user
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
