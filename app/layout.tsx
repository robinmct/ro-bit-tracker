import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: "Ro-bit — Habit Tracker",
  description: "A beautifully designed habit tracker for building better routines",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("antialiased font-sans", geist.variable)}>
        <ThemeProvider defaultTheme="dark" enableSystem={false}>
          <TooltipProvider>
            <div className="ambient-bg" aria-hidden="true" />
            {children}
          </TooltipProvider>
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: "rgba(15, 15, 26, 0.85)",
                border: "1px solid rgba(139, 92, 246, 0.15)",
                color: "#e2e8f0",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
