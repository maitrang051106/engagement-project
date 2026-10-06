import type { Metadata } from "next";
import "./globals.css";
import { Web3Providers } from "@/components/Web3Providers";

export const metadata: Metadata = {
  title: "Engagement Project",
  description: "Cat wedding dApp demo for second-year Web3 students"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <Web3Providers>{children}</Web3Providers>
      </body>
    </html>
  );
}
