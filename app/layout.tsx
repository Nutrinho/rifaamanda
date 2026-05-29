import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rifa Solidária | Amanda Lavínia",
  description: "Ajude a Amanda a viver sem dor participando da rifa solidária.",
  icons: {
    icon: "/favicon.png"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
