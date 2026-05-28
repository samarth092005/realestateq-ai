import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "RealStateQ AI",
  description: "AI-powered real estate intelligence platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className}>
        <ThemeProvider>
          <Toaster position="top-right" />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}