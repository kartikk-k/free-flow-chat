import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";
import "./globals.css";
import Provider from "./provider";
import { Analytics } from '@vercel/analytics/next';
import { ThemeProvider } from '@/components/ThemeProvider';


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Free Flow Chat",
  description: "Canvas based AI chat app with branching",
  openGraph: {
    title: "Free Flow Chat",
    description: "Canvas based AI chat app with branching",
    images: [
      {
        url: "/og-image.png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased`}
      >
        <Analytics />
        <ThemeProvider defaultTheme="light" storageKey="pod-ai-theme">
          <Provider>
            {children}
          </Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
