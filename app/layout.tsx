import type { Metadata } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ProgressProvider } from "@/components/progress-provider";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Quant · AI Prep — The Green Book & Beyond",
    template: "%s · Quant·AI Prep",
  },
  description:
    "A curated, interactive study companion for quantitative finance and AI/ML interviews — from the classic 'Green Book' brainteasers to stochastic calculus, derivatives pricing, and the modern deep-learning stack.",
  keywords: [
    "quant interview",
    "quantitative finance",
    "green book",
    "machine learning interview",
    "stochastic calculus",
    "brainteasers",
    "Black-Scholes",
  ],
  authors: [{ name: "Quant·AI Prep" }],
  openGraph: {
    title: "Quant · AI Prep — The Green Book & Beyond",
    description:
      "Interactive prep for quant and AI/ML interviews: probability, stochastic calculus, pricing, and deep learning — with full worked solutions.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable} ${mono.variable}`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <ProgressProvider>
            <div className="flex min-h-screen flex-col">
              <Nav />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ProgressProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
