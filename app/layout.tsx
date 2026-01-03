import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BagusBlog",
  description: "Dibuat dengan gabut dan kopi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Background utama ditaruh di sini biar konsisten se-aplikasi */}
          <div className="min-h-screen bg-white dark:bg-gray-950 text-black dark:text-white transition-colors duration-300">
            {children}
          </div>
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}