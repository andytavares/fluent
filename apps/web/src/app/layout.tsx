import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { TRPCProvider } from "@/lib/trpc/provider";
import { Navbar } from "@/components/navbar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Fluent — Learn any language",
  description: "Fluent teaches programming languages to engineers who already know how to code. Skip what you know. Master what you don't.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className={`${inter.variable} ${jetbrainsMono.variable}`}>
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
