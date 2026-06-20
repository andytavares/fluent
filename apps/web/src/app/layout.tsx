import type { Metadata } from "next";
import { TRPCProvider } from "@/lib/trpc/provider";
import { Navbar } from "@/components/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fluent — Learn Go",
  description: "Learn Go by building real things with instant sandbox execution and a capstone API project.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body className="flex flex-col h-dvh bg-[var(--color-surface-base)] text-[var(--color-text-primary)] antialiased">
        <TRPCProvider>
          <Navbar />
          <div className="flex-1 min-h-0 overflow-y-auto">
            {children}
          </div>
        </TRPCProvider>
      </body>
    </html>
  );
}
